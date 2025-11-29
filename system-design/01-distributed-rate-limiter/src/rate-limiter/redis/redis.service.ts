import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Redis Service
 *
 * Manages Redis connection and Lua script execution for atomic rate limiting operations.
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;
  private scriptSha: string | null = null;

  constructor(private configService: ConfigService) {
    this.client = new Redis({
      host: this.configService.get('REDIS_HOST') || 'localhost',
      port: this.configService.get('REDIS_PORT') || 6379,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    // Handle connection events
    this.client.on('connect', () => {
      this.logger.log('✅ Connected to Redis');
    });

    this.client.on('error', (error) => {
      this.logger.error('❌ Redis connection error:', error);
    });
  }

  async onModuleInit() {
    // Load Lua script on module initialization
    await this.loadLuaScript();
  }

  async onModuleDestroy() {
    // Close Redis connection on module destruction
    await this.client.quit();
    this.logger.log('Redis connection closed');
  }

  /**
   * Load Lua script into Redis and cache the SHA
   * This allows faster execution using EVALSHA instead of EVAL
   */
  private async loadLuaScript(): Promise<void> {
    try {
      // Try multiple paths for compatibility (dev vs production)
      const possiblePaths = [
        join(process.cwd(), 'src', 'token-bucket.lua'), // Development
        join(process.cwd(), 'dist', 'token-bucket.lua'), // Production (copied by nest-cli)
        join(__dirname, '../../token-bucket.lua'), // Relative from compiled code
      ];

      // Find the first path that exists
      let foundPath: string | null = null;
      for (const path of possiblePaths) {
        if (existsSync(path)) {
          foundPath = path;
          break;
        }
      }

      if (!foundPath) {
        throw new Error(
          'Token bucket Lua script not found in any expected location',
        );
      }
      const scriptPath = foundPath;

      const luaScript = readFileSync(scriptPath, 'utf-8');

      const sha = await this.client.script('LOAD', luaScript);
      this.scriptSha = sha as string;
      this.logger.log(`✅ Rate limiter Lua script loaded: ${this.scriptSha}`);
    } catch (error) {
      this.logger.error('❌ Failed to load Lua script:', error);
      throw error;
    }
  }

  /**
   * Execute the token bucket Lua script atomically
   *
   * @param key - Redis key (e.g., "ratelimit:user:123")
   * @param capacity - Maximum tokens in bucket
   * @param refillRate - Tokens refilled per second
   * @param requested - Tokens to consume (usually 1)
   * @returns [allowed (1/0), remaining tokens, reset time in seconds]
   */
  async executeTokenBucketScript(
    key: string,
    capacity: number,
    refillRate: number,
    requested: number,
  ): Promise<[number, number, number]> {
    const now = Math.floor(Date.now() / 1000); // Unix timestamp in seconds

    try {
      // Try to use cached script SHA first (faster)
      if (this.scriptSha) {
        const result = await this.client.evalsha(
          this.scriptSha,
          1, // Number of keys
          key, // KEYS[1]
          capacity.toString(), // ARGV[1]
          refillRate.toString(), // ARGV[2]
          requested.toString(), // ARGV[3]
          now.toString(), // ARGV[4]
        );
        return result as [number, number, number];
      }
    } catch (error: any) {
      // If script not found, fallback to EVAL
      if (error.message && error.message.includes('NOSCRIPT')) {
        this.logger.warn('Script SHA not found, using EVAL');

        // Try multiple paths
        const possiblePaths = [
          join(process.cwd(), 'src', 'token-bucket.lua'),
          join(process.cwd(), 'dist', 'token-bucket.lua'),
          join(__dirname, '../../token-bucket.lua'),
        ];

        let foundPath: string | null = null;
        for (const path of possiblePaths) {
          if (existsSync(path)) {
            foundPath = path;
            break;
          }
        }

        if (!foundPath) {
          throw new Error('Token bucket Lua script not found');
        }
        const scriptPath = foundPath;

        const luaScript = readFileSync(scriptPath, 'utf-8');

        const result = await this.client.eval(
          luaScript,
          1,
          key,
          capacity.toString(),
          refillRate.toString(),
          requested.toString(),
          now.toString(),
        );
        return result as [number, number, number];
      }
      throw error;
    }

    throw new Error('Script SHA not available');
  }

  /**
   * Get current rate limit status from Redis
   */
  async getRateLimitStatus(key: string): Promise<{
    tokens: number;
    lastRefill: number | null;
  }> {
    const bucket = await this.client.hmget(key, 'tokens', 'lastRefill');

    return {
      tokens: bucket[0] ? parseInt(bucket[0]) : 0,
      lastRefill: bucket[1] ? parseInt(bucket[1]) : null,
    };
  }

  /**
   * Get Redis client (for advanced operations)
   */
  getClient(): Redis {
    return this.client;
  }
}
