/**
 * App Service Unit Tests
 *
 * Tests for:
 * - Health check service
 */

import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from '../../src/app.service';
import { RedisService } from '../../src/rate-limiter/redis/redis.service';

describe('AppService', () => {
  let service: AppService;

  const mockRedisService = {
    getClient: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  describe('getHealth', () => {
    it('should return health status with Redis connected', async () => {
      const mockClient = {
        ping: jest.fn().mockResolvedValue('PONG'),
      };
      mockRedisService.getClient.mockReturnValue(mockClient);

      const result = await service.getHealth();

      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('service', 'distributed-rate-limiter');
      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('redis');
      expect(result.redis).toEqual({
        connected: true,
        status: 'healthy',
      });
    });

    it('should return degraded status when Redis is disconnected', async () => {
      const mockClient = {
        ping: jest.fn().mockRejectedValue(new Error('Connection failed')),
      };
      mockRedisService.getClient.mockReturnValue(mockClient);

      const result = await service.getHealth();

      expect(result).toHaveProperty('status', 'degraded');
      expect(result.redis).toEqual({
        connected: false,
        status: 'disconnected',
      });
    });
  });
});
