# 🛠️ Technical Stack & Architectural Justifications

> 📝 **What to write in this document:**  
> This document details the technology choices, framework architectures, database selections, and engineering trade-offs made during the development of Skilio.  
> - **Evaluator Expectation:** Evaluators at 42 frequently ask: *"Why did you choose PostgreSQL instead of MongoDB?", "Why did you use FastAPI instead of Django or NestJS?", "Why Vite instead of Next.js?"*. You must be able to justify your technological stack with technical and business reasons, not just *"it was easy"* or *"someone recommended it"*.  
> - **What you need to complete:**  
>   1. Review the tech stack tables and ensure versions correspond to your current environment.  
>   2. Study and personalize the technical justifications provided below so you can confidently defend them during evaluation.  
>   3. Add any additional third-party libraries or internal tools your team introduced.

---

## 1. Technical Stack Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND LAYER                            │
│  React 19 • TypeScript 6 • Vite 8 (SWC) • TanStack Router & Query      │
│  Tailwind CSS v4 • Radix UI • shadcn/ui • Sonner • Biome               │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS (TLS 1.3) & WebSockets
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        INGRESS & REVERSE PROXY                         │
│  Traefik 3.6 • Let's Encrypt ACME Automation • Docker Socket Discovery │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Internal Bridge Network
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                              BACKEND LAYER                             │
│  Python 3.14 • FastAPI • SQLModel (SQLAlchemy 2.0 + Pydantic v2)       │
│  Alembic Migrations • PyJWT • Pwdlib (Argon2 / Bcrypt) • Sentry        │
└───────┬───────────────────────────┬────────────────────────────────────┘
        │                           │
        ▼                           ▼
┌──────────────┐            ┌───────────┐            ┌───────────────────┐
│POSTGRESQL 18 │            │  REDIS 8  │            │  CLOUDINARY CDN   │
│  Primary DB  │            │  Pub/Sub  │            │ Asset Storage &   │
│(ACID & Rel.) │            │ Event Bus │            │ Document Hosting  │
└───────┬──────┘            └───────────┘            └───────────────────┘
        │
        ▼
┌──────────────────────────────┐
│     BACKUP DAEMON (Cron)     │
│ Automated Periodic Dumps     │
│ .sql.gz Rotation & DR Drill  │
└──────────────────────────────┘
```

---

## 2. Detailed Technology Breakdown

### 2.1 Backend Architecture
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **Python** | `3.14` | High-performance modern language runtime with robust typing. |
| **FastAPI** | `>=0.141` | Asynchronous REST API framework and native WebSocket support. |
| **SQLModel** | `>=0.0.39` | Data modeling layer unifying SQLAlchemy 2.0 ORM with Pydantic v2 schemas. |
| **PostgreSQL** | `18` (via `psycopg 3.3`) | Primary ACID-compliant relational database. |
| **Redis** | `8.1` (`redis.asyncio`) | High-speed in-memory message broker for real-time Pub/Sub channels. |
| **Alembic** | `>=1.12` | Database migration engine providing deterministic schema versioning. |
| **PyJWT** | `>=2.13` | Cryptographically signed JSON Web Token creation and verification. |
| **Pwdlib / Passlib** | Argon2 & Bcrypt | Modern multi-algorithm password hashing with automatic salt generation. |
| **Cloudinary SDK** | `>=1.46` | Cloud media storage, asset transformations, and secure resume streaming. |
| **HTTPX** | `>=0.25` (HTTP/2) | Asynchronous pooled HTTP client for OAuth 2.0 verification and integrations. |
| **Sentry SDK** | `>=2.66` | Distributed error logging and application performance monitoring (APM). |

### 2.2 Frontend Architecture
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **React** | `19.2` | Component-based UI library leveraging latest compiler optimizations and hooks. |
| **TypeScript** | `6.0` | Strict static typing end-to-end across models, props, and API clients. |
| **Vite** | `8.2` (with SWC) | Lightning-fast build tool and local development server with instant HMR. |
| **Tailwind CSS** | `v4.2` | Modern utility-first styling engine with native CSS variable support. |
| **TanStack Router** | `1.170` | File-based, type-safe client-side routing with role guards and code splitting. |
| **TanStack Query** | `v5.101` | Declarative asynchronous state caching, background revalidation, and mutations. |
| **Radix UI & shadcn/ui**| Latest | Unstyled, fully accessible UI primitives styled with custom Tailwind themes. |
| **Sonner** | `2.0` | High-performance, stacked toast notification management. |
| **Hey-API / openapi-ts**| `0.97` | Code generator producing type-safe TypeScript clients directly from OpenAPI schemas. |
| **Biome** | `2.5` | High-performance Rust-based linter and code formatter. |

### 2.3 DevOps & Cloud Infrastructure
| Technology | Specification | Purpose |
| :--- | :--- | :--- |
| **Docker & Compose** | Engine 28+ / Compose v2 | Multi-stage containerization, network isolation, and developer workflow. |
| **AWS EC2** | `t3.small` (Ubuntu 24.04 LTS) | Production cloud compute instance hosting the live application. |
| **Traefik** | `3.6` | Dynamic reverse proxy with automated Let's Encrypt TLS 1.3 certificates. |
| **Prometheus** | `2.x` | Time-series metrics engine scraping application latency and system load. |
| **Grafana** | `10.x` | Observability dashboards monitoring server CPU, memory, and HTTP metrics. |
| **Mailpit** | `axllent/mailpit` | Local SMTP testing sandbox for password resets and welcome emails. |

---

## 3. Justification for Major Technical Choices

> 💡 **Tip for 42 Evaluation Defense:** When evaluators ask why you chose these technologies, refer directly to the architectural comparisons below.

### 3.1 Why PostgreSQL instead of MongoDB or SQLite?
- **Relational Integrity & Complex Joins:** A freelancer marketplace inherently involves heavily relational data: a User has Profiles, Job Posts receive Proposals, Conversations link Clients and Freelancers, and Reviews map between pairs. Relational foreign keys and cascading deletes (`ON DELETE CASCADE`) prevent orphaned records.
- **ACID Transaction Guarantees:** Financial transactions, contract status transitions (`pending` $\rightarrow$ `accepted`), and proposal acceptances demand strict ACID compliance to avoid double-acceptance or race conditions.
- **Hybrid Flexibility with Native JSON:** PostgreSQL provides native `JSONB` support, enabling us to store dynamic skill tags and portfolio metadata inside relational tables without sacrificing indexing capabilities.
- **Why not SQLite?** SQLite lacks support for concurrent write throughput required by real-time WebSocket event ingestion and background cron backups, and cannot scale across multi-container networks.
- **Why not MongoDB?** MongoDB lacks native relational constraint enforcement out-of-the-box, increasing the risk of data inconsistency across user profiles and contracts.

### 3.2 Why FastAPI instead of Django or Flask / NestJS?
- **Asynchronous Native Performance:** Built natively on Starlette and `asyncio`, FastAPI handles high-concurrency WebSocket connections alongside standard REST endpoints with minimal memory overhead.
- **Native Data Validation via Pydantic v2:** Pydantic automatically serializes, deserializes, and validates incoming JSON payloads with compiled Rust performance, returning standardized 422 HTTP errors automatically.
- **Automatic OpenAPI / Swagger Specification:** FastAPI automatically serves `/docs` (Swagger UI) and exports `openapi.json`, allowing the frontend team to automatically generate full TypeScript client bindings with zero manual boilerplate.
- **Why not Django?** Django is monolithic and heavier, with complex ORM overhead that complicates async WebSockets (requiring Django Channels and ASGI setup).

### 3.3 Why React 19 + Vite instead of Next.js or Vanilla JS?
- **Clean Architectural Separation:** Using a dedicated SPA with Vite keeps the frontend strictly decoupled from the backend. The backend remains a pure REST/WebSocket API that can be consumed by web, mobile, or third-party clients.
- **Docker Build Efficiency:** Vite compiles static assets in a lightweight Bun container stage (`dist/`), which are served directly by FastAPI or Nginx without needing a permanent Node.js server runtime in production, saving memory on our AWS instance.
- **Development Speed & Instant HMR:** Vite provides near-instant Hot Module Replacement during development, vastly accelerating team iteration compared to heavier bundlers.

### 3.4 Why Redis Pub/Sub for Real-Time Messaging?
- **Distributed Scalability:** While in-memory WebSockets work on a single server instance, they fail when scaling to multiple backend replicas because users connected to Instance A cannot receive messages sent to Instance B. Redis acts as a centralized event broker that distributes messages across all instances instantly.
- **Graceful Degradation:** Our implementation incorporates an automatic in-memory fallback: if Redis is temporarily unavailable in local development, the system seamlessly routes messages locally without crashing.

### 3.5 Why Traefik 3.6 instead of Nginx?
- **Dynamic Docker Socket Integration:** Traefik dynamically discovers running containers via `/var/run/docker.sock` labels without requiring manual config edits or server reloads whenever a container starts or restarts.
- **Automated Let's Encrypt TLS:** Traefik automatically negotiates, provisions, and renews SSL/TLS certificates through ACME challenges with zero manual cron configuration.
