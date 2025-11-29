import {
  Controller,
  Get,
  Post,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { RateLimiterService } from './rate-limiter.service';
import { RateLimiterGuard, RateLimit } from './rate-limiter.guard';

/**
 * Rate Limiter Controller
 *
 * Demonstrates different rate limiting strategies:
 * - Strict limits for sensitive endpoints (login)
 * - Normal limits for API endpoints
 * - Generous limits for public endpoints
 */
@ApiTags('rate-limiter')
@Controller()
export class RateLimiterController {
  constructor(private readonly rateLimiterService: RateLimiterService) {}

  /**
   * Test endpoint with moderate rate limit
   * Rate limit: 10 requests, 2 per second
   */
  @Get('test')
  @UseGuards(RateLimiterGuard)
  @RateLimit({ capacity: 10, refillRate: 2 })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Test endpoint with moderate rate limit' })
  @ApiResponse({
    status: 200,
    description: 'Request allowed',
  })
  @ApiResponse({
    status: 429,
    description: 'Rate limit exceeded',
  })
  @ApiHeader({
    name: 'x-api-key',
    required: false,
    description: 'API Key for rate limiting identification',
  })
  getTest(@Req() request: any) {
    return {
      message: 'Test endpoint - rate limit: 10 requests, 2/sec',
      timestamp: new Date().toISOString(),
      headers: {
        'X-RateLimit-Limit': request.headers['x-ratelimit-limit'],
        'X-RateLimit-Remaining': request.headers['x-ratelimit-remaining'],
        'X-RateLimit-Reset': request.headers['x-ratelimit-reset'],
      },
    };
  }

  /**
   * Login endpoint with strict rate limit
   * Rate limit: 5 attempts per minute
   * This prevents brute force attacks
   */
  @Post('login')
  @UseGuards(RateLimiterGuard)
  @RateLimit({ capacity: 5, refillRate: 1 / 60 }) // 1 token per 60 seconds
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login endpoint with strict rate limit (5 attempts/minute)',
  })
  @ApiResponse({
    status: 200,
    description: 'Login request processed',
  })
  @ApiResponse({
    status: 429,
    description: 'Too many login attempts',
  })
  login() {
    return {
      message: 'Login endpoint - strict rate limit (5 attempts per minute)',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Data endpoint with normal rate limit
   * Rate limit: 100 requests, 10 per second
   */
  @Get('data')
  @UseGuards(RateLimiterGuard)
  @RateLimit({ capacity: 100, refillRate: 10 })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Data endpoint with normal rate limit (100 requests, 10/sec)',
  })
  @ApiResponse({
    status: 200,
    description: 'Data retrieved successfully',
  })
  @ApiResponse({
    status: 429,
    description: 'Rate limit exceeded',
  })
  getData() {
    return {
      message: 'Data endpoint - normal rate limit (100 requests, 10/sec)',
      data: { example: 'some data' },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Public endpoint with generous rate limit
   * Rate limit: 1000 requests, 100 per second
   */
  @Get('public')
  @UseGuards(RateLimiterGuard)
  @RateLimit({ capacity: 1000, refillRate: 100 })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Public endpoint with generous rate limit (1000 requests, 100/sec)',
  })
  @ApiResponse({
    status: 200,
    description: 'Public data retrieved',
  })
  @ApiResponse({
    status: 429,
    description: 'Rate limit exceeded',
  })
  getPublic() {
    return {
      message: 'Public endpoint - generous rate limit',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Status endpoint: Check your current rate limit status
   * No rate limiting on this endpoint (for debugging)
   */
  @Get('rate-limit-status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Check current rate limit status for an identifier',
  })
  @ApiResponse({
    status: 200,
    description: 'Rate limit status retrieved',
    schema: {
      type: 'object',
      properties: {
        identifier: { type: 'string', example: 'user:123' },
        status: {
          type: 'object',
          properties: {
            allowed: { type: 'boolean', example: true },
            remaining: { type: 'number', example: 95 },
            resetIn: { type: 'number', example: 1 },
          },
        },
      },
    },
  })
  async getRateLimitStatus(@Req() request: any) {
    const identifier =
      request.headers['x-api-key'] || request.ip || 'anonymous';

    try {
      const status = await this.rateLimiterService.getRateLimitStatus(
        identifier,
        {
          capacity: 100,
          refillRate: 10,
        },
      );

      return {
        identifier,
        status,
      };
    } catch (error) {
      return {
        error: error.message,
      };
    }
  }
}
