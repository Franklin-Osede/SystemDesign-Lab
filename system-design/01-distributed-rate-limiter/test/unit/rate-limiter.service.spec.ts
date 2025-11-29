/**
 * Rate Limiter Service Unit Tests
 *
 * TDD Approach: Write tests first, then implement
 *
 * Tests for:
 * - checkRateLimit method
 * - getRateLimitStatus method
 * - Token bucket algorithm logic
 * - Error handling
 */

import { Test, TestingModule } from '@nestjs/testing';
import { RateLimiterService } from '../../src/rate-limiter/rate-limiter.service';
import { RedisService } from '../../src/rate-limiter/redis/redis.service';

describe('RateLimiterService', () => {
  let service: RateLimiterService;

  const mockRedisService = {
    executeTokenBucketScript: jest.fn(),
    getRateLimitStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RateLimiterService,
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    service = module.get<RateLimiterService>(RateLimiterService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('checkRateLimit', () => {
    it('should allow request when tokens are available', async () => {
      // Arrange
      const identifier = 'user:123';
      const options = { capacity: 100, refillRate: 10, requested: 1 };

      mockRedisService.executeTokenBucketScript.mockResolvedValue([1, 95, 1]); // allowed, remaining, resetIn

      // Act
      const result = await service.checkRateLimit(identifier, options);

      // Assert
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(95);
      expect(result.resetIn).toBe(1);
      expect(mockRedisService.executeTokenBucketScript).toHaveBeenCalledWith(
        'ratelimit:user:123',
        100,
        10,
        1,
      );
    });

    it('should deny request when no tokens available', async () => {
      // Arrange
      const identifier = 'user:123';
      const options = { capacity: 100, refillRate: 10, requested: 1 };

      mockRedisService.executeTokenBucketScript.mockResolvedValue([0, 0, 5]); // denied, 0 remaining, wait 5 seconds

      // Act
      const result = await service.checkRateLimit(identifier, options);

      // Assert
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.resetIn).toBe(5);
    });

    it('should use default values when options not provided', async () => {
      // Arrange
      const identifier = 'user:123';

      mockRedisService.executeTokenBucketScript.mockResolvedValue([1, 99, 1]);

      // Act & Assert
      const result = await service.checkRateLimit(identifier);
      expect(result).toBeDefined();
      expect(mockRedisService.executeTokenBucketScript).toHaveBeenCalledWith(
        'ratelimit:user:123',
        100, // default capacity
        10, // default refillRate
        1, // default requested
      );
    });

    it('should fail open when Redis error occurs', async () => {
      // Arrange
      const identifier = 'user:123';
      const options = { capacity: 100, refillRate: 10 };

      mockRedisService.executeTokenBucketScript.mockRejectedValue(
        new Error('Redis connection failed'),
      );

      // Act & Assert - should allow request (fail open)
      const result = await service.checkRateLimit(identifier, options);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(100);
      expect(result.resetIn).toBe(0);
      expect(result).toBeDefined();
    });
  });

  describe('getRateLimitStatus error handling', () => {
    it('should throw error if Redis fails', async () => {
      const identifier = 'user:123';
      const options = { capacity: 100, refillRate: 10 };

      mockRedisService.getRateLimitStatus.mockRejectedValue(
        new Error('Redis connection failed'),
      );

      await expect(
        service.getRateLimitStatus(identifier, options),
      ).rejects.toThrow('Redis connection failed');
    });
  });

  describe('getRateLimitStatus', () => {
    it('should return rate limit status with tokens', async () => {
      // Arrange
      const identifier = 'user:123';
      const options = { capacity: 100, refillRate: 10 };

      const now = Math.floor(Date.now() / 1000);
      mockRedisService.getRateLimitStatus.mockResolvedValue({
        tokens: 50,
        lastRefill: now - 5, // 5 seconds ago
      });

      // Act
      const status = await service.getRateLimitStatus(identifier, options);

      // Assert
      expect(status).toBeDefined();
      expect(status.tokens).toBeGreaterThanOrEqual(50);
      expect(status.capacity).toBe(100);
      expect(status.refillRate).toBe(10);
      expect(status.lastRefill).toBeInstanceOf(Date);
    });

    it('should return full bucket when key does not exist', async () => {
      // Arrange
      const identifier = 'user:new';
      const options = { capacity: 100, refillRate: 10 };

      mockRedisService.getRateLimitStatus.mockResolvedValue({
        tokens: 0,
        lastRefill: null,
      });

      // Act
      const status = await service.getRateLimitStatus(identifier, options);

      // Assert
      expect(status.tokens).toBe(100); // Full bucket
      expect(status.lastRefill).toBeNull();
      expect(status.nextRefill).toBeNull();
    });

    it('should calculate tokens correctly after time passed', async () => {
      // Arrange
      const identifier = 'user:123';
      const options = { capacity: 100, refillRate: 10 };

      const fiveSecondsAgo = Math.floor(Date.now() / 1000) - 5;
      mockRedisService.getRateLimitStatus.mockResolvedValue({
        tokens: 50,
        lastRefill: fiveSecondsAgo,
      });

      // Act
      const status = await service.getRateLimitStatus(identifier, options);

      // Assert
      // 50 tokens + (5 seconds * 10 tokens/sec) = 100 tokens (capped at capacity)
      expect(status.tokens).toBe(100);
    });
  });
});
