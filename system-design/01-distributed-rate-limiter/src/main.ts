import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Enable CORS if needed
  app.enableCors();

  // Global prefix for all routes
  app.setGlobalPrefix('api');

  // Swagger/OpenAPI Documentation
  const config = new DocumentBuilder()
    .setTitle('Distributed Rate Limiter API')
    .setDescription(
      'A distributed rate limiter implementation using Redis and Token Bucket algorithm. This API provides rate limiting capabilities across multiple instances.',
    )
    .setVersion('1.0.0')
    .addTag('rate-limiter', 'Rate limiting endpoints')
    .addTag('health', 'Health check endpoints')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-api-key',
        in: 'header',
        description: 'API Key for rate limiting identification',
      },
      'api-key',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Rate Limiter API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    logger.log('SIGTERM signal received: closing HTTP server');
    await app.close();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.log('SIGINT signal received: closing HTTP server');
    await app.close();
    process.exit(0);
  });

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  await app.listen(port);

  logger.log(`🚀 Rate Limiter API running on http://localhost:${port}`);
  logger.log(`📊 Health check: http://localhost:${port}/api/health`);
  logger.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  logger.log(`🧪 Test endpoint: http://localhost:${port}/api/test`);
  logger.log(
    `📈 Status endpoint: http://localhost:${port}/api/rate-limit-status`,
  );
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
