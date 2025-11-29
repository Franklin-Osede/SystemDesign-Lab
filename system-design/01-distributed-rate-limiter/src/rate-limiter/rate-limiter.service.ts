import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from './redis/redis.service';

export interface RateLimitOptions {
  capacity?: number; // Maximum tokens (default: 100)
  refillRate?: number; // Tokens per second (default: 10)
  requested?: number; // Tokens to consume (default: 1)
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number; // Seconds until bucket is full again
}

export interface RateLimitStatus {
  tokens: number;
  capacity: number;
  refillRate: number;
  lastRefill: Date | null;
  nextRefill: Date | null;
}

/**
 * Rate Limiter Service
 *
 * Implements Token Bucket algorithm using Redis with Lua scripts for atomic operations.
 *
 * How it works:
 * 1. Each identifier (user, IP, API key) has a "bucket" of tokens
 * 2. Tokens refill at a constant rate (e.g., 10 tokens/second)
 * 3. Each request consumes 1 token
 * 4. If tokens available → allow request
 * 5. If no tokens → deny request (429)
 */
@Injectable()
export class RateLimiterService {
  private readonly logger = new Logger(RateLimiterService.name);

  constructor(private readonly redisService: RedisService) {}

  /**
   * Check if request should be allowed based on rate limit
   *
   * @param identifier - User ID, IP address, or API key
   * @param options - Rate limit configuration
   * @returns Rate limit result with allowed status and remaining tokens
   */
  async checkRateLimit(
    identifier: string,
    options: RateLimitOptions = {},
  ): Promise<RateLimitResult> {
    const {
      capacity = 100, // Maximum tokens in bucket
      refillRate = 10, // Tokens refilled per second
      requested = 1, // Tokens to consume per request
    } = options;

    const key = `ratelimit:${identifier}`;

    try {
      // Execute Lua script atomically
      // This prevents race conditions when multiple requests arrive simultaneously
      const [allowed, remaining, resetIn] =
        await this.redisService.executeTokenBucketScript(
          key,
          capacity,
          refillRate,
          requested,
        );

      return {
        allowed: allowed === 1,
        remaining: parseInt(remaining.toString()),
        resetIn: parseInt(resetIn.toString()),
      };
    } catch (error) {
      this.logger.error(`Rate limit check failed for ${identifier}:`, error);
      // Fail open: allow request if rate limiter fails
      // In production, you might want to fail closed
      return {
        allowed: true,
        remaining: capacity,
        resetIn: 0,
      };
    }
  }

  /**
   * Get current rate limit status for an identifier
   * Useful for debugging or showing users their current limit
   */
  async getRateLimitStatus(
    identifier: string,
    options: RateLimitOptions = {},
  ): Promise<RateLimitStatus> {
    const { capacity = 100, refillRate = 10 } = options;

    const key = `ratelimit:${identifier}`;

    try {
      const { tokens, lastRefill } =
        await this.redisService.getRateLimitStatus(key);

      if (lastRefill === null) {
        return {
          tokens: capacity,
          capacity,
          refillRate,
          lastRefill: null,
          nextRefill: null,
        };
      }

      const now = Math.floor(Date.now() / 1000);
      const timePassed = Math.max(0, now - lastRefill);
      const tokensToAdd = Math.floor(timePassed * refillRate);
      const currentTokens = Math.min(capacity, tokens + tokensToAdd);

      return {
        tokens: currentTokens,
        capacity,
        refillRate,
        lastRefill: new Date(lastRefill * 1000),
        nextRefill: new Date((lastRefill + 1) * 1000),
      };
    } catch (error) {
      this.logger.error(
        `Failed to get rate limit status for ${identifier}:`,
        error,
      );
      throw error;
    }
  }
}
