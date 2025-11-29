# 🎨 Visual Representation of the Architecture Diagram

## How the Diagram Looks:

```
                    ┌─────────────────────────────────────────────┐
                    │  Distributed Rate Limiter Architecture      │
                    └─────────────────────────────────────────────┘

    ┌──────────┐
    │  Client  │
    │ (Browser │
    │ /Mobile) │
    └────┬─────┘
         │
         │ HTTP Request
         │
         ▼
    ┌─────────────────────────────┐
    │    Load Balancer             │
    │    (AWS ALB)                 │
    │  - Routes requests           │
    │  - Health checks             │
    │  - SSL termination          │
    └───────┬─────────────────────┘
            │
      ┌─────┴─────┐
      │           │
      ▼           ▼
┌─────────────┐  ┌─────────────┐
│ API Server  │  │ API Server  │
│ Instance #1 │  │ Instance #2 │
│             │  │             │
│  NestJS     │  │  NestJS     │
│  + Rate     │  │  + Rate     │
│  Limiter    │  │  Limiter    │
└──────┬──────┘  └──────┬──────┘
       │                │
       │  Both check    │
       │  same Redis    │
       │                │
       └────────┬────────┘
                │
                │ Lua Script
                │ (Atomic)
                │
                ▼
       ┌──────────────────────┐
       │   Redis Cluster       │
       │                       │
       │ Key: ratelimit:user:123│
       │ Value: {              │
       │   tokens: 95,         │
       │   lastRefill: timestamp│
       │ }                     │
       │                       │
       │ Lua Script executes:  │
       │ 1. Read state         │
       │ 2. Calculate refill   │
       │ 3. Check tokens      │
       │ 4. Consume token     │
       │ 5. Update state       │
       │ 6. Return allow/deny  │
       └───────────┬───────────┘
                   │
                   │ Response
                   │
                   ▼
       ┌──────────────────────────┐
       │      Response            │
       │                          │
       │  200 OK                  │
       │  OR                       │
       │  429 Too Many Requests   │
       │                          │
       │  Headers:                 │
       │  X-RateLimit-Limit: 100   │
       │  X-RateLimit-Remaining: 94│
       │  X-RateLimit-Reset: time  │
       └──────────────────────────┘
```

## Color Coding:

- 🔵 **Client** - Light Blue
- 🟡 **Load Balancer** - Yellow
- 🔵 **API Instances** - Blue
- 🔴 **Redis Cluster** - Red/Pink
- 🟢 **Response** - Green

## Key Features Shown:

1. **Client** sends HTTP requests
2. **Load Balancer** distributes traffic
3. **Multiple API Instances** for scalability
4. **Redis Cluster** for shared state
5. **Lua Script** for atomic operations
6. **Response** with rate limit headers

