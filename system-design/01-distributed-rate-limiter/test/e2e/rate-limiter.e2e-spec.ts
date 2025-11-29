/**
 * Rate Limiter E2E Tests
 *
 * TDD Approach: Write tests first, then implement
 *
 * Tests for:
 * - Full request flow
 * - Rate limiting behavior
 * - Multiple requests
 * - Different endpoints
 * - Error responses
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('RateLimiterController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Check', () => {
    it('GET /api/health should return 200', () => {
      return request(app.getHttpServer())
        .get('/api/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
        });
    });
  });

  describe('Test Endpoint', () => {
    it('GET /api/test should return 200 on first request', () => {
      return request(app.getHttpServer())
        .get('/api/test')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.headers).toHaveProperty('x-ratelimit-limit');
          expect(res.headers).toHaveProperty('x-ratelimit-remaining');
        });
    });

    it('GET /api/test should include rate limit headers', () => {
      return request(app.getHttpServer())
        .get('/api/test')
        .expect(200)
        .expect((res) => {
          expect(res.headers['x-ratelimit-limit']).toBe('10');
          expect(
            parseInt(res.headers['x-ratelimit-remaining']),
          ).toBeLessThanOrEqual(10);
        });
    });

    it('GET /api/test should return 429 after rate limit exceeded', async () => {
      // Make requests sequentially to avoid race conditions
      let lastResponse;
      for (let i = 0; i < 11; i++) {
        lastResponse = await request(app.getHttpServer()).get('/api/test');
      }

      // Last request should be 429
      expect(lastResponse.status).toBe(429);
      expect(lastResponse.body).toHaveProperty('error', 'Too Many Requests');
      expect(lastResponse.body).toHaveProperty('retryAfter');
    });
  });

  describe('Login Endpoint', () => {
    it('POST /api/login should have strict rate limit', async () => {
      // Make requests sequentially to avoid race conditions
      let lastResponse;
      for (let i = 0; i < 6; i++) {
        lastResponse = await request(app.getHttpServer()).post('/api/login');
      }

      // Last request should be 429
      expect(lastResponse.status).toBe(429);
    });
  });

  describe('Data Endpoint', () => {
    it('GET /api/data should allow requests within limit', async () => {
      // Use a unique API key to avoid rate limit conflicts
      const response = await request(app.getHttpServer())
        .get('/api/data')
        .set('x-api-key', 'test-data-endpoint-key');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.headers['x-ratelimit-limit']).toBe('100');
    });
  });

  describe('Rate Limit Status', () => {
    it('GET /api/rate-limit-status should return status', () => {
      return request(app.getHttpServer())
        .get('/api/rate-limit-status')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('identifier');
          expect(res.body).toHaveProperty('status');
          expect(res.body.status).toHaveProperty('tokens');
          expect(res.body.status).toHaveProperty('capacity');
          expect(res.body.status).toHaveProperty('refillRate');
        });
    });
  });
});
