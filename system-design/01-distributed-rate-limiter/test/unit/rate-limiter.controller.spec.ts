/**
 * Rate Limiter Controller Unit Tests
 *
 * Tests for:
 * - All controller endpoints
 * - Rate limit decorators
 * - Request handling
 */

import { Test, TestingModule } from '@nestjs/testing';
import { RateLimiterController } from '../../src/rate-limiter/rate-limiter.controller';
import { RateLimiterService } from '../../src/rate-limiter/rate-limiter.service';

describe('RateLimiterController', () => {
  let controller: RateLimiterController;
  let service: RateLimiterService;

  const mockRateLimiterService = {
    getRateLimitStatus: jest.fn(),
  };

  const createMockRequest = (overrides: any = {}) => ({
    headers: {
      'x-ratelimit-limit': '10',
      'x-ratelimit-remaining': '5',
      'x-ratelimit-reset': '1234567890',
      'x-api-key': overrides.apiKey || null,
      ...overrides.headers,
    },
    ip: overrides.ip || '127.0.0.1',
    ...overrides,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RateLimiterController],
      providers: [
        {
          provide: RateLimiterService,
          useValue: mockRateLimiterService,
        },
      ],
    }).compile();

    controller = module.get<RateLimiterController>(RateLimiterController);
    service = module.get<RateLimiterService>(RateLimiterService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTest', () => {
    it('should return test message with rate limit info', () => {
      const request = createMockRequest();
      const result = controller.getTest(request);

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('headers');
      expect(result.message).toContain('Test endpoint');
      expect(result.headers).toHaveProperty('X-RateLimit-Limit');
    });
  });

  describe('login', () => {
    it('should return login message', () => {
      const result = controller.login();

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('timestamp');
      expect(result.message).toContain('Login endpoint');
    });
  });

  describe('getData', () => {
    it('should return data message', () => {
      const result = controller.getData();

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('timestamp');
      expect(result.data).toHaveProperty('example');
    });
  });

  describe('getPublic', () => {
    it('should return public message', () => {
      const result = controller.getPublic();

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('timestamp');
      expect(result.message).toContain('Public endpoint');
    });
  });

  describe('getRateLimitStatus', () => {
    it('should return rate limit status successfully', async () => {
      const request = createMockRequest({ ip: '192.168.1.1' });
      const mockStatus = {
        tokens: 50,
        capacity: 100,
        refillRate: 10,
        lastRefill: new Date(),
        nextRefill: new Date(),
      };

      mockRateLimiterService.getRateLimitStatus.mockResolvedValue(mockStatus);

      const result = await controller.getRateLimitStatus(request);

      expect(result).toHaveProperty('identifier', '192.168.1.1');
      expect(result).toHaveProperty('status', mockStatus);
      expect(service.getRateLimitStatus).toHaveBeenCalledWith('192.168.1.1', {
        capacity: 100,
        refillRate: 10,
      });
    });

    it('should use API key as identifier if present', async () => {
      const request = createMockRequest({
        headers: { 'x-api-key': 'test-api-key' },
      });
      const mockStatus = {
        tokens: 50,
        capacity: 100,
        refillRate: 10,
        lastRefill: new Date(),
        nextRefill: new Date(),
      };

      mockRateLimiterService.getRateLimitStatus.mockResolvedValue(mockStatus);

      const result = await controller.getRateLimitStatus(request);

      expect(result).toHaveProperty('identifier', 'test-api-key');
      expect(service.getRateLimitStatus).toHaveBeenCalledWith('test-api-key', {
        capacity: 100,
        refillRate: 10,
      });
    });

    it('should use anonymous if no identifier found', async () => {
      const request = createMockRequest({
        headers: {},
        ip: undefined,
      });
      const mockStatus = {
        tokens: 50,
        capacity: 100,
        refillRate: 10,
        lastRefill: new Date(),
        nextRefill: new Date(),
      };

      mockRateLimiterService.getRateLimitStatus.mockResolvedValue(mockStatus);

      const result = await controller.getRateLimitStatus(request);

      expect(result).toHaveProperty('identifier', 'anonymous');
    });

    it('should handle errors gracefully', async () => {
      const request = createMockRequest();
      const error = new Error('Redis connection failed');

      mockRateLimiterService.getRateLimitStatus.mockRejectedValue(error);

      const result = await controller.getRateLimitStatus(request);

      expect(result).toHaveProperty('error', 'Redis connection failed');
    });
  });
});
