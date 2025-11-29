import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RateLimiterService, RateLimitOptions } from './rate-limiter.service';

export const RATE_LIMIT_KEY = 'rateLimit';

/**
 * Rate Limit Decorator
 *
 * Usage:
 * @RateLimit({ capacity: 100, refillRate: 10 })
 * @Get('data')
 * getData() { ... }
 */
export const RateLimit = (options: RateLimitOptions) =>
  SetMetadata(RATE_LIMIT_KEY, options);

/**
 * Rate Limiter Guard
 *
 * Intercepts requests and checks rate limits before allowing them through.
 * Automatically adds rate limit headers to responses.
 */
@Injectable()
export class RateLimiterGuard implements CanActivate {
  constructor(
    private readonly rateLimiterService: RateLimiterService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Get rate limit options from decorator metadata
    const handler = context.getHandler();
    const options = this.reflector.get<RateLimitOptions>(
      RATE_LIMIT_KEY,
      handler,
    );

    // If no rate limit configured, allow request
    if (!options) {
      return true;
    }

    // Extract identifier (user ID, API key, or IP address)
    const identifier = this.extractIdentifier(request);

    // Check rate limit
    const result = await this.rateLimiterService.checkRateLimit(
      identifier,
      options,
    );

    // Add rate limit headers to response
    response.set({
      'X-RateLimit-Limit': (options.capacity || 100).toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': (Date.now() + result.resetIn * 1000).toString(),
    });

    if (!result.allowed) {
      // Rate limit exceeded
      throw new HttpException(
        {
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Try again in ${result.resetIn} seconds.`,
          retryAfter: result.resetIn,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  /**
   * Extract identifier from request
   * Priority: user ID > API key > IP address
   */
  private extractIdentifier(request: any): string {
    // From authentication middleware (if you have one)
    if (request.user?.id) {
      return `user:${request.user.id}`;
    }

    // From API key header
    if (request.headers['x-api-key']) {
      return `apikey:${request.headers['x-api-key']}`;
    }

    // From IP address
    const ip = request.ip || request.connection.remoteAddress || 'unknown';
    return `ip:${ip}`;
  }
}
