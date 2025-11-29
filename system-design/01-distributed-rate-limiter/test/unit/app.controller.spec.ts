/**
 * App Controller Unit Tests
 *
 * Tests for:
 * - Health check endpoint
 */

import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from '../../src/app.controller';
import { AppService } from '../../src/app.service';
import { RedisService } from '../../src/rate-limiter/redis/redis.service';

describe('AppController', () => {
  let controller: AppController;
  let service: AppService;

  const mockRedisService = {
    getClient: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    controller = module.get<AppController>(AppController);
    service = module.get<AppService>(AppService);
  });

  describe('getHealth', () => {
    it('should return health status', async () => {
      const mockClient = {
        ping: jest.fn().mockResolvedValue('PONG'),
      };
      mockRedisService.getClient.mockReturnValue(mockClient);

      const result = await controller.getHealth();
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('service');
      expect(result).toHaveProperty('redis');
    });

    it('should call service.getHealth', async () => {
      const mockClient = {
        ping: jest.fn().mockResolvedValue('PONG'),
      };
      mockRedisService.getClient.mockReturnValue(mockClient);

      const getHealthSpy = jest.spyOn(service, 'getHealth');
      await controller.getHealth();
      expect(getHealthSpy).toHaveBeenCalled();
      getHealthSpy.mockRestore();
    });
  });
});
