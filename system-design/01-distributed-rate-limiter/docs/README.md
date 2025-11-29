# Distributed Rate Limiter - NestJS + TypeScript

## 🎯 Overview

A **distributed rate limiter** built with **NestJS** and **TypeScript** that prevents API abuse by limiting the number of requests a user can make within a time window. This implementation uses the **Token Bucket Algorithm** with Redis for distributed coordination across multiple API instances.

**Tech Stack:**
- ✅ **NestJS** - Enterprise-grade Node.js framework
- ✅ **TypeScript** - Type-safe development
- ✅ **Redis** - Distributed state storage
- ✅ **Lua Scripts** - Atomic operations (no race conditions)

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start Redis
docker-compose up -d

# 3. Run in development mode
npm run start:dev

# 4. Test it
curl http://localhost:3000/api/test
```

---

## 📁 Project Structure

```
src/
├── main.ts                    # Application entry point
├── app.module.ts              # Root module
├── app.controller.ts          # Health check controller
├── app.service.ts             # Health check service
│
├── rate-limiter/              # Rate limiter module
│   ├── rate-limiter.module.ts
│   ├── rate-limiter.service.ts      # Core rate limiting logic
│   ├── rate-limiter.controller.ts   # API endpoints
│   ├── rate-limiter.guard.ts        # NestJS guard for rate limiting
│   │
│   └── redis/                 # Redis module
│       ├── redis.module.ts
│       └── redis.service.ts   # Redis connection & Lua script execution
│
└── token-bucket.lua           # Atomic rate limiting script
```

---

## 🎨 Architecture

### NestJS Architecture Benefits

1. **Modular Design** - Each feature is a module
2. **Dependency Injection** - Clean, testable code
3. **Guards** - Perfect for rate limiting (intercept requests)
4. **Decorators** - Clean, declarative syntax
5. **TypeScript** - Type safety and better IDE support

### How It Works

```
Request → Guard (Rate Limiter) → Controller → Service → Response
           │
           └─► Redis (Lua Script) → Check/Update Tokens
```

---

## 💻 Usage Examples

### 1. Using the Guard with Decorator

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { RateLimiterGuard, RateLimit } from './rate-limiter.guard';

@Controller('api')
export class MyController {
  @Get('data')
  @UseGuards(RateLimiterGuard)
  @RateLimit({ capacity: 100, refillRate: 10 })
  getData() {
    return { message: 'Data' };
  }
}
```

### 2. Different Limits for Different Endpoints

```typescript
// Strict limit for login
@Post('login')
@UseGuards(RateLimiterGuard)
@RateLimit({ capacity: 5, refillRate: 1 / 60 }) // 5 per minute
login() { ... }

// Normal limit for API
@Get('data')
@UseGuards(RateLimiterGuard)
@RateLimit({ capacity: 100, refillRate: 10 }) // 100, 10/sec
getData() { ... }

// Generous limit for public
@Get('public')
@UseGuards(RateLimiterGuard)
@RateLimit({ capacity: 1000, refillRate: 100 }) // 1000, 100/sec
getPublic() { ... }
```

### 3. Using the Service Directly

```typescript
import { RateLimiterService } from './rate-limiter.service';

constructor(private rateLimiter: RateLimiterService) {}

async checkLimit(userId: string) {
  const result = await this.rateLimiter.checkRateLimit(`user:${userId}`, {
    capacity: 100,
    refillRate: 10,
  });
  
  if (!result.allowed) {
    throw new Error('Rate limit exceeded');
  }
}
```

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

---

## 📊 API Endpoints

| Endpoint | Method | Rate Limit | Description |
|----------|--------|------------|-------------|
| `/api/health` | GET | None | Health check |
| `/api/test` | GET | 10 req, 2/sec | Test endpoint |
| `/api/login` | POST | 5 req, 1/min | Login (strict) |
| `/api/data` | GET | 100 req, 10/sec | Data endpoint |
| `/api/public` | GET | 1000 req, 100/sec | Public endpoint |
| `/api/rate-limit-status` | GET | None | Check your status |

---

## 🔧 Configuration

Create `.env` file:

```env
REDIS_HOST=localhost
REDIS_PORT=6379
PORT=3000
```

---

## 📈 Response Headers

Rate-limited endpoints include these headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699123456000
```

---

## 🎓 Why NestJS + TypeScript?

### NestJS Advantages:
- ✅ **Enterprise-ready** - Used by large companies
- ✅ **Modular** - Easy to organize code
- ✅ **Guards** - Perfect for rate limiting
- ✅ **Dependency Injection** - Testable code
- ✅ **TypeScript** - Type safety

### TypeScript Advantages:
- ✅ **Type Safety** - Catch errors at compile time
- ✅ **Better IDE Support** - Autocomplete, refactoring
- ✅ **Self-documenting** - Types explain the code
- ✅ **Refactoring** - Safe code changes

---

## 📚 Learn More

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Token Bucket Algorithm](https://en.wikipedia.org/wiki/Token_bucket)

---

> **Built with NestJS + TypeScript for enterprise-grade rate limiting!**
