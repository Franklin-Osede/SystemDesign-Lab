/**
 * Rate Limiter Guard Unit Tests
 *
 * TDD Approach: Write tests first, then implement
 *
 * Tests for:
 * - Guard activation
 * - Identifier extraction
 * - Rate limit checking
 * - Response headers
 * - 429 error handling
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RateLimiterGuard } from '../../src/rate-limiter/rate-limiter.guard';
import { RateLimiterService } from '../../src/rate-limiter/rate-limiter.service';

describe('RateLimiterGuard', () => {
  let guard: RateLimiterGuard;

  const mockRateLimiterService = {
    checkRateLimit: jest.fn(),
  };

  const mockReflector = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RateLimiterGuard,
        {
          provide: RateLimiterService,
          useValue: mockRateLimiterService,
        },
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<RateLimiterGuard>(RateLimiterGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should allow request when rate limit not configured', async () => {
      // Arrange
      mockReflector.get.mockReturnValue(undefined); // No rate limit config

      const context = createMockContext();

      // Act
      const result = await guard.canActivate(context);

      // Assert
      expect(result).toBe(true);
      expect(mockRateLimiterService.checkRateLimit).not.toHaveBeenCalled();
    });

    it('should allow request when tokens available', async () => {
      // Arrange
      const options = { capacity: 100, refillRate: 10 };
      mockReflector.get.mockReturnValue(options);
      mockRateLimiterService.checkRateLimit.mockResolvedValue({
        allowed: true,
        remaining: 95,
        resetIn: 1,
      });

      const context = createMockContext();

      // Act
      const result = await guard.canActivate(context);

      // Assert
      expect(result).toBe(true);
      expect(mockRateLimiterService.checkRateLimit).toHaveBeenCalled();

      // Check headers were set
      const response = context.switchToHttp().getResponse();
      expect(response.set).toHaveBeenCalledWith(
        expect.objectContaining({
          'X-RateLimit-Limit': '100',
          'X-RateLimit-Remaining': '95',
        }),
      );
    });

    it('should deny request when rate limit exceeded', async () => {
      // Arrange
      const options = { capacity: 100, refillRate: 10 };
      mockReflector.get.mockReturnValue(options);
      mockRateLimiterService.checkRateLimit.mockResolvedValue({
        allowed: false,
        remaining: 0,
        resetIn: 5,
      });

      const context = createMockContext();

      // Act & Assert
      await expect(guard.canActivate(context)).rejects.toThrow(HttpException);

      try {
        await guard.canActivate(context);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
        expect(error.getResponse()).toMatchObject({
          error: 'Too Many Requests',
          retryAfter: 5,
        });
      }
    });

    it('should extract identifier from user ID first', async () => {
      // Arrange
      const options = { capacity: 100, refillRate: 10 };
      mockReflector.get.mockReturnValue(options);
      mockRateLimiterService.checkRateLimit.mockResolvedValue({
        allowed: true,
        remaining: 95,
        resetIn: 1,
      });

      const context = createMockContext({
        user: { id: 'user-123' },
      });

      // Act
      await guard.canActivate(context);

      // Assert
      expect(mockRateLimiterService.checkRateLimit).toHaveBeenCalledWith(
        'user:user-123',
        options,
      );
    });

    it('should extract identifier from API key if no user', async () => {
      // Arrange
      const options = { capacity: 100, refillRate: 10 };
      mockReflector.get.mockReturnValue(options);
      mockRateLimiterService.checkRateLimit.mockResolvedValue({
        allowed: true,
        remaining: 95,
        resetIn: 1,
      });

      const context = createMockContext({
        headers: { 'x-api-key': 'api-key-123' },
      });

      // Act
      await guard.canActivate(context);

      // Assert
      expect(mockRateLimiterService.checkRateLimit).toHaveBeenCalledWith(
        'apikey:api-key-123',
        options,
      );
    });

    it('should extract identifier from IP if no user or API key', async () => {
      // Arrange
      const options = { capacity: 100, refillRate: 10 };
      mockReflector.get.mockReturnValue(options);
      mockRateLimiterService.checkRateLimit.mockResolvedValue({
        allowed: true,
        remaining: 95,
        resetIn: 1,
      });

      const context = createMockContext({
        ip: '192.168.1.1',
      });

      // Act
      await guard.canActivate(context);

      // Assert
      expect(mockRateLimiterService.checkRateLimit).toHaveBeenCalledWith(
        'ip:192.168.1.1',
        options,
      );
    });
  });

  // Helper function to create mock context
  function createMockContext(overrides: any = {}) {
    const request = {
      user: overrides.user || null,
      headers: overrides.headers || {},
      ip: overrides.ip || '127.0.0.1',
      connection: { remoteAddress: overrides.ip || '127.0.0.1' },
    };

    const response = {
      set: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    return {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
      getHandler: () => ({}),
    } as ExecutionContext;
  }
});
