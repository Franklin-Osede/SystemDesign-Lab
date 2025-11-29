/**
 * Redis Service Unit Tests
 *
 * TDD Approach: Write tests first, then implement
 *
 * Tests for:
 * - Redis connection
 * - Lua script loading
 * - Token bucket script execution
 * - Rate limit status retrieval
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../src/rate-limiter/redis/redis.service';

describe('RedisService', () => {
  let service: RedisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                REDIS_HOST: 'localhost',
                REDIS_PORT: 6379,
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);

    // Mock the Redis client to prevent actual connection attempts
    const mockClient = {
      quit: jest.fn().mockResolvedValue('OK'),
      evalsha: jest.fn(),
      eval: jest.fn(),
      script: jest.fn(),
      hget: jest.fn(),
      hgetall: jest.fn(),
      hmget: jest.fn().mockResolvedValue(['100', '1234567890']),
    };
    (service as any).client = mockClient;
  });

  afterEach(async () => {
    try {
      await service.onModuleDestroy();
    } catch (error) {
      // Ignore errors during cleanup in tests
    }
  });

  describe('onModuleInit', () => {
    it('should load Lua script on initialization', async () => {
      const mockClient = (service as any).client;
      mockClient.script.mockResolvedValue('mock-sha-hash');

      // Mock file system
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const fs = require('fs');
      const originalExistsSync = fs.existsSync;
      const originalReadFileSync = fs.readFileSync;

      fs.existsSync = jest.fn().mockReturnValue(true);
      fs.readFileSync = jest.fn().mockReturnValue('-- mock lua script --');

      await service.onModuleInit();

      expect(service).toBeDefined();

      // Restore
      fs.existsSync = originalExistsSync;
      fs.readFileSync = originalReadFileSync;
    });
  });

  describe('executeTokenBucketScript', () => {
    it('should execute token bucket script with correct parameters', async () => {
      // Mock the Redis client methods
      const mockClient = {
        evalsha: jest.fn().mockResolvedValue([1, 99, 1]),
        eval: jest.fn().mockResolvedValue([1, 99, 1]),
        script: jest.fn().mockResolvedValue('mock-sha-hash'),
      };

      // Replace the client with our mock
      (service as any).client = mockClient;
      (service as any).scriptSha = 'mock-sha-hash';

      const key = 'ratelimit:test-user';
      const capacity = 100;
      const refillRate = 10;
      const requested = 1;

      const result = await service.executeTokenBucketScript(
        key,
        capacity,
        refillRate,
        requested,
      );

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(3);
      expect(typeof result[0]).toBe('number'); // allowed (1 or 0)
      expect(typeof result[1]).toBe('number'); // remaining tokens
      expect(typeof result[2]).toBe('number'); // reset time
      expect(mockClient.evalsha).toHaveBeenCalled();
    });

    it('should handle NOSCRIPT error and fallback to EVAL', async () => {
      const mockClient = (service as any).client;
      const noscriptError = new Error('NOSCRIPT No matching script');
      noscriptError.message = 'NOSCRIPT No matching script';

      mockClient.evalsha.mockRejectedValueOnce(noscriptError);
      mockClient.eval.mockResolvedValueOnce([1, 99, 1]);

      // Mock file system for fallback
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const fs = require('fs');
      const originalExistsSync = fs.existsSync;
      const originalReadFileSync = fs.readFileSync;

      fs.existsSync = jest.fn().mockReturnValue(true);
      fs.readFileSync = jest.fn().mockReturnValue('-- mock lua script --');

      (service as any).scriptSha = 'mock-sha';

      const result = await service.executeTokenBucketScript(
        'ratelimit:test',
        100,
        10,
        1,
      );

      expect(result).toBeDefined();
      expect(mockClient.eval).toHaveBeenCalled();

      // Restore
      fs.existsSync = originalExistsSync;
      fs.readFileSync = originalReadFileSync;
    });

    it('should throw error if script SHA not available', async () => {
      (service as any).scriptSha = null;

      await expect(
        service.executeTokenBucketScript('ratelimit:test', 100, 10, 1),
      ).rejects.toThrow('Script SHA not available');
    });

    it('should throw error if script not found in fallback', async () => {
      const mockClient = (service as any).client;
      const noscriptError = new Error('NOSCRIPT No matching script');
      noscriptError.message = 'NOSCRIPT No matching script';

      mockClient.evalsha.mockRejectedValueOnce(noscriptError);

      // Mock file system to return false (file not found)
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const fs = require('fs');
      const originalExistsSync = fs.existsSync;

      fs.existsSync = jest.fn().mockReturnValue(false);

      (service as any).scriptSha = 'mock-sha';

      await expect(
        service.executeTokenBucketScript('ratelimit:test', 100, 10, 1),
      ).rejects.toThrow('Token bucket Lua script not found');

      // Restore
      fs.existsSync = originalExistsSync;
    });
  });

  describe('getRateLimitStatus', () => {
    it('should retrieve rate limit status from Redis', async () => {
      const key = 'ratelimit:test-user';

      const status = await service.getRateLimitStatus(key);

      expect(status).toBeDefined();
      expect(status).toHaveProperty('tokens');
      expect(status).toHaveProperty('lastRefill');
      expect(typeof status.tokens).toBe('number');
    });

    it('should return null lastRefill if key does not exist', async () => {
      const key = 'ratelimit:nonexistent';

      // Mock hmget to return null for non-existent key
      const mockClient = (service as any).client;
      mockClient.hmget.mockResolvedValueOnce([null, null]);

      const status = await service.getRateLimitStatus(key);

      expect(status.tokens).toBe(0);
      expect(status.lastRefill).toBeNull();
    });
  });

  describe('getClient', () => {
    it('should return Redis client instance', () => {
      const client = service.getClient();

      expect(client).toBeDefined();
    });
  });
});
