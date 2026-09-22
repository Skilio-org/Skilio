# Freelancer Marketplace Platform

[![Test Backend](../../actions/workflows/test-backend.yml/badge.svg)](../../actions/workflows/test-backend.yml)
[![Test Docker Compose](../../actions/workflows/test-docker-compose.yml/badge.svg)](../../actions/workflows/test-docker-compose.yml)
[![Python 3.14](https://img.shields.io/badge/python-3.14-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.141+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React 19](https://img.shields.io/badge/React-19.2-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.2-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A production-grade, full-stack marketplace connecting independent talent with clients. Features dual-role accounts, real-time WebSocket messaging backed by Redis Pub/Sub, talent discovery with rich portfolio showcases, proposal workflows, Cloudinary media hosting, HashiCorp HCP Vault secret management, and automated disaster recovery.

---

## 🌟 Key Features

- **🔄 Unified Dual-Role Workspaces**: Switch between Client and Freelancer roles on demand with a single account. Profiles and role-specific views are auto-provisioned seamlessly.
- **💬 Real-Time Messaging & Presence**: Full-duplex WebSocket chat (`/api/v1/chat/ws`) with typing indicators, message acknowledgements, unread counters, and a distributed Redis Pub/Sub event bus with automatic in-memory fallback.
- **💼 Job & Proposal Management**: Post projects with fixed or hourly budgets, tag required skills, receive proposals with custom cover letters, and manage applicant status (`pending`, `accepted`, `rejected`).
- **🎯 Talent Discovery & Faceted Search**: Search professionals by skills, categories, hourly rates, and availability. Review detailed profiles with verified ratings, portfolios, work history, and education.
- **☁️ Cloudinary Media Pipeline**: Secure cloud hosting for profile avatars, portfolio showcases, project attachments, and PDF resumes with streaming download endpoints.
- **🔐 Multi-Provider Authentication**: Social login via Google OAuth 2.0 and LinkedIn OIDC with automatic account creation, alongside Argon2/Bcrypt password hashing and JWT access tokens.
- **🛡️ Enterprise Secrets & Disaster Recovery**: Dynamic secret synchronization with HashiCorp HCP Vault (`make env`, `make push`), plus an automated Postgres backup daemon with rotation and verification drills (`make dr-test`).
- **📊 Deep System Observability**: Granular health checks inspecting live database latency, disk capacity, and vault secrets, rendered on an interactive `/status` dashboard.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Backend** | Python 3.14 • FastAPI • SQLModel (SQLAlchemy 2.0) • PostgreSQL 18 (`psycopg3`) • Redis 8 • Alembic • Cloudinary SDK • HTTPX (HTTP/2) • Pwdlib (Argon2/Bcrypt) • PyJWT • Sentry |
| **Frontend** | React 19 • TypeScript 6 • Vite 8 (SWC) • Tailwind CSS v4 • TanStack Router • TanStack Query v5 • Radix UI • shadcn/ui • Sonner • Hey-API OpenAPI Client |
| **Infrastructure & DevOps** | Docker Compose • Traefik 3.6 Reverse Proxy • HashiCorp HCP Vault • Automated Backup Daemon • Mailpit (SMTP Sandbox) |

For in-depth architectural details, diagrams, and schema documentation, see [architecture.md](./architecture.md).

---

## 🚀 Quick Start

### Prerequisites
- [Docker](https://www.docker.com/) and Docker Compose
- [uv](https://docs.astral.sh/uv/) (Python package manager)
- [Bun](https://bun.sh/) (Frontend runtime & package manager)

### Option A: Complete Stack with Docker Compose (Recommended)

1. **Clone the repository and prepare environment variables**:
   ```bash
   cp .env.example .env
   # Or pull directly from HCP Vault:
   # make env-dev
   ```

2. **Launch all services**:
   ```bash
   make up
   # Or with HCP Vault integration:
   # make dev
   ```

3. **Initialize database schema & superuser**:
   ```bash
   docker compose run --rm backend bash scripts/prestart.sh
   ```

4. **Stream logs or monitor container health**:
   ```bash
   make logs
   make status
   ```

---

### Option B: Local Development Workflow

Run supporting databases in Docker while developing the backend and frontend locally for instant hot-reload:

1. **Start infrastructure services**:
   ```bash
   docker compose up -d db mailpit
   ```

2. **Run backend (Terminal 1)**:
   ```bash
   cd backend
   uv sync
   uv run bash scripts/prestart.sh
   uv run fastapi dev
   ```
   Backend API runs at: <http://localhost:8000>  
   Swagger UI available at: <http://localhost:8000/docs>

3. **Run frontend (Terminal 2)**:
   ```bash
   cd frontend
   bun install
   bun run dev
   ```
   Frontend development server runs at: <http://localhost:5173>

4. **Serve built frontend through FastAPI**:
   ```bash
   cd frontend
   bun run build
   # Frontend static files build directly to backend/app/frontend
   # Visit http://localhost:8000
   ```

---

## 🌐 Service Access Points

| Service | URL / Port | Credentials / Purpose |
| :--- | :--- | :--- |
| **Frontend Web App** | <http://localhost:5173> (Dev) / <http://localhost:8000> (Prod) | Client & Freelancer Workspace |
| **Backend REST API** | <http://localhost:8000/api/v1> | OpenAPI Root |
| **Interactive API Docs** | <http://localhost:8000/docs> | Swagger UI testing suite |
| **System Status Dashboard** | <http://localhost:5173/status> or `/status` | Real-time service & DB latency monitor |
| **Mailpit Web UI** | <http://localhost:8025> | Transactional email inbox sandbox |
| **Adminer Database UI** | `http://adminer.localhost:80` (or `8080`) | PostgreSQL Web GUI |
| **Traefik Proxy Dashboard**| <http://localhost:8090> | Routing rules and health |

---

## 🔒 HCP Vault Secret Management

This project integrates with HashiCorp HCP Vault for externalized secret storage:

```bash
make env          # Pull secrets from HCP Vault into .env
make env-dev      # Pull secrets with safe fallbacks for local development
make push         # Push local .env variables into HCP Vault
make push-dry     # Preview changes before writing to Vault
make token NAME=x # Generate a developer read-only Vault token
```

For configuration guides and Vault policies, see [devops/vault/README.md](./devops/vault/README.md).

---

## 💾 Database Backups & Disaster Recovery

The platform includes a dedicated backup daemon container (`backup-daemon`) and shell automation:

```bash
make backup       # Create an immediate compressed PostgreSQL dump (.sql.gz)
make restore      # Restore the database from the latest backup archive
make backup-logs  # Stream live logs from the automated backup daemon
make dr-test      # Execute an automated Disaster Recovery (DR) drill in an isolated container
```

For comprehensive disaster recovery protocols and RPO/RTO targets, see [devops/backup/DISASTER_RECOVERY.md](./devops/backup/DISASTER_RECOVERY.md).

---

## 🧪 Testing & Code Quality

### Backend Tests
```bash
cd backend
uv run bash scripts/test.sh
```
Pytest executes all route, authentication, chat, and CRUD tests while generating a detailed coverage report in `backend/htmlcov/index.html`.

### Frontend Typecheck & Formatting
```bash
cd frontend
bun run format    # Format codebase with Biome
bun run build     # Verify TypeScript types and build bundle
```

### Regenerate TypeScript API Client
Whenever backend API schemas change:
```bash
bash ./scripts/generate-client.sh
```

---

## 📚 Documentation Roadmap

- [System Architecture & Technical Design](./architecture.md) — Comprehensive architecture, ERD diagrams, WebSocket pipelines, and feature matrix.
- [Development Guide](./development.md) — Step-by-step local development instructions and configuration details.
- [Docker Compose Deployment](./deployment-docker-compose.md) — Self-hosted deployment setup with Traefik and SSL.
- [Cloud Deployment](./deployment.md) — Cloud hosting guidance.
- [HCP Vault Guide](./devops/vault/README.md) — Vault secrets engine setup and policies.
- [Disaster Recovery Runbook](./devops/backup/DISASTER_RECOVERY.md) — Backup schedules, rotation, and restoration procedures.
- [Frontend UI & Design QA](./frontend/UI-POLISH.md) — Design system decisions, typography, and test verification notes.

---

## 📄 License

This project is licensed under the terms of the MIT License. See [LICENSE](./LICENSE) for details.
