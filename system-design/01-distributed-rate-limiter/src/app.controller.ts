import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2025-11-07T17:00:00.000Z' },
        service: { type: 'string', example: 'distributed-rate-limiter' },
        version: { type: 'string', example: '1.0.0' },
        uptime: { type: 'number', example: 3600 },
        redis: {
          type: 'object',
          properties: {
            connected: { type: 'boolean', example: true },
            status: { type: 'string', example: 'healthy' },
          },
        },
      },
    },
  })
  async getHealth() {
    return await this.appService.getHealth();
  }
}
