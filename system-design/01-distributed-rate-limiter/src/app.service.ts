import { Injectable } from '@nestjs/common';
import { RedisService } from './rate-limiter/redis/redis.service';

@Injectable()
export class AppService {
  constructor(private readonly redisService: RedisService) {}

  async getHealth() {
    const redisStatus = await this.checkRedisHealth();

    return {
      status: redisStatus.connected ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      service: 'distributed-rate-limiter',
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      redis: {
        connected: redisStatus.connected,
        status: redisStatus.status,
      },
    };
  }

  private async checkRedisHealth(): Promise<{
    connected: boolean;
    status: string;
  }> {
    try {
      const client = this.redisService.getClient();
      const result = await client.ping();
      return {
        connected: result === 'PONG',
        status: result === 'PONG' ? 'healthy' : 'unhealthy',
      };
    } catch (error) {
      return {
        connected: false,
        status: 'disconnected',
      };
    }
  }
}
