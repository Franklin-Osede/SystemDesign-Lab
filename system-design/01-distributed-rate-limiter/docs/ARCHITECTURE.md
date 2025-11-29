# Architecture Diagram - Distributed Rate Limiter

## 🎨 Complete Visual Architecture

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    DISTRIBUTED RATE LIMITER SYSTEM                │
└─────────────────────────────────────────────────────────────────┘

                    ┌─────────────┐
                    │   Client    │
                    │  (Browser/ │
                    │   Mobile)   │
                    └──────┬──────┘
                           │
                           │ HTTP Request
                           │ GET /api/data
                           ▼
        ┌───────────────────────────────────────┐
        │      Load Balancer (AWS ALB)           │
        │  - Routes requests to available APIs   │
        │  - Health checks                        │
        │  - SSL termination                     │
        └───────────────┬───────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
        ▼                               ▼
┌──────────────┐              ┌──────────────┐
│  API Server  │              │  API Server  │
│   Instance   │              │   Instance   │
│     #1       │              │     #2       │
│              │              │              │
│  Express.js  │              │  Express.js  │
│  + Rate      │              │  + Rate      │
│  Limiter     │              │  Limiter     │
│  Middleware  │              │  Middleware  │
└──────┬───────┘              └──────┬───────┘
       │                            │
       │  Both check same Redis     │
       │  for rate limit state      │
       │                            │
       └────────────┬───────────────┘
                    │
                    │ Redis Commands
                    │ (Lua Script)
                    ▼
        ┌───────────────────────────────┐
        │      Redis Cluster            │
        │                               │
        │  Key: "ratelimit:user:123"    │
        │  Value: {                     │
        │    tokens: 95,                │
        │    lastRefill: 1699123456     │
        │  }                            │
        │                               │
        │  Lua Script executes:         │
        │  1. Read current state        │
        │  2. Calculate refill         │
        │  3. Check tokens >= 1        │
        │  4. Consume token if yes      │
        │  5. Update state              │
        │  6. Return allow/deny        │
        └───────────────────────────────┘
                    │
                    │ Response
                    │ {allowed: true/false}
                    │
                    ▼
        ┌───────────────────────────────┐
        │      API Response              │
        │                                │
        │  200 OK (if allowed)           │
        │  OR                            │
        │  429 Too Many Requests         │
        │  (if denied)                   │
        │                                │
        │  Headers:                      │
        │  X-RateLimit-Limit: 100        │
        │  X-RateLimit-Remaining: 94     │
        │  X-RateLimit-Reset: timestamp  │
        └────────────────────────────────┘
```

---

## 🔄 Detailed Request Flow

### Step 1: Client Makes Request

```
Client → Load Balancer → API Instance #3
```

**What happens:**
- Client sends: `GET /api/data`
- Load balancer routes to available API instance
- Request arrives at API Instance #3

---

### Step 2: API Extracts Identifier

```
Request arrives at API
  ↓
Extract identifier:
  - User ID (from JWT token)
  - OR API Key (from header)
  - OR IP Address (fallback)
  ↓
Identifier: "user:123"
```

**Code:**
```javascript
const identifier = 
  req.user?.id ||                    // From auth middleware
  req.headers['x-api-key'] ||        // API key
  req.ip ||                          // IP address
  'anonymous';                       // Fallback
```

---

### Step 3: Rate Limiter Checks Redis

```
API Instance → Redis: Execute Lua Script
```

**Lua Script Execution (Atomic):**

```
┌─────────────────────────────────────────┐
│         Redis Lua Script (Atomic)         │
├─────────────────────────────────────────┤
│                                          │
│  1. Read current state:                  │
│     Key: "ratelimit:user:123"            │
│     tokens: 45                            │
│     lastRefill: 1699123400                │
│                                          │
│  2. Calculate time passed:                │
│     now = 1699123405                      │
│     timePassed = 5 seconds                │
│                                          │
│  3. Calculate tokens to add:              │
│     refillRate = 10 tokens/second         │
│     tokensToAdd = 5 × 10 = 50 tokens      │
│                                          │
│  4. Add tokens (don't exceed capacity):   │
│     newTokens = min(100, 45 + 50) = 95    │
│                                          │
│  5. Check if enough tokens:                │
│     requested = 1 token                   │
│     95 >= 1? YES ✓                        │
│                                          │
│  6. Consume token:                        │
│     remaining = 95 - 1 = 94 tokens        │
│                                          │
│  7. Update Redis:                         │
│     tokens: 94                            │
│     lastRefill: 1699123405                │
│                                          │
│  8. Return result:                        │
│     [allowed: 1, remaining: 94, resetIn: 1]│
│                                          │
└──────────────────────────────────────────┘
```

**Why Lua Script?**
- ✅ **Atomic:** All steps happen in one Redis command
- ✅ **No race conditions:** Redis executes completely before next command
- ✅ **Fast:** Runs inside Redis (no multiple network round-trips)

---

### Step 4: API Processes Response

```
Rate Limiter Result → API Decision
```

**If Allowed:**
```javascript
{
  allowed: true,
  remaining: 94,
  resetIn: 1  // seconds until full
}

→ Add headers to response
→ Process request normally
→ Return 200 OK
```

**If Denied:**
```javascript
{
  allowed: false,
  remaining: 0,
  resetIn: 5  // wait 5 seconds
}

→ Return 429 Too Many Requests
→ Include retry-after header
```

---

### Step 5: Response Sent to Client

```
API → Load Balancer → Client
```

**Success Response (200 OK):**
```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 94
X-RateLimit-Reset: 1699123406

{
  "message": "Data endpoint",
  "data": { ... }
}
```

**Rate Limited Response (429):**
```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1699123410
Retry-After: 5

{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Try again in 5 seconds.",
  "retryAfter": 5
}
```

---

## 🎯 Token Bucket Algorithm Visualization

### How Tokens Work Over Time

```
Time    Tokens    Action                    Result
─────────────────────────────────────────────────────
T0      100       Initial (full bucket)     ━━━━━━━━━━ (100)
T1      99        Request #1                ━━━━━━━━━░ (99)
T2      98        Request #2                ━━━━━━━━━░░ (98)
T3      97        Request #3                ━━━━━━━━░░░ (97)
...
T10     90        Request #10               ━━━━━━━░░░░ (90)
        │
        │ Refill: 10 tokens/second
        │ After 1 second: +10 tokens
        │
T11     100       Refilled (max capacity)    ━━━━━━━━━━ (100)
T12     99        Request #11               ━━━━━━━━━░ (99)
...
T50     50        Used 50 tokens             ━━━━━░░░░░░ (50)
        │
        │ Wait 5 seconds
        │ Refill: 5 × 10 = 50 tokens
        │
T55     100       Full again                 ━━━━━━━━━━ (100)
```

### Burst Traffic Example

```
User makes 100 requests in 1 second:

Time    Tokens    Requests    Result
─────────────────────────────────────────
T0      100       100         ✅ All allowed
T1      0         0           ❌ Next request denied
        │
        │ Wait 10 seconds
        │ Refill: 10 × 10 = 100 tokens
        │
T11     100       1           ✅ Allowed again
```

**Key Insight:** Token Bucket allows **burst traffic** (user can make 100 requests at once), then must wait for refill.

---

## 🔐 Race Condition Prevention

### Problem: Multiple Requests Simultaneously

**Without Lua Script (❌ Race Condition):**

```
Time    API #1              API #2              Redis State
─────────────────────────────────────────────────────────────
T0      Read: 10 tokens    Read: 10 tokens     10 tokens
        (both see 10)      (both see 10)
T1      Check: 10 >= 1 ✓  Check: 10 >= 1 ✓    10 tokens
T2      Write: 10-1=9     Write: 10-1=9       9 tokens (WRONG!)
                                                
Result: Both allowed, but should only allow 1!
        Lost 1 token due to race condition
```

**With Lua Script (✅ Atomic):**

```
Time    API #1              API #2              Redis State
─────────────────────────────────────────────────────────────
T0      Execute Lua         (waiting)           10 tokens
        (Redis locks)
T1      Lua: Read, Check,  (waiting)           9 tokens
        Consume, Write
        (all in one step)
T2      Returns: ALLOW     (waiting)           9 tokens
        (unlocks)
T3      (done)             Execute Lua         9 tokens
                           (Redis locks)
T4      (done)             Lua: Read, Check     8 tokens
                           Consume, Write
T5      (done)             Returns: ALLOW      8 tokens
                           (unlocks)

Result: Both processed correctly!
        No race condition, no lost tokens
```

**Why It Works:**
- Redis executes Lua scripts **atomically**
- Only one script runs at a time per key
- No interleaving of operations

---

## 📊 Scaling Architecture

### Single Instance

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ▼
┌─────────────┐      ┌─────────┐
│  API Server │◄────►│  Redis  │
│  (1 node)   │      │ (single)│
└─────────────┘      └─────────┘

Capacity: ~10K requests/second
```

### Horizontal Scaling

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Load Balancer  │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌──────┐  ┌──────┐  ┌──────┐
│ API  │  │ API  │  │ API  │  ... (N instances)
│  #1  │  │  #2  │  │  #3  │
└──┬───┘  └──┬───┘  └──┬───┘
   │         │         │
   └────┬────┴─────────┘
        │
        ▼
┌───────────────────┐
│   Redis Cluster   │
│  ┌───┐ ┌───┐ ┌───┐│
│  │ R │ │ R │ │ R ││  (3 nodes)
│  └───┘ └───┘ └───┘│
└───────────────────┘

Capacity: ~100K+ requests/second
```

---

## 🎓 Key Concepts Summary

1. **Token Bucket = Water Bucket**
   - Fills up over time
   - Each request takes 1 token
   - When empty, requests denied

2. **Distributed = Shared State**
   - All API instances check same Redis
   - Consistent rate limits across all servers

3. **Atomic = No Race Conditions**
   - Lua script runs completely before next command
   - No lost tokens, no double-counting

4. **Scalable = Add More Servers**
   - More API instances = more throughput
   - Redis cluster = more capacity

---

> **This architecture is advanced (distributed, atomic, production-ready) but the core concept (tokens = requests) is simple to understand!**

