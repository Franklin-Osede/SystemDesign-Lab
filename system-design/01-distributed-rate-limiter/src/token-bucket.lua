-- Token Bucket Rate Limiter Lua Script
-- This script runs atomically in Redis, preventing race conditions
-- when multiple API instances check rate limits simultaneously

-- KEYS[1]: Redis key (e.g., "ratelimit:user:123")
-- ARGV[1]: Capacity (maximum tokens, e.g., 100)
-- ARGV[2]: Refill rate (tokens per second, e.g., 10)
-- ARGV[3]: Tokens requested (usually 1)
-- ARGV[4]: Current timestamp (Unix seconds)

local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refillRate = tonumber(ARGV[2])
local requested = tonumber(ARGV[3])
local now = tonumber(ARGV[4])

-- Get current bucket state from Redis
local bucket = redis.call('HMGET', key, 'tokens', 'lastRefill')
local tokens = tonumber(bucket[1])
local lastRefill = tonumber(bucket[2])

-- If bucket doesn't exist, initialize it as full
if tokens == nil then
  tokens = capacity
  lastRefill = now
end

-- Calculate how much time has passed since last refill
local timePassed = math.max(0, now - lastRefill)

-- Calculate how many tokens to add (refill)
-- Formula: tokens_to_add = time_passed * refill_rate
local tokensToAdd = math.floor(timePassed * refillRate)

-- Add tokens, but don't exceed capacity
-- Formula: new_tokens = min(capacity, current_tokens + tokens_to_add)
local newTokens = math.min(capacity, tokens + tokensToAdd)

-- Check if we have enough tokens for this request
if newTokens >= requested then
  -- ✅ ALLOW: We have enough tokens
  -- Consume the requested tokens
  local remaining = newTokens - requested
  
  -- Update Redis with new state
  redis.call('HMSET', key, 'tokens', remaining, 'lastRefill', now)
  
  -- Set expiration (auto-cleanup after 1 hour of inactivity)
  redis.call('EXPIRE', key, 3600)
  
  -- Calculate when bucket will be full again (for retry-after header)
  local tokensNeeded = capacity - remaining
  local resetIn = math.ceil(tokensNeeded / refillRate)
  
  -- Return: [allowed=1, remaining_tokens, reset_time_seconds]
  return {1, remaining, resetIn}
else
  -- ❌ DENY: Not enough tokens
  -- Calculate how long to wait until enough tokens are available
  local tokensNeeded = requested - newTokens
  local waitTime = math.ceil(tokensNeeded / refillRate)
  
  -- Update lastRefill to prevent double-counting time
  redis.call('HMSET', key, 'tokens', newTokens, 'lastRefill', now)
  redis.call('EXPIRE', key, 3600)
  
  -- Return: [allowed=0, current_tokens, wait_time_seconds]
  return {0, newTokens, waitTime}
end
