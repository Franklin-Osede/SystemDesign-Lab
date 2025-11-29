# 🎨 Excalidraw Diagram Script

## Instructions for Drawing the Diagram

Follow these steps while recording to draw the architecture diagram in Excalidraw:

---

## Step 1: Title (0:00 - 0:10)

**Say:** "Let me start by drawing the architecture diagram for our Distributed Rate Limiter."

**Action:** 
- Write at the top: **"Distributed Rate Limiter Architecture"**
- Use large, bold font (size 28)

---

## Step 2: Draw Client (0:10 - 0:20)

**Say:** "First, we have the client - this could be a browser, mobile app, or any HTTP client making requests to our API."

**Action:**
- Draw a rectangle on the left side
- Fill color: Light blue (#a5d8ff)
- Add text inside: **"Client"**
- Position: Left side, middle height

---

## Step 3: Draw Load Balancer (0:20 - 0:35)

**Say:** "Requests go through a Load Balancer. In production, this would be AWS Application Load Balancer. It distributes traffic across multiple API instances for high availability and scalability."

**Action:**
- Draw a larger rectangle to the right of Client
- Fill color: Yellow (#ffd43b)
- Add text: **"Load Balancer"** (line 1), **"(AWS ALB)"** (line 2)
- Position: Center-left, slightly higher than Client

---

## Step 4: Draw Arrow from Client to Load Balancer (0:35 - 0:40)

**Say:** "The client sends HTTP requests to the load balancer."

**Action:**
- Draw arrow from Client to Load Balancer
- Add label: **"HTTP Request"**
- Arrow style: Solid line

---

## Step 5: Draw API Instance #1 (0:40 - 0:55)

**Say:** "The load balancer routes requests to available API instances. Let me draw the first API server instance running NestJS with our rate limiter middleware."

**Action:**
- Draw rectangle to the right of Load Balancer
- Fill color: Blue (#74c0fc)
- Add text (multi-line):
  - **"API Server"**
  - **"Instance #1"**
  - (blank line)
  - **"NestJS"**
  - **"+ Rate Limiter"**
- Position: Top-right of Load Balancer

---

## Step 6: Draw API Instance #2 (0:55 - 1:10)

**Say:** "We can have multiple instances for horizontal scaling. Here's a second instance. Both instances are identical and can handle requests independently."

**Action:**
- Draw another rectangle below Instance #1
- Same style and color as Instance #1
- Add text (multi-line):
  - **"API Server"**
  - **"Instance #2"**
  - (blank line)
  - **"NestJS"**
  - **"+ Rate Limiter"**

---

## Step 7: Draw Arrows from Load Balancer to API Instances (1:10 - 1:20)

**Say:** "The load balancer distributes requests across these instances based on availability and load."

**Action:**
- Draw arrow from Load Balancer to API Instance #1 (top)
- Draw arrow from Load Balancer to API Instance #2 (bottom)
- Both arrows: Solid lines

---

## Step 8: Draw Redis Cluster (1:20 - 1:40)

**Say:** "Now, here's the key component - the Redis cluster. This is what makes our rate limiting distributed. Both API instances connect to the same Redis cluster, so they share the same rate limit state. This means if a user hits the rate limit on one server, they're also rate limited on all other servers."

**Action:**
- Draw a large rectangle to the right of API instances
- Fill color: Red/Pink (#ff8787)
- Add text (multi-line, left-aligned):
  - **"Redis Cluster"**
  - (blank line)
  - **"Key: ratelimit:user:123"**
  - **"Value: {"**
  - **"  tokens: 95,"**
  - **"  lastRefill: timestamp"**
  - **"}"**
  - (blank line)
  - **"Lua Script:"**
  - **"Atomic Operation"**
- Position: Far right, vertically centered

---

## Step 9: Draw Arrows from API Instances to Redis (1:40 - 1:55)

**Say:** "When a request comes in, the API instance executes a Lua script in Redis. This script runs atomically - meaning it's executed completely before any other operation can interfere. This prevents race conditions even with thousands of concurrent requests."

**Action:**
- Draw arrow from API Instance #1 to Redis (top arrow)
- Draw arrow from API Instance #2 to Redis (bottom arrow)
- Add label on one arrow: **"Lua Script"**
- Arrow style: Solid lines

---

## Step 10: Draw Response Box (1:55 - 2:10)

**Say:** "After Redis processes the request, it returns whether the request is allowed or denied. The API then sends back either a 200 OK response with rate limit headers, or a 429 Too Many Requests if the limit was exceeded."

**Action:**
- Draw rectangle at the bottom-left
- Fill color: Green (#51cf66)
- Add text (multi-line, left-aligned):
  - **"Response:"**
  - **"200 OK or 429 Too Many Requests"**
  - (blank line)
  - **"Headers:"**
  - **"X-RateLimit-*"**
- Position: Bottom-left area

---

## Step 11: Draw Response Arrow (2:10 - 2:15)

**Say:** "The response flows back through the system to the client."

**Action:**
- Draw dashed arrow from Redis to Response box
- Arrow style: Dashed line (to show it's a return path)

---

## Step 12: Add Key Points Text Box (2:15 - 2:30)

**Say:** "Let me highlight the key points of this architecture."

**Action:**
- Draw a text box or add annotations:
  - **"✅ Distributed - Works across multiple servers"**
  - **"✅ Atomic - No race conditions (Lua scripts)"**
  - **"✅ Scalable - Add more instances as needed"**
- Position: Bottom-right or as annotations

---

## 🎯 Key Talking Points While Drawing

1. **Emphasize "Distributed"**: "This works across multiple servers - that's why it's called distributed rate limiting."

2. **Emphasize "Atomic"**: "The Lua script runs atomically in Redis, so there are no race conditions."

3. **Emphasize "Scalable"**: "We can add more API instances behind the load balancer to handle more traffic."

4. **Explain Token Bucket**: "The algorithm we use is called Token Bucket - think of it like a water bucket that fills up over time. Each request consumes one token."

5. **Explain Shared State**: "All servers check the same Redis, so the rate limit is consistent across all instances."

---

## 📝 Visual Tips

- Use **different colors** for each component type:
  - Client: Light blue
  - Load Balancer: Yellow
  - API Instances: Blue
  - Redis: Red/Pink
  - Response: Green

- Use **arrows** to show data flow:
  - Solid arrows for request flow
  - Dashed arrows for response flow

- Add **labels** to arrows to explain what's happening

- Keep **spacing consistent** and components aligned

- Use **larger font** for titles, **smaller font** for details

---

## ⏱️ Total Drawing Time: ~2:30 minutes

This gives you a complete visual representation of the architecture that you can reference throughout the rest of the video!

