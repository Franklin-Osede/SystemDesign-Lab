# Deployment Guide - Distributed Rate Limiter

## 📋 Prerequisites

Before deploying, ensure you have:

- ✅ Node.js 18+ installed
- ✅ Docker and Docker Compose installed
- ✅ Redis instance (local or remote)
- ✅ Environment variables configured

## 🚀 Local Development Deployment

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env`:
```env
REDIS_HOST=localhost
REDIS_PORT=6379
PORT=3000
NODE_ENV=development
```

### 3. Start Redis

```bash
docker-compose up -d
```

### 4. Run Tests

```bash
# Unit tests
npm run test

# E2E tests (requires Redis)
npm run test:e2e

# All tests
npm run test:all
```

### 5. Start Application

```bash
# Development mode (with hot reload)
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

### 6. Verify Deployment

```bash
# Health check
curl http://localhost:3000/api/health

# Test endpoint
curl http://localhost:3000/api/test
```

## 🐳 Docker Deployment

### Build Image

```bash
docker build -t distributed-rate-limiter:latest .
```

### Run Container

```bash
docker run -d \
  --name rate-limiter \
  -p 3000:3000 \
  -e REDIS_HOST=redis \
  -e REDIS_PORT=6379 \
  -e PORT=3000 \
  --link redis:redis \
  distributed-rate-limiter:latest
```

### Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## ☁️ Production Deployment

### Environment Variables

Required variables:
- `REDIS_HOST` - Redis server hostname
- `REDIS_PORT` - Redis server port (default: 6379)
- `PORT` - Application port (default: 3000)
- `NODE_ENV` - Environment (production, development, test)

Optional variables:
- `REDIS_PASSWORD` - Redis password (if required)
- `LOG_LEVEL` - Logging level (error, warn, log, debug, verbose)

### Health Checks

The application provides a health check endpoint:

```bash
GET /api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-06T23:00:00.000Z",
  "service": "distributed-rate-limiter",
  "version": "1.0.0",
  "uptime": 3600,
  "redis": {
    "connected": true,
    "status": "healthy"
  }
}
```

### Graceful Shutdown

The application handles `SIGTERM` and `SIGINT` signals gracefully:

- Closes HTTP server
- Closes Redis connections
- Exits cleanly

## 📊 Monitoring

### Health Check Endpoint

Monitor application health:

```bash
# Check health
curl http://localhost:3000/api/health

# Check rate limit status
curl http://localhost:3000/api/rate-limit-status
```

### Logs

Application logs include:
- Connection status
- Rate limit events
- Errors and warnings

## 🔧 Troubleshooting

### Redis Connection Issues

1. Verify Redis is running:
   ```bash
   redis-cli ping
   ```

2. Check environment variables:
   ```bash
   echo $REDIS_HOST
   echo $REDIS_PORT
   ```

3. Test connection:
   ```bash
   redis-cli -h $REDIS_HOST -p $REDIS_PORT ping
   ```

### Port Already in Use

If port 3000 is in use:

```bash
# Change PORT in .env
PORT=3001

# Or specify at runtime
PORT=3001 npm run start:dev
```

### Lua Script Not Found

If you see "Token bucket Lua script not found":

1. Verify script exists:
   ```bash
   ls -la src/token-bucket.lua
   ```

2. Rebuild application:
   ```bash
   npm run build
   ```

## 🚀 AWS Deployment (Future)

See `infra/` directory for AWS deployment scripts:

- Terraform configuration
- ECS Fargate deployment
- ElastiCache setup
- ALB configuration

## 📝 Deployment Checklist

Before deploying to production:

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Redis instance accessible
- [ ] Health check endpoint responding
- [ ] Logs configured
- [ ] Monitoring in place
- [ ] Graceful shutdown tested
- [ ] Backup strategy defined

---

**Last Updated**: 2025-11-06


