# 📁 Quick File Reference for Video Recording

Use this as a quick reference while recording. Each file has a one-sentence purpose.

---

## 🎯 Core Application Files

### `main.ts`
**Purpose:** Application entry point - bootstraps NestJS, sets up CORS, Swagger, and graceful shutdown.

### `app.module.ts`
**Purpose:** Root module that imports and wires together all application modules.

### `app.controller.ts`
**Purpose:** Handles the health check endpoint (`/api/health`).

### `app.service.ts`
**Purpose:** Provides health check logic, checking both app status and Redis connection.

---

## 🔒 Rate Limiter Module

### `rate-limiter.module.ts`
**Purpose:** Module that organizes all rate limiting components and exports services/guards.

### `rate-limiter.service.ts`
**Purpose:** Contains the business logic for rate limiting - calls Redis and handles results.

### `rate-limiter.guard.ts`
**Purpose:** NestJS guard that intercepts requests, checks rate limits, and throws 429 if exceeded.

### `rate-limiter.controller.ts`
**Purpose:** Controller with endpoints demonstrating different rate limiting strategies (test, login, data, public, status).

---

## 🔴 Redis Module

### `redis.module.ts`
**Purpose:** Module that provides Redis connection service to the application.

### `redis.service.ts`
**Purpose:** Manages Redis connection lifecycle, loads Lua script, and executes atomic operations.

### `token-bucket.lua`
**Purpose:** Atomic Lua script that implements the Token Bucket algorithm inside Redis (prevents race conditions).

---

## 🧪 Test Files

### `test/unit/redis.service.spec.ts`
**Purpose:** Unit tests for Redis service - connection, script loading, error handling.

### `test/unit/rate-limiter.service.spec.ts`
**Purpose:** Unit tests for rate limiter service business logic.

### `test/unit/rate-limiter.guard.spec.ts`
**Purpose:** Unit tests for the guard - request interception and header setting.

### `test/unit/app.controller.spec.ts` & `app.service.spec.ts`
**Purpose:** Unit tests for health check functionality.

### `test/unit/rate-limiter.controller.spec.ts`
**Purpose:** Unit tests for all rate limiter endpoints.

### `test/e2e/rate-limiter.e2e-spec.ts`
**Purpose:** End-to-end tests that test the full request flow with real Redis.

---

## 📊 Quick Stats to Mention

- **Total Files:** 11 source files + 7 test files
- **Lines of Code:** ~1,500 lines
- **Tests:** 41 tests (34 unit + 7 E2E)
- **Coverage:** 77.83%
- **Tech Stack:** NestJS, TypeScript, Redis, Lua

---

## 🎬 Recording Tips

1. **Start with diagram** - Draw/explain architecture first
2. **Group files logically** - Entry point → Modules → Services → Tests
3. **Show code highlights** - Don't read every line, highlight key parts
4. **Explain "why"** - Not just "what" each file does, but why it's structured that way
5. **Keep it concise** - 1-2 sentences per file is enough
6. **End with demo** - Postman testing is the visual payoff

---

## 📝 One-Liner for Each File (Quick Reference)

- `main.ts` → "Bootstraps the app and sets up Swagger"
- `app.module.ts` → "Root module that wires everything together"
- `app.controller.ts` → "Health check endpoint"
- `app.service.ts` → "Health check logic with Redis status"
- `rate-limiter.module.ts` → "Organizes rate limiter components"
- `rate-limiter.service.ts` → "Business logic for rate limiting"
- `rate-limiter.guard.ts` → "Intercepts requests and checks limits"
- `rate-limiter.controller.ts` → "Endpoints with different rate limits"
- `redis.module.ts` → "Provides Redis connection"
- `redis.service.ts` → "Manages Redis and executes Lua script"
- `token-bucket.lua` → "Atomic algorithm implementation"

