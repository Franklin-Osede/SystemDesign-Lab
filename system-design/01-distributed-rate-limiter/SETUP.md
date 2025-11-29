# Setup Instructions

## ⚠️ IMPORTANT: Install Dependencies First!

The TypeScript errors you're seeing are because **dependencies are not installed yet**.

## Quick Setup

```bash
# 1. Navigate to project directory
cd system-design/01-distributed-rate-limiter

# 2. Install all dependencies (THIS FIXES THE ERRORS)
npm install

# 3. Build the project
npm run build

# 4. Start Redis
docker-compose up -d

# 5. Run tests
npm run test:all

# 6. Start development server
npm run start:dev
```

## What `npm install` Does

When you run `npm install`, it:
- ✅ Downloads all packages from `package.json`
- ✅ Installs `@nestjs/common`, `@nestjs/core`, `ioredis`, etc.
- ✅ Installs TypeScript type definitions (`@types/node`, `@types/jest`)
- ✅ Creates `node_modules/` folder with all dependencies
- ✅ Creates `package-lock.json` to lock versions

## After Installation

Once `npm install` completes:
- ✅ TypeScript will find all `@nestjs/*` modules
- ✅ TypeScript will find `ioredis` module
- ✅ TypeScript will find Node.js built-in modules (`fs`, `path`)
- ✅ All errors should disappear

## Troubleshooting

If errors persist after `npm install`:

1. **Delete node_modules and reinstall:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Clear TypeScript cache:**
   ```bash
   rm -rf dist tsconfig.tsbuildinfo
   npm run build
   ```

3. **Restart your IDE/editor** to reload TypeScript server

## Why This Happens

TypeScript needs the actual packages installed to:
- Find type definitions
- Resolve module imports
- Provide autocomplete
- Check types correctly

Without `npm install`, TypeScript can't find the modules because they don't exist yet!


