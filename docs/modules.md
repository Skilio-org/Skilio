# 🏆 42 Evaluation Modules Ledger & Point Calculations

> 📝 **What to write in this document:**  
> This document lists every official 42 evaluation module chosen by the team for the `ft_transcendence` project.  
> - **Evaluator Expectation:** Evaluators use the official 42 grading sheet to verify that:
>   1. You have selected enough modules to reach or exceed the required point threshold.
>   2. Major modules equal **2 points** and Minor modules equal **1 point**.
>   3. For any "Module of Choice" (IV.10), you provide clear justifications for why it was selected, why it is substantial, how it was implemented, and why it deserves Major (2 pts) status.
>   4. Every module has an identified team member responsible for defending it.
> - **What you need to complete:**  
>   1. Review the point calculation table below to ensure all claimed modules match your team's evaluation strategy.  
>   2. Verify that each module's implementation description and assigned member are accurate.  
>   3. Review the defense questions for "Modules of Choice" to ensure flawless justification during your defense.

---

## 1. Official Point Calculation Ledger

| Module ID | Module Classification | Module Scope | Points | Assigned Member(s) | Primary Docs Link |
| :--- | :---: | :--- | :---: | :--- | :--- |
| **IV.1** | **Web (Major)** | **Use a Framework for Backend (FastAPI)** | **2 Pts** | `<arajma>` | [docs/tech-stack.md](tech-stack.md) |
| **IV.1** | **Web (Major)** | **Use a Framework for Frontend (React 19)**| **2 Pts** | `<omorakwant>` | [docs/tech-stack.md](tech-stack.md) |
| **IV.1** | **Web (Minor)** | **Use a Database (PostgreSQL 18)** | **1 Pt** | `<arajma>` | [docs/database-schema.md](database-schema.md) |
| **IV.2** | **User Management (Major)** | **Standard User Management & Dual Role** | **2 Pts** | `<arajma>`, `<omorakwant>`| [docs/features.md](features.md) |
| **IV.2** | **User Management (Major)** | **Remote Authentication (Google & LinkedIn OAuth)** | **2 Pts** | `<arajma>` | [docs/features.md](features.md) |
| **IV.4** | **AI / Real-Time (Major)** | **Real-Time Live Chat via WebSockets & Redis** | **2 Pts** | `<lazmoud>` | [docs/features.md](features.md) |
| **IV.7** | **DevOps (Major)** | **Observability Suite (Prometheus & Grafana)** | **2 Pts** | `<aysadeq>` | [devops/docs/MONITORING.md](../devops/docs/MONITORING.md) |
| **IV.7** | **DevOps (Minor)** | **Health Diagnostics, Status Page & Disaster Recovery** | **1 Pt** | `<aysadeq>` | [devops/docs/BACKUP.md](../devops/docs/BACKUP.md) |
| **IV.10** | **Module of Choice (Major)**| **Production Cloud Deployment & Zero-Touch CI/CD** | **2 Pts** | `<aysadeq>` | [devops/docs/DEPLOYMENT.md](../devops/docs/DEPLOYMENT.md) |
| **IV.10** | **Module of Choice (Minor)**| **Cloud Media & Asset Storage (Cloudinary)** | **1 Pt** | `<zbakour>`, `<arajma>` | [docs/features.md](features.md) |

### 📊 Point Summary:
- **Major Modules:** 7 × 2 Points = **14 Points**
- **Minor Modules:** 3 × 1 Point = **3 Points**
- **Total Points Claimed:** **17 Points** *(Well above minimum requirement)*

---

## 2. Detailed Module Implementations & Justifications

### 2.1 IV.1 Web — Backend Framework: FastAPI (Major — 2 Points)
- **Assigned Member:** `<arajma>`
- **Implementation:**
  - Complete RESTful and WebSocket API constructed using modern Python 3.14 and FastAPI.
  - Type-safe data serialization and schema validation via Pydantic v2.
  - Unified database modeling with SQLModel and async query execution.
  - Automated OpenAPI documentation exposed at `/docs` (Swagger UI) and `/redoc`.
- **Justification:** FastAPI delivers asynchronous concurrency and compiled Rust-speed validation, perfectly suited for real-time platforms.

### 2.2 IV.1 Web — Frontend Framework: React 19 (Major — 2 Points)
- **Assigned Member:** `<omorakwant>`
- **Implementation:**
  - Modern Single-Page Application (SPA) built using React 19, TypeScript 6, and Vite 8 with SWC.
  - Fully type-safe routing with TanStack Router, code splitting, and route protection guards.
  - Server-state caching and optimistic mutations with TanStack Query v5.
  - Accessible design system constructed with Tailwind CSS v4 and Radix UI / shadcn/ui.
- **Justification:** React 19 provides modular component architecture and reactive state management for real-time applications.

### 2.3 IV.1 Web — Database System: PostgreSQL 18 (Minor — 1 Point)
- **Assigned Member:** `<arajma>`
- **Implementation:**
  - Standalone PostgreSQL 18 relational container managed via Docker Compose.
  - Connection pooling using `psycopg 3.3` with persistent volume storage (`app-db-data`).
  - Automated database migration lifecycle using Alembic pre-start gates.
- **Justification:** ACID transactions ensure zero risk of duplicate bookings or conflicting contract acceptances.

### 2.4 IV.2 User Management — Dual-Role Account System (Major — 2 Points)
- **Assigned Member:** `<arajma>`, `<omorakwant>`
- **Implementation:**
  - Unified identity model enabling users to seamlessly toggle between Client and Freelancer roles on demand.
  - Automated profile provisioning when switching roles for the first time.
  - Client-side navigation dynamically adapting menus, views, and route guards based on active role.
- **Justification:** Solves marketplace friction by allowing users to hire and offer freelance services under a single login.

### 2.5 IV.2 User Management — Remote OAuth 2.0 Authentication (Major — 2 Points)
- **Assigned Member:** `<arajma>`
- **Implementation:**
  - Google OAuth 2.0 and LinkedIn OIDC integration with secure state validation.
  - Automatic user creation, secure randomized password generation, and JWT token issuance.
  - Full fallback to Argon2/Bcrypt email-and-password authentication with password recovery.
- **Justification:** Streamlines user onboarding and conforms to modern enterprise authentication standards.

### 2.6 IV.4 Real-Time Live Messaging via WebSockets & Redis (Major — 2 Points)
- **Assigned Member:** `<lazmoud>`
- **Implementation:**
  - Bidirectional WebSocket endpoint (`/api/v1/chat/ws`) supporting real-time chat, typing indicators, and read receipts.
  - Redis Pub/Sub distributed event bus (`user:{id}:events`) enabling multi-node scalability with automatic in-memory fallback.
  - Threaded conversation management with instant client acknowledgements.
- **Justification:** Real-time communication is fundamental for client-freelancer negotiations and project coordination.

### 2.7 IV.7 DevOps — Observability Suite: Prometheus & Grafana (Major — 2 Points)
- **Assigned Member:** `<aysadeq>`
- **Implementation:**
  - Prometheus time-series scraper collecting metrics from backend and node exporters every 15s.
  - Pre-configured Grafana telemetry dashboards visualizing CPU, memory, HTTP request throughput, and latency.
  - Automated threshold alerts for container restarts and high resource consumption.
- **Justification:** Provides operational visibility into system performance and enables early detection of bottlenecks.

### 2.8 IV.7 DevOps — Health Diagnostics & Disaster Recovery (Minor — 1 Point)
- **Assigned Member:** `<aysadeq>`
- **Implementation:**
  - Deep diagnostic health endpoint (`/api/v1/health`) measuring Postgres latency, Redis ping, and disk storage.
  - Public React `/status` dashboard with auto-refreshing service status badges.
  - Automated daily PostgreSQL backup daemon with `.sql.gz` compression and 7-day rolling retention.
  - Ephemeral sandbox disaster recovery drill restoring backups with verified integrity in **RTO < 60s** (`make dr-test`).
- **Justification:** High availability and automated recovery guarantee business continuity in case of disaster.

---

## 3. Justification for "Modules of Choice" (Section IV.10)

> 💡 **Mandatory 42 Subject Alignment:** Section IV.10 requires teams to answer four specific questions when choosing custom modules:

### Custom Major Module 1: Production Cloud Deployment & Automated Zero-Touch CI/CD (2 Points)
- **Assigned Member:** `<aysadeq>`

| Evaluation Defense Question | Team Answer & Justification |
| :--- | :--- |
| **1. Why did you choose this module?** | We wanted Skilio to be a genuine, production-grade cloud SaaS accessible worldwide over the public internet, rather than a project limited to `localhost`. |
| **2. How does it fit into the overall project?** | It serves as the production infrastructure backbone. Every team member's code automatically passes quality gates on GitHub Actions and deploys to AWS EC2 in under 2 minutes. |
| **3. How was it implemented?** | • **Cloud Infrastructure:** AWS EC2 (`t3.small`) with static Elastic IP and hardened Linux OS (2GB Swap OOM guard).<br>• **Ingress & SSL:** Traefik 3.6 reverse proxy with automated Let's Encrypt TLS 1.3 certificates and HTTP 308 redirects.<br>• **Zero-Touch CI/CD:** GitHub Actions 3-tier testing gate (lint, unit tests, Docker build) and zero-downtime rolling container swap over SSH `rsync`. |
| **4. Why does it deserve Major (2 Pts) status?** | It coordinates 4 distinct disciplines: Cloud Networking (AWS), Ingress & Security (Traefik SSL), Automated Continuous Delivery (CI/CD), and Zero-Downtime Container Swaps with automated rollbacks. |

### Custom Minor Module 2: Cloud Media & Asset Storage via Cloudinary (1 Point)
- **Assigned Member:** `<zbakour>`, `<arajma>`

| Evaluation Defense Question | Team Answer & Justification |
| :--- | :--- |
| **1. Why did you choose this module?** | Storing profile avatars, portfolio images, and PDF resumes inside Docker containers bloats images, causes data loss on container rebuilds, and degrades performance. |
| **2. How does it fit into the overall project?** | Enables freelancers to showcase multi-image portfolios and upload verified PDF resumes, and allows clients to preview assets directly in the browser. |
| **3. How was it implemented?** | Python Cloudinary SDK integration, secure streaming upload endpoints, automatic thumbnail transformations, and PDF document streaming proxy. |
| **4. Why does it deserve Minor (1 Pt) status?** | Offloads media processing and CDN distribution to dedicated cloud infrastructure with secure signed access and file-type validation. |
