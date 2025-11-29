# Distributed Rate Limiter - NestJS + TypeScript

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start Redis (required for E2E tests and running the app)
docker-compose up -d

# Run unit tests (no Redis required)
npm run test

# Run E2E tests (requires Redis)
npm run test:e2e

# Run all tests
npm run test:all

# Run in development mode
npm run start:dev

# Test the API
curl http://localhost:3000/api/test
```

## 📁 Project Structure

```
src/
├── main.ts                    # Application entry point
├── app.module.ts              # Root module
├── app.controller.ts          # Health check
├── app.service.ts
│
├── rate-limiter/              # Rate Limiter Module
│   ├── rate-limiter.module.ts
│   ├── rate-limiter.service.ts
│   ├── rate-limiter.controller.ts
│   ├── rate-limiter.guard.ts
│   └── redis/
│       ├── redis.module.ts
│       └── redis.service.ts
│
└── token-bucket.lua           # Atomic Lua script

test/
├── unit/                      # Unit tests
└── e2e/                       # E2E tests

docs/                          # Documentation
├── README.md                  # Detailed documentation
└── ARCHITECTURE.md            # Architecture diagrams
```

## 🧪 Testing (TDD)

This project follows **Test Driven Development**:

1. Write tests first
2. Run tests (they fail)
3. Implement code
4. Run tests (they pass)
5. Refactor

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

## 📚 Documentation

- [Detailed README](docs/README.md) - Complete documentation
- [Architecture](docs/ARCHITECTURE.md) - System architecture and diagrams
- [Deployment Guide](docs/DEPLOYMENT.md) - Step-by-step deployment instructions
- [Testing Summary](TESTING-SUMMARY.md) - Testing overview and coverage
- [Coverage Improvement](COVERAGE-IMPROVEMENT.md) - Coverage improvement details

### 📖 API Documentation (Swagger)

Once the application is running, access the interactive API documentation at:

```
http://localhost:3000/api/docs
```

The Swagger UI provides:
- Complete API endpoint documentation
- Request/response schemas
- Try-it-out functionality
- Rate limit examples

## 🛠️ Tech Stack

- **NestJS** - Enterprise Node.js framework
- **TypeScript** - Type-safe development
- **Redis** - Distributed state storage
- **Lua Scripts** - Atomic operations
- **Jest** - Testing framework
- **Swagger/OpenAPI** - API documentation

## 📊 API Endpoints

| Endpoint | Method | Rate Limit | Description |
|----------|--------|------------|-------------|
| `/api/health` | GET | None | Health check |
| `/api/test` | GET | 10 req, 2/sec | Test endpoint |
| `/api/login` | POST | 5 req, 1/min | Login (strict) |
| `/api/data` | GET | 100 req, 10/sec | Data endpoint |
| `/api/public` | GET | 1000 req, 100/sec | Public endpoint |
| `/api/rate-limit-status` | GET | None | Check status |

