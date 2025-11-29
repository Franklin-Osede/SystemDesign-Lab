import { Module } from '@nestjs/common';
import { RedisModule } from './redis/redis.module';
import { RateLimiterService } from './rate-limiter.service';
import { RateLimiterController } from './rate-limiter.controller';
import { RateLimiterGuard } from './rate-limiter.guard';

@Module({
  imports: [RedisModule],
  providers: [RateLimiterService, RateLimiterGuard],
  controllers: [RateLimiterController],
  exports: [RateLimiterService, RateLimiterGuard],
})
export class RateLimiterModule {}
