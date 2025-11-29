# 📹 LinkedIn Video Script - Distributed Rate Limiter

## 🎬 Introduction (0:00 - 0:30)

**Script:**
"Hey everyone! Today I'm going to walk you through a **Distributed Rate Limiter** I built using NestJS, TypeScript, and Redis. This is a production-ready system that can handle rate limiting across multiple server instances. Let me show you how it works!"

---

## 📊 Part 1: Architecture Overview with Excalidraw (0:30 - 2:00)

**Script:**
"First, let's understand the architecture. I'll draw it out for you."

### Drawing the Diagram - Step by Step:

1. **Draw Client Box**
   - "Here's our client - could be a browser, mobile app, or any HTTP client."

2. **Draw Load Balancer**
   - "Requests go through a Load Balancer - in production, this would be AWS ALB. It distributes traffic across multiple API instances."

3. **Draw Multiple API Instances**
   - "We have multiple API server instances running NestJS. This is how we scale horizontally. Each instance can handle requests independently."

4. **Draw Redis Cluster**
   - "But here's the key: all instances connect to the same Redis cluster. This is what makes our rate limiting **distributed** - all servers share the same rate limit state."

5. **Draw Arrows and Flow**
   - "When a request comes in, the API instance checks Redis using a Lua script. The Lua script executes atomically - meaning no race conditions, even with multiple concurrent requests."

6. **Add Token Bucket Visualization**
   - "The algorithm we use is called **Token Bucket**. Think of it like a water bucket that fills up over time. Each request consumes one token. When the bucket is empty, requests are denied with a 429 status."

**Key Points to Emphasize:**
- "This is **distributed** - works across multiple servers"
- "It's **atomic** - no race conditions thanks to Lua scripts"
- "It's **scalable** - add more API instances as needed"

---

## 📁 Part 2: File-by-File Explanation (2:00 - 8:00)

**Script:**
"Now let's dive into the code. I'll show you each file and explain its purpose."

### 2.1 Entry Point - `main.ts`

**Script:**
"This is our application entry point. It bootstraps the NestJS application, sets up CORS, configures the global API prefix, and most importantly, sets up Swagger documentation. Notice the graceful shutdown handlers - this ensures the app closes cleanly when receiving SIGTERM or SIGINT signals."

**Key Points:**
- Bootstrap NestJS app
- Enable CORS
- Set global prefix `/api`
- Setup Swagger at `/api/docs`
- Graceful shutdown handlers

---

### 2.2 Root Module - `app.module.ts`

**Script:**
"This is the root module. In NestJS, everything is organized into modules. This imports the RateLimiterModule and ConfigModule for environment variables. It's the foundation that wires everything together."

**Key Points:**
- Root module of the application
- Imports RateLimiterModule
- Imports ConfigModule for environment variables

---

### 2.3 Health Check - `app.controller.ts` & `app.service.ts`

**Script:**
"These files handle the health check endpoint. The controller receives the request, and the service checks both the application status and Redis connection. This is crucial for monitoring and load balancer health checks."

**Key Points:**
- Health check endpoint at `/api/health`
- Checks Redis connection status
- Returns service version and uptime

---

### 2.4 Rate Limiter Module - `rate-limiter.module.ts`

**Script:**
"This module encapsulates all rate limiting functionality. It imports the Redis module and exports the service and guard so other parts of the application can use them."

**Key Points:**
- Organizes rate limiter components
- Imports RedisModule
- Exports RateLimiterService and RateLimiterGuard

---

### 2.5 Redis Module - `redis.module.ts` & `redis.service.ts`

**Script:**
"The Redis module manages our connection to Redis. The service handles connection lifecycle, loads the Lua script on startup, and provides methods to execute the script. Notice how it handles the script SHA - if Redis doesn't have it cached, it falls back to using EVAL with the full script."

**Key Points:**
- Manages Redis connection
- Loads Lua script on module initialization
- Handles script caching (SHA)
- Fallback to EVAL if script not cached
- Connection event handlers (connect, error)

---

### 2.6 Token Bucket Algorithm - `token-bucket.lua`

**Script:**
"This is the heart of our rate limiter - the Lua script. It runs atomically inside Redis, which means no race conditions. Let me explain what it does:

1. It reads the current token count and last refill time
2. Calculates how many tokens to add based on time passed
3. Checks if there are enough tokens for the request
4. Consumes a token if allowed
5. Updates the state in Redis
6. Returns whether the request is allowed

This all happens in a single atomic operation - that's why it's safe even with thousands of concurrent requests."

**Key Points:**
- Atomic execution in Redis
- Token bucket algorithm implementation
- No race conditions
- Single network round-trip

---

### 2.7 Rate Limiter Service - `rate-limiter.service.ts`

**Script:**
"This service contains the business logic. It calls the Redis service to execute the Lua script, handles the response, and provides a clean interface for checking rate limits. It also has a method to get the current rate limit status without consuming a token - useful for debugging."

**Key Points:**
- Business logic for rate limiting
- Calls Redis service
- Handles rate limit results
- Provides status checking method

---

### 2.8 Rate Limiter Guard - `rate-limiter.guard.ts`

**Script:**
"This is a NestJS guard - it intercepts requests before they reach the controller. It extracts the identifier (API key, user ID, or IP address), gets the rate limit configuration from the decorator, calls the service, and either allows the request or throws a 429 error with proper headers."

**Key Points:**
- Intercepts requests
- Extracts identifier (API key, user ID, or IP)
- Gets rate limit config from decorator
- Calls rate limiter service
- Sets response headers (X-RateLimit-*)
- Throws 429 if rate limited

---

### 2.9 Rate Limiter Controller - `rate-limiter.controller.ts`

**Script:**
"This controller demonstrates different rate limiting strategies. We have:
- A test endpoint with moderate limits
- A login endpoint with strict limits to prevent brute force attacks
- A data endpoint with normal limits
- A public endpoint with generous limits
- A status endpoint to check your current rate limit

Each endpoint uses the `@RateLimit` decorator to specify its limits. Notice the Swagger decorators - they document the API automatically."

**Key Points:**
- Multiple endpoints with different rate limits
- Uses `@RateLimit` decorator
- Swagger documentation
- Different strategies for different use cases

---

## 🧪 Part 3: Testing Strategy (8:00 - 10:00)

**Script:**
"Now let's talk about testing. I followed Test-Driven Development, writing tests first, then implementing the code."

### 3.1 Unit Tests

**Script:**
"We have comprehensive unit tests for each component. Let me show you the structure:

- **redis.service.spec.ts** - Tests Redis connection, script loading, and error handling
- **rate-limiter.service.spec.ts** - Tests the business logic with mocked Redis
- **rate-limiter.guard.spec.ts** - Tests request interception and header setting
- **app.controller.spec.ts** & **app.service.spec.ts** - Test health check functionality
- **rate-limiter.controller.spec.ts** - Tests all endpoints

All unit tests use mocks, so they run fast and don't require Redis."

**Key Points:**
- 34 unit tests
- All use mocks
- Fast execution
- No external dependencies

---

### 3.2 E2E Tests

**Script:**
"End-to-end tests require a real Redis instance. They test the full flow - from HTTP request to Redis and back. We test:
- Successful rate limiting
- Rate limit exceeded scenarios
- Different rate limit configurations
- Status endpoint

These tests run against a real Redis instance, ensuring everything works together."

**Key Points:**
- 7 E2E tests
- Require Redis (Docker)
- Test full request flow
- Verify actual behavior

---

### 3.3 Test Coverage

**Script:**
"We achieved 77.83% code coverage, with 100% coverage on controllers and guards. This gives us confidence that the code works as expected."

**Key Points:**
- 77.83% overall coverage
- 100% controller coverage
- 86-100% service coverage

---

## 🚀 Part 4: Live Demo with Postman (10:00 - 12:00)

**Script:**
"Now let's see it in action! I'll use Postman to test the API."

### 4.1 Start the Application

**Script:**
"First, I'll start the application. Notice the logs showing Redis connection and the Swagger documentation URL."

---

### 4.2 Test Health Endpoint

**Script:**
"Let's check the health endpoint. It returns the service status and Redis connection status. Perfect - everything is healthy."

**Postman Actions:**
- GET `http://localhost:3000/api/health`
- Show response with Redis status

---

### 4.3 Test Rate Limiting - Normal Flow

**Script:**
"Now let's test the rate limiter. I'll send multiple requests to the test endpoint. Notice the headers - X-RateLimit-Limit, X-RateLimit-Remaining, and X-RateLimit-Reset. These tell the client how many requests they have left."

**Postman Actions:**
- GET `http://localhost:3000/api/test`
- Send 5-6 requests
- Show headers changing
- Show remaining tokens decreasing

---

### 4.4 Test Rate Limit Exceeded

**Script:**
"Let's keep sending requests until we hit the limit. There it is - 429 Too Many Requests! Notice the Retry-After header telling us when we can try again."

**Postman Actions:**
- Continue sending requests
- Show 429 response
- Highlight Retry-After header

---

### 4.5 Test Different Endpoints

**Script:**
"Let's test the login endpoint with its strict limit - only 5 requests per minute. This prevents brute force attacks. And here's the data endpoint with more generous limits."

**Postman Actions:**
- POST `http://localhost:3000/api/login`
- Show strict rate limiting
- GET `http://localhost:3000/api/data`
- Show normal rate limiting

---

### 4.6 Check Rate Limit Status

**Script:**
"Finally, let's check the rate limit status endpoint. This shows us the current state without consuming a token - useful for debugging."

**Postman Actions:**
- GET `http://localhost:3000/api/rate-limit-status`
- Show current status

---

### 4.7 Show Swagger Documentation

**Script:**
"Before we finish, let me show you the Swagger documentation. It's automatically generated from our code and provides an interactive API explorer."

**Browser Actions:**
- Open `http://localhost:3000/api/docs`
- Show Swagger UI
- Try an endpoint from Swagger

---

## 🎯 Part 5: Key Takeaways (12:00 - 12:30)

**Script:**
"To summarize what we built:

1. **Distributed Rate Limiter** - Works across multiple server instances
2. **Atomic Operations** - Lua scripts prevent race conditions
3. **Production Ready** - Health checks, graceful shutdown, error handling
4. **Well Tested** - 41 tests with 77% coverage
5. **Fully Documented** - Swagger API docs included

This is a real-world, production-ready implementation that you can deploy to AWS, GCP, or any cloud provider.

If you found this useful, give it a like and follow for more system design content! The code is available on GitHub - link in the comments."

---

## 📝 Notes for Recording

### Tips:
1. **Pace**: Speak clearly, don't rush
2. **Visuals**: Use screen recording, show code and Postman clearly
3. **Transitions**: Use simple transitions between sections
4. **Energy**: Stay enthusiastic and engaging
5. **Timing**: Aim for 12-13 minutes total

### What to Show:
- ✅ Excalidraw diagram (draw it live or show pre-made)
- ✅ Code files (highlight relevant parts)
- ✅ Terminal with tests running
- ✅ Postman with requests/responses
- ✅ Swagger UI in browser

### Postman Collection Setup:
Create a collection with:
- Health Check
- Test Endpoint (multiple requests)
- Login Endpoint
- Data Endpoint
- Rate Limit Status

---

**Total Estimated Time: 12-13 minutes**

