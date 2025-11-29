# System Design Lab – Distributed Systems Laboratory

Distributed systems design laboratory with multiple projects organized into three categories: System Design, Blockchain Design, and Microservices Spring Boot. Most projects have prepared structures and templates ready for implementation, with some fully implemented examples.

**TypeScript** **NestJS** **Redis** **Spring Boot** **Blockchain** **AWS** **Docker** **Terraform**

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Project Categories](#-project-categories)
- [Getting Started](#-getting-started)
- [Development](#-development)
- [Deployment](#-deployment)
- [Testing](#-testing)
- [Documentation](#-documentation)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**System Design Lab** is an educational and practical repository designed to master distributed systems design through real project implementations. The repository contains multiple planned projects organized into three categories. **Most projects are not yet implemented** - they have prepared structures and templates ready for implementation.

### Current Project Status

✅ **Fully Implemented Projects** (Examples): 
- `01-distributed-rate-limiter` - Complete system with NestJS, Redis, E2E tests (77.83% coverage), complete documentation, and diagrams

📋 **Projects with Prepared Structure Only** (Not Implemented): 
- Most projects in the repository
- Standard folder structure (docs/, infra/, scripts/)
- README with architecture template
- **No source code yet** - ready for implementation

### Key Features

✅ **Three Specialized Categories**: System Design, Blockchain, and Microservices

✅ **Consistent Structure**: Each project follows the same organization pattern

✅ **Base Documentation**: Templates and guides for architecture and deployment

✅ **Clear Roadmap**: Prioritized implementation plan in `docs/prioritized-projects.md`

⚠️ **Important Note**: Most projects are **not yet implemented** - they contain structure templates and documentation placeholders. Only fully implemented projects (like `01-distributed-rate-limiter`) contain complete source code, tests, and deployment configurations.

---

## 🏗️ Architecture

### General Laboratory Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    SYSTEM DESIGN LAB                              │
│              Distributed Systems Laboratory                      │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  System Design   │  │ Blockchain Design │  │ Microservices    │
│   (projects)     │  │  (projects)       │  │ Spring Boot      │
│                  │  │                  │  │ (projects)       │
│  • Rate Limiter  │  │  • Explorer      │  │  • API Gateway   │
│  • Load Balancer │  │  • AMM Uniswap   │  │  • Service Reg.  │
│  • Caching       │  │  • Oracle        │  │  • Auth Service  │
│  • URL Shortener │  │  • Bridge        │  │  • Order Service │
│  • Message Queue │  │  • Lending       │  │  • Payment       │
│  • News Feed     │  │  • Staking       │  │  • Billing       │
│  • Real-time Chat│  │  • Flashloan     │  │  • ...           │
│  • Circuit Breaker│ │  • NFT Market    │  │                  │
│  • Video Stream  │  │  • ERC-4337      │  │                  │
│                  │  │  • ZK-Rollup     │  │                  │
└──────────────────┘  └──────────────────┘  └──────────────────┘

                    ┌──────────────────────┐
                    │  Infrastructure      │
                    │  • AWS (ALB, ECS)    │
                    │  • Docker/K8s        │
                    │  • Terraform         │
                    │  • CI/CD (GitHub)    │
                    └──────────────────────┘
```

### Technology Stack

#### System Design
- **Backend**: NestJS, TypeScript, Node.js
- **Cache/Database**: Redis Cluster, DynamoDB, PostgreSQL
- **Message Queue**: Kafka, RabbitMQ, AWS SQS
- **Infrastructure**: AWS (ALB, ECS, S3, CloudFront), Docker

#### Blockchain Design
- **Smart Contracts**: Solidity, Foundry, Hardhat
- **Blockchain**: Ethereum, EVM-compatible chains
- **Tools**: The Graph, Ethers.js, Web3.js
- **Storage**: IPFS, Arweave
- **Oracle**: Chainlink

#### Microservices Spring Boot
- **Framework**: Spring Boot, Spring Cloud
- **Service Mesh**: Spring Cloud Gateway, Eureka
- **Database**: PostgreSQL, MongoDB
- **Message Broker**: Kafka, RabbitMQ
- **Security**: Spring Security, OAuth2, JWT

---

## 📁 Project Structure

```
system-design-lab/
├── system-design/                    # System Design Projects
│   ├── 01-distributed-rate-limiter/  # ✅ COMPLETED - NestJS + Redis + Tests
│   │   ├── src/                      # ✅ Complete source code
│   │   ├── test/                     # ✅ Tests (33 unit + 7 E2E)
│   │   ├── docs/                     # ✅ Complete technical documentation
│   │   ├── infra/                    # Infrastructure scripts
│   │   ├── docker-compose.yml        # ✅ Local development
│   │   ├── diagram.excalidraw        # ✅ Architecture diagram
│   │   └── README.md                 # ✅ Complete documentation
│   │
│   ├── 02-scalable-api-gateway/      # 📋 Structure only (not implemented)
│   ├── 03-load-balancer/             # 📋 Structure only (not implemented)
│   ├── 04-distributed-caching-system/# 📋 Structure only (not implemented)
│   ├── 05-url-shortener/             # 📋 Structure only (not implemented)
│   ├── 06-message-queue-system/      # 📋 Structure only (not implemented)
│   ├── 07-news-feed-timeline/        # 📋 Structure only (not implemented)
│   ├── 08-real-time-chat/            # 📋 Structure only (not implemented)
│   ├── 09-circuit-breaker-retry/    # 📋 Structure only (not implemented)
│   └── 10-video-streaming-platform/ # 📋 Structure only (not implemented)
│
├── blockchain-design/                # Blockchain Projects
│   ├── 01-blockchain-explorer/       # 📋 Structure only (not implemented)
│   ├── 02-amm-uniswap-v2/            # 📋 Structure only (not implemented)
│   ├── 03-price-oracle-network/      # 📋 Structure only (not implemented)
│   ├── 04-cross-chain-bridge/        # 📋 Structure only (not implemented)
│   ├── 05-lending-protocol/          # 📋 Structure only (not implemented)
│   ├── 06-staking-pool-validator-network/ # 📋 Structure only (not implemented)
│   ├── 07-flashloan-engine/          # 📋 Structure only (not implemented)
│   ├── 08-nft-marketplace/           # 📋 Structure only (not implemented)
│   ├── 09-account-abstraction-erc4337/# 📋 Structure only (not implemented)
│   └── 10-zk-rollup-prover-marketplace/ # 📋 Structure only (not implemented)
│
├── microservices-springboot/         # Spring Boot Microservices
│   ├── 01-api-gateway/               # 📋 Structure only (not implemented)
│   ├── 02-service-registry-discovery/# 📋 Structure only (not implemented)
│   ├── 03-config-server/             # 📋 Structure only (not implemented)
│   ├── 04-auth-identity-service/     # 📋 Structure only (not implemented)
│   ├── 05-order-service-saga/        # 📋 Structure only (not implemented)
│   ├── 06-payment-service/           # 📋 Structure only (not implemented)
│   └── 07-billing-subscription-service/ # 📋 Structure only (not implemented)
│
├── docs/                             # General documentation
│   └── prioritized-projects.md       # Prioritized project list
│
└── README.md                         # This file
```

### Standard Project Structure

Each project follows a consistent structure. Completed projects include everything below, while planned projects have the base structure (docs/, infra/, scripts/, README.md):

**Completed Project (01-distributed-rate-limiter):**
```
project-name/
├── README.md                 # ✅ Complete documentation
├── diagram.excalidraw        # ✅ Architecture diagram
├── src/                      # ✅ Complete source code
│   └── ...
├── test/                     # ✅ Tests (unit + E2E)
│   ├── unit/
│   └── e2e/
├── docs/                     # ✅ Technical documentation
│   ├── ARCHITECTURE.md       # ✅ Detailed architecture
│   ├── DEPLOYMENT.md         # ✅ Deployment guide
│   └── README.md             # ✅ Complete documentation
├── infra/                    # Infrastructure scripts
│   └── deploy.sh
├── scripts/                  # Utility scripts
│   └── setup.sh
├── docker-compose.yml        # ✅ Local development
├── Dockerfile                # ✅ Docker image
└── package.json              # ✅ Dependencies
```

**Planned Project (base structure - NOT IMPLEMENTED):**
```
project-name/
├── README.md                 # 📋 Documentation template (no actual code)
├── docs/                     # 📋 Prepared folder (empty)
├── infra/                    # 📋 Base scripts (placeholder)
│   └── deploy.sh
└── scripts/                  # 📋 Base scripts (placeholder)
    └── setup.sh
⚠️  No src/ folder - no source code implemented yet
```

---

## 🎯 Project Categories

### 🏗️ System Design (Top 10)

| # | Project | Priority | Complexity | Tech Stack | Key Concepts |
|---|---------|----------|------------|------------|--------------|
| 1 | **Distributed Rate Limiter** | ⭐⭐⭐ | Medium | Redis Cluster, Lua | Token bucket, sliding window, distributed coordination |
| 2 | Scalable API Gateway | ⭐⭐⭐ | Medium-High | NGINX/Envoy, Spring Cloud Gateway | Routing, JWT, OAuth2, rate limiting |
| 3 | Load Balancer | ⭐⭐ | Low-Medium | AWS ALB, NGINX | Round-robin, least connections, health checks |
| 4 | Distributed Caching System | ⭐⭐⭐ | Medium | Redis Cluster, Memcached | TTL, invalidation, cache-aside, write-through |
| 5 | URL Shortener (TinyURL) | ⭐⭐⭐ | Medium-High | DynamoDB, CloudFront, Base62 | Sharding, CDN, TTL, analytics |
| 6 | Message Queue System | ⭐⭐⭐ | Medium-High | Kafka, RabbitMQ, AWS SQS | Pub/sub, at-least-once, consumer groups |
| 7 | News Feed / Timeline | ⭐⭐⭐ | High | Redis, Cassandra | Fan-out write/read, caching, sharding |
| 8 | Real-Time Chat | ⭐⭐⭐ | High | WebSocket, Redis Pub/Sub | Connection management, message queuing |
| 9 | Circuit Breaker + Retry | ⭐⭐ | Medium | Resilience4j, Hystrix | Circuit breaker, exponential backoff, jitter |
| 10 | Video Streaming Platform | ⭐⭐⭐ | High | CDN, FFmpeg, S3, HLS | Transcoding, adaptive streaming, storage |

### ⛓️ Blockchain Design (Top 10)

| # | Project | Priority | Complexity | Tech Stack | Key Concepts |
|---|---------|----------|------------|------------|--------------|
| 1 | Blockchain Explorer | ⭐⭐⭐ | Medium | The Graph, Ethers.js, PostgreSQL | Indexing, REST APIs, mempool queries |
| 2 | AMM - Uniswap V2 | ⭐⭐⭐ | High | Solidity, Foundry, Hardhat | Constant product (x*y=k), liquidity pools |
| 3 | Price Oracle Network | ⭐⭐⭐ | High | Chainlink, Off-chain Aggregators | Data aggregation, consensus, on-chain updates |
| 4 | Cross-chain Bridge | ⭐⭐⭐ | Very High | Lock & Mint, Relayers | Message passing, validation, security |
| 5 | Lending Protocol (Aave/Compound) | ⭐⭐⭐ | High | Solidity, Interest Rate Models | Collateral, liquidation, interest rates |
| 6 | Staking Pool + Validator Network | ⭐⭐⭐ | High | Delegation Contracts, Slashing | Delegation, slashing, rewards distribution |
| 7 | Flashloan Engine | ⭐⭐ | Medium-High | Atomic Transactions, MEV Protection | Atomic transactions, MEV, arbitrage |
| 8 | NFT Marketplace | ⭐⭐⭐ | Medium-High | ERC-721/1155, IPFS, OpenZeppelin | Royalties, minting, auctions, IPFS |
| 9 | Account Abstraction (ERC-4337) | ⭐⭐⭐ | Very High | Paymasters, Bundlers, EntryPoint | Gas sponsorship, social recovery, session keys |
| 10 | ZK-Rollup Prover Marketplace | ⭐⭐⭐ | Very High | ZK-SNARKs, Proof Generation | Proof generation, batch processing, settlement |

### 🍃 Microservices Spring Boot (Top 10)

| # | Project | Priority | Complexity | Tech Stack | Key Concepts |
|---|---------|----------|------------|------------|--------------|
| 1 | API Gateway | ⭐⭐⭐ | Medium | Spring Cloud Gateway, JWT | Routing, filters, rate limiting, OAuth2 |
| 2 | Service Registry & Discovery | ⭐⭐ | Low-Medium | Eureka, Consul, Spring Cloud | Service discovery, health checks, load balancing |
| 3 | Config Server | ⭐⭐ | Low-Medium | Spring Cloud Config, Git | Profiles, encryption, dynamic updates |
| 4 | Auth & Identity Service | ⭐⭐⭐ | High | Spring Security, OAuth2/OIDC | JWT, refresh tokens, RBAC, multi-tenancy |
| 5 | Order Service with Saga Pattern | ⭐⭐⭐ | High | Orchestration, Kafka, PostgreSQL | Compensation, event-driven, idempotency |
| 6 | Payment Service | ⭐⭐⭐ | High | Stripe/PayPal, Webhooks | Idempotency, reconciliation, multi-provider |
| 7 | Billing & Subscription Service | ⭐⭐⭐ | High | Recurring Billing, Scheduled Jobs | Proration, dunning, invoices, webhooks |
| 8 | Notification Service | ⭐⭐ | Medium | RabbitMQ, SendGrid/Twilio | Email/SMS/Push, templates, queues |
| 9 | Search Service | ⭐⭐⭐ | Medium-High | Elasticsearch, AWS OpenSearch | Inverted index, relevance scoring, faceted search |
| 10 | Analytics & Event Ingestion | ⭐⭐⭐ | High | Kafka Streams, Event Sourcing | Event streaming, batch processing, warehousing |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18+ and npm (for NestJS/TypeScript projects)
- **Java**: JDK 17+ and Maven/Gradle (for Spring Boot projects)
- **Docker**: For local development and containers
- **Docker Compose**: For local orchestration
- **Redis**: For projects requiring distributed cache
- **AWS CLI**: Configured with appropriate credentials (optional)
- **Terraform**: v1.5+ for infrastructure deployment (optional)
- **Git**: For version control

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd system-design-lab

# For NestJS projects (e.g., rate-limiter)
cd system-design/01-distributed-rate-limiter
npm install

# For Spring Boot projects (when implemented)
cd microservices-springboot/01-api-gateway
mvn clean install
```

### Environment Setup

#### Distributed Rate Limiter (Example)

```bash
cd system-design/01-distributed-rate-limiter

# Copy example file
cp .env.example .env

# Configure environment variables
# REDIS_HOST=localhost
# REDIS_PORT=6379
# PORT=3000
```

### Local Development

#### NestJS Project (Rate Limiter)

```bash
cd system-design/01-distributed-rate-limiter

# Start Redis with Docker
docker-compose up -d

# Run in development mode
npm run start:dev

# API available at http://localhost:3000
# Swagger docs at http://localhost:3000/api/docs
```

#### Planned Projects (Not Yet Implemented)

**Important**: Most other projects in the repository have only prepared structure (folders, README templates) but **no implemented code**. They are ready for implementation following the pattern established by `01-distributed-rate-limiter`. Check `docs/prioritized-projects.md` for the implementation roadmap.

### Running Tests

**Only available for the completed project (01-distributed-rate-limiter):**

```bash
cd system-design/01-distributed-rate-limiter

# Unit tests
npm run test

# E2E tests (requires Redis running)
docker-compose up -d
npm run test:e2e

# All tests
npm run test:all

# With coverage
npm run test:cov
```

---

## 💻 Development

### Methodology

Projects follow **Test-Driven Development (TDD)** and **Behavior-Driven Development (BDD)**:

1. ✅ Write tests first
2. ✅ Run tests (they should fail)
3. ✅ Implement code
4. ✅ Run tests (they should pass)
5. ✅ Refactor

### Code Standards

- **TypeScript**: ESLint + Prettier configured
- **Java**: Checkstyle + SpotBugs
- **Testing**: Jest (Node.js), JUnit (Java)
- **Coverage**: Minimum 80% code coverage

### Workflow

```bash
# 1. Create branch for new project
git checkout -b feature/02-api-gateway

# 2. Develop with TDD
npm run test:watch  # or mvn test

# 3. Frequent commits
git add .
git commit -m "feat: implement rate limiter service"

# 4. Push and create PR
git push origin feature/02-api-gateway
```

---

## 🚢 Deployment

### Local Infrastructure (Docker Compose)

The **01-distributed-rate-limiter** project includes `docker-compose.yml` for local development:

```bash
cd system-design/01-distributed-rate-limiter

# Start Redis
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### AWS Deployment

#### Distributed Rate Limiter

The project includes deployment scripts in `infra/deploy.sh`. Check `docs/DEPLOYMENT.md` for detailed instructions.

```bash
cd system-design/01-distributed-rate-limiter/infra

# Deploy infrastructure
./deploy.sh
```

### CI/CD

The **01-distributed-rate-limiter** project includes GitHub Actions for automated testing and linting. Full CI/CD is planned for future versions.

---

## 🧪 Testing

### Testing Strategy

#### Unit Tests
- Business logic
- Utilities and helpers
- Isolated components

#### Integration Tests
- Controllers and services
- Database integrations
- External API integrations

#### E2E Tests
- Complete user flows
- End-to-end business scenarios
- Contract validation

### Running Tests

```bash
# All tests
npm run test:all

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# With coverage
npm run test:cov

# Watch mode
npm run test:watch
```

### Code Coverage

The **01-distributed-rate-limiter** project maintains >80% coverage:

```
File                    | % Stmts | % Branch | % Funcs | % Lines
------------------------|---------|----------|---------|--------
rate-limiter.service    |   95.45 |    90.00 |   100.00 |   95.45
rate-limiter.guard      |   92.31 |    85.71 |   100.00 |   92.31
redis.service           |   88.89 |    75.00 |   100.00 |   88.89
```

---

## 📚 Documentation

### Project Documentation

**Completed Project (01-distributed-rate-limiter):**
- ✅ **README.md**: Overview, quick start, complete structure
- ✅ **docs/ARCHITECTURE.md**: Detailed architecture with diagrams
- ✅ **docs/DEPLOYMENT.md**: Step-by-step deployment guide
- ✅ **docs/README.md**: Complete technical documentation
- ✅ **diagram.excalidraw**: Visual architecture diagram
- ✅ **Swagger/OpenAPI**: Interactive documentation at `/api/docs`

**Planned Projects (Not Implemented):**
- 📋 **README.md**: Template with standard structure (no actual implementation)
- 📋 **docs/**: Folder prepared for future documentation
- ⚠️ **No source code**: These projects are structure templates only

### General Documentation

- **docs/prioritized-projects.md**: Prioritized project list with roadmap

### Diagrams

Diagrams are in **Excalidraw** format (`.excalidraw`). To open them:

1. Visit [excalidraw.com](https://excalidraw.com)
2. Import the `.excalidraw` file
3. Or use VS Code/Obsidian extension

---

## 📈 Roadmap

### ✅ Completed

- ✅ **01-distributed-rate-limiter**: 
  - Complete implementation with NestJS + TypeScript
  - Redis Cluster with Token Bucket algorithm (Lua script)
  - 40 tests (33 unit + 7 E2E) - 77.83% coverage
  - Complete documentation (README, Architecture, Deployment)
  - Swagger/OpenAPI documentation
  - Docker Compose for local development
  - GitHub Actions CI/CD
  - Architecture diagram (Excalidraw)

### 📋 Structure Prepared

Projects with prepared structure include:
- Standard folder structure (docs/, infra/, scripts/)
- README with architecture template
- Ready for implementation following the rate limiter pattern

### 📅 Planned (Next Steps)

#### Phase 1: Fundamentals (Weeks 1-2)
- [ ] 02-scalable-api-gateway
- [ ] 01-blockchain-explorer
- [ ] 03-load-balancer
- [ ] 02-service-registry-discovery

#### Phase 2: Real-world Cases (Weeks 3-4)
- [ ] 02-amm-uniswap-v2
- [ ] 05-url-shortener
- [ ] 04-auth-identity-service
- [ ] 04-distributed-caching-system

#### Phase 3: Scalability (Weeks 5-6)
- [ ] 06-message-queue-system
- [ ] 05-order-service-saga
- [ ] 04-cross-chain-bridge
- [ ] 07-news-feed-timeline

#### Phase 4: Advanced (Weeks 7-8)
- [ ] 05-lending-protocol
- [ ] 08-real-time-chat
- [ ] 07-billing-subscription-service
- [ ] 06-staking-pool-validator-network

#### Phase 5: Expert (Weeks 9-10)
- [ ] 08-nft-marketplace
- [ ] 10-video-streaming-platform
- [ ] 09-search-service
- [ ] 09-account-abstraction-erc4337

#### Phase 6: Mastery (Weeks 11-12)
- [ ] 07-flashloan-engine
- [ ] 08-notification-service
- [ ] 10-zk-rollup-prover-marketplace

---

## 🤝 Contributing

This is an educational repository. Contributions are welcome:

1. Fork the repository
2. Create a branch for your project (`git checkout -b feature/new-project`)
3. Follow code standards and structure
4. Add complete tests (coverage >80%)
5. Document your project following the standard structure
6. Commit your changes (`git commit -m 'feat: add new project'`)
7. Push to the branch (`git push origin feature/new-project`)
8. Open a Pull Request

### Contribution Guidelines

- Follow the standard project structure
- Include architecture diagrams (Excalidraw)
- Document design decisions
- Maintain test coverage >80%
- Update general documentation

---

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

## 📞 Support

For questions or technical support:

- **Documentation**: Check the `docs/` folder of each project
- **Issues**: Open an issue on GitHub to report bugs or request features
- **Discussions**: Use GitHub Discussions for general questions

---

## 📊 Statistics

- **Fully implemented projects**: ✅
  - `01-distributed-rate-limiter` (System Design)
- **Projects with prepared structure**: 📋
- **Test coverage** (completed project): 77.83%
- **Total tests** (completed project): 40 (33 unit + 7 E2E)
- **Suggested pace**: 2-3 projects/week

---

## 🎓 Learning Resources

### Key Concepts by Category

#### System Design
- Rate Limiting (Token Bucket, Sliding Window)
- Load Balancing (Round-robin, Least Connections)
- Caching Strategies (Cache-aside, Write-through)
- Message Queues (Pub/Sub, Consumer Groups)
- Distributed Systems Patterns

#### Blockchain
- Smart Contract Development
- DeFi Protocols (AMM, Lending, Staking)
- Cross-chain Communication
- Account Abstraction
- Zero-Knowledge Proofs

#### Microservices
- Service Discovery
- API Gateway Patterns
- Saga Pattern (Orchestration/Choreography)
- Circuit Breaker
- Event-Driven Architecture

---

> 💡 **Tip**: Start with projects marked with ⭐⭐⭐ in each category — they're the most impactful for interviews and LinkedIn.

---

**Made with ❤️ for the developer community**
