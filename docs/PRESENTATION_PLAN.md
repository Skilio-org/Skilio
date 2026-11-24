# 🎯 Skilio — 42 Final Staff Presentation Blueprint (46 Slides / 60 Mins)

> **Official 42 Curriculum Project:** `ft_transcendence` v21.2  
> **Team:** `<arajma>`, `<aysadeq>`, `<lazmoud>`, `<omorakwant>`, `<zbakour>`  
> **Target Audience:** 42 Evaluation Staff & Technical Directors  
> **Total Time:** ~60 minutes presentation + 30 minutes Q&A & Live Demo  

---

## ⏱️ Master Timeline & Speaker Allocation

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        SKILIO 46-SLIDE MASTER TIMELINE (~60 MINS)                      │
├──────────────┬──────────────┬──────────────┬──────────────┬──────────────┬─────────────┤
│    ACT I     │    ACT II    │   ACT III    │    ACT IV    │    ACT V     │   ACT VI    │
│   Product    │   Backend    │  Real-Time   │   Frontend   │    DevOps    │ Management  │
│  & Problem   │  & Database  │   Systems    │ Architecture │ & Cloud Infra│  & Wrap-up  │
│ (Slides 1-8) │(Slides 9-17) │(Slides 18-24)│(Slides 25-32)│(Slides 33-42)│(Slides 43-46│
│   ~8 Mins    │   ~10 Mins   │   ~8 Mins    │   ~10 Mins   │   ~14 Mins   │   ~8 Mins   │
│   <arajma>   │   <arajma>   │  <lazmoud>   │<zbakour>+<om>│  <aysadeq>   │ Entire Team │
└──────────────┴──────────────┴──────────────┴──────────────┴──────────────┴─────────────┘
```

| Act | Domain | Slides | Speaker (42 Login) | Claimed Modules Covered |
| :---: | :--- | :---: | :--- | :--- |
| **I** | **Product Vision & Business Flow** | 1 – 8 (8 slides) | `<arajma>` (Product Owner) | Market Context & Product Architecture |
| **II** | **Backend & Data Engineering** | 9 – 17 (9 slides) | `<arajma>` (Backend Lead) | IV.1 Backend (2 Pts), IV.1 DB (1 Pt), IV.2 User/OAuth (4 Pts) |
| **III** | **Real-Time Systems & Messaging** | 18 – 24 (7 slides) | `<lazmoud>` (Technical Lead) | IV.4 Live WebSockets & Redis (2 Pts) |
| **IV** | **Frontend Engineering & UI/UX** | 25 – 32 (8 slides) | `<zbakour>` & `<omorakwant>` | IV.1 Frontend (2 Pts), IV.10 Cloudinary (1 Pt), Section III QA |
| **V** | **DevOps, Cloud & Reliability** | 33 – 42 (10 slides) | `<aysadeq>` (Project Manager / DevOps) | IV.10 Cloud CI/CD (2 Pts), IV.7 Obs (2 Pts), IV.7 DR (1 Pt), Sec III |
| **VI** | **Team Retrospective & Live Demo** | 43 – 46 (4 slides) | **All 5 Members** | Chapter II Team Management & Chapter VIII Defense |

---

## 📑 Slide-by-Slide Detailed Breakdown

### Act I: Product Vision, Problem Space & Business Flows (Slides 1–8)
*Lead Speaker: `<arajma>` (Product Owner / Backend Lead)*

* **Slide 1: Title & Mandatory 42 Header**
  * *"This project has been created as part of the 42 curriculum by <arajma>, <aysadeq>, <lazmoud>, <omorakwant>, <zbakour>."*
  * Platform identity: **Skilio — The Freelancer Marketplace In Morocco**.
* **Slide 2: The Moroccan Freelancing Problem Space**
  * Pain points: Fragmented communication (WhatsApp/email), payment distrust, zero verified work history, multi-account friction.
* **Slide 3: The Skilio Solution & Value Proposition**
  * Unified SaaS uniting identity, project discovery, full-duplex negotiation, verified ratings, and cloud infrastructure.
* **Slide 4: Target Personas & Workspaces**
  * Client workspace vs. Freelancer workspace lifecycle under a single account.
* **Slide 5: Dual-Role Identity State Machine**
  * Switching roles on demand without re-logging; transactional creation of client/freelancer profiles.
* **Slide 6: Marketplace Bidding & Contract Lifecycle**
  * State transitions: Job Drafting $\rightarrow$ Public Bidding $\rightarrow$ Real-Time Negotiation $\rightarrow$ Contract Closing.
* **Slide 7: Trust, Verification & Social Graph**
  * Verified 1-to-5 star rating aggregation and bi-directional connection requests.
* **Slide 8: Architectural Transition**
  * Moving from business requirements to technical implementation.

---

### Act II: Backend Architecture & Data Engineering (Slides 9–17)
*Lead Speaker: `<arajma>` (Backend Lead)*

* **Slide 9: Backend Tech Stack & Justification**
  * Python 3.14 + FastAPI + SQLModel + Alembic (Async ASGI vs. synchronous WSGI).
* **Slide 10: Master Relational Schema (19 Tables)**
  * Foreign Keys, index strategies (`pg_trgm`), cascade deletes, and data integrity constraints.
* **Slide 11: Dual-Role Identity & Transactional Integrity**
  * Handling role-switching race conditions via atomic database transactions.
* **Slide 12: Remote Social Authentication**
  * Google OAuth 2.0 & LinkedIn OIDC handshakes with state token CSRF verification.
* **Slide 13: Password Security & Tokenized Recovery**
  * Argon2 / Bcrypt password hashing + tokenized secure email password resets via Mailpit/SMTP.
* **Slide 14: Sourcing Engine & Fuzzy Search**
  * Full-text search and trigram matching (`pg_trgm`) over job categories and freelancer skills.
* **Slide 15: Input Validation & Defensive Coding**
  * Multi-layer Pydantic validation schemas preventing SQL injections and XSS vectors.
* **Slide 16: Public REST API Specification**
  * 5 public endpoints with OpenAPI/Swagger documentation, rate limiting, and pagination.
* **Slide 17: Backend Automated Testing & Quality Gates**
  * 173 Pytest unit/integration tests with an automated 70%+ coverage gate (`scripts/tests-start.sh`).

---

### Act III: Real-Time Systems & Distributed Messaging (Slides 18–24)
*Lead Speaker: `<lazmoud>` (Technical Lead / Real-Time Lead)*

* **Slide 18: Real-Time Architecture Overview**
  * Why WebSockets over HTTP polling (bandwidth, packet overhead, sub-50ms latency).
* **Slide 19: WebSocket Connection Lifecycle**
  * Handshake over `/api/v1/chat/ws`, JWT verification in query parameters, and heartbeat pings.
* **Slide 20: Redis Pub/Sub Distributed Event Bus**
  * Decoupling multiple FastAPI ASGI workers and broadcasting real-time frames across channels.
* **Slide 21: Multi-Device Connection Pooling**
  * The background tab problem: routing incoming WebSocket messages across all open tabs of a user.
* **Slide 22: Threaded Chat Engine**
  * Typing indicators, real-time unread badges, read receipts, and media attachments.
* **Slide 23: Event-Driven In-App Notifications**
  * Real-time alerts for proposals, connection acceptances, reviews, and new direct messages.
* **Slide 24: Connection Resilience & Fault Tolerance**
  * Exponential backoff reconnection, clean close code handling (`1000` normal vs `1006` abnormal).

---

### Act IV: Frontend Engineering & UI/UX Systems (Slides 25–32)
*Lead Speakers: `<zbakour>` (Frontend Lead) & `<omorakwant>` (Frontend / QA)*

* **Slide 25: Modern Frontend Architecture**
  * React 19 + TypeScript + Vite with SWC compiler (instant HMR and sub-second builds).
* **Slide 26: Type-Safe Client-Side Routing**
  * TanStack Router: File-based routing, authenticated route guards, and type-safe URL search params.
* **Slide 27: Async State Management & Cache Invalidation**
  * TanStack React Query: Server state caching, optimistic UI updates, and background refetching.
* **Slide 28: Custom Design System & Theming**
  * Tailwind CSS v4 design tokens, CSS variables, dark/light theme switching with persistence.
* **Slide 29: Complex UI Views & Workspaces**
  * Faceted talent directory with filters, job proposal management board, and message thread UI.
* **Slide 30: Cloud Media Storage & Delivery**
  * Cloudinary CDN integration for avatar uploads, PDF resumes with inline preview, and chat attachments.
* **Slide 31: Mobile-First Responsive Layout**
  * Adaptive navigation sidebars, touch drawers, and fluid typography across viewports.
* **Slide 32: Chrome Compatibility & Zero Console Errors**
  * Subject Section III compliance: Cross-browser QA and zero JavaScript warnings/errors in Chrome.

---

### Act V: Production DevOps, Cloud Infrastructure & Reliability (Slides 1–10)
*Lead Speaker: `<aysadeq>` (Project Manager / DevOps Lead)*

> **Design & Delivery:** Rendered in `docs/devops/slides/` (`slide-01.png`–`slide-10.png` + `deck.html` + `skilio-devops-slides.pdf`) matching Row 0 (`<arajma>`) and Row 1 dark `#0A0D01` + `#B8EF0D` lime theme. Follows [`docs/devops/guides`](devops/guides) (`01 → 06`) order cleanly at a high level.

* **Slide 1: `DevOps & Reliability` (Section Cover)**
  * Title + `Ayman · Project Manager & DevOps Lead` + tagline (*"From local code to live production."*) + 5-item agenda.
* **Slide 2: `The Big Picture`**
  * High-level flow (`User Browser → AWS Server → App & API → DB & Cache → Watch & Save`) + 3 goals (`01 Run reliably`, `02 Ship safely`, `03 Never lose data`).
* **Slide 3: `Docker & Multi-File Compose` (`Stage 01`)**
  * Shared `compose.yml` splitting into local `override` (`make up`) vs. prod `deploy` (prod settings & DB locked) + multi-stage `Dockerfile` (`Bun` build $\rightarrow$ `Python 3.14 UV` runtime).
* **Slide 4: `AWS Cloud & Stability` (`Stage 02`)**
  * AWS EC2 `t3.small` (`16.192.59.166`, IaaS full control), external DB/Redis port lockdown, `make server-init`, and 2GB Swap stability preventing Vite OOM build crashes.
* **Slide 5: `Zero-Touch CI/CD Pipeline` (`Stage 04`)**
  * 4 open steps: `01 Quality Gate` (Ruff + TS), `02 173 Tests` (83% coverage), `03 SSH Sync` (`rsync` without GitHub tokens on AWS), `04 Live Swap` (migrations + `< 2 min` zero-downtime update).
* **Slide 6: `Health Check & Public Status` (`Stage 05 · Detect`)**
  * Real active checks (`/api/v1/health` testing Postgres `SELECT 1`, Redis `PING`, and disk capacity) powering the public `/status` page (auto-refreshing every 10s).
* **Slide 7: `Backups & Disaster Recovery` (`Stage 05 · Protect & Verify`)**
  * Hero `< 5s` verified recovery vs. `60s` target, backed by `01 Automated Daily Backups` (02:00 UTC `.sql.gz`, 7-day retention) and `02 Safe Sandbox Verification` (`make dr-test`).
* **Slide 8: `Observability: Prometheus` (`Stage 06 · Collect`)**
  * Pull-based scraping (`10s–15s`) across 3 layers (`FastAPI`, `Postgres Exporter`, `Google cAdvisor`) for app latency, SQL pool, and container CPU/RAM.
* **Slide 9: `Observability: Grafana & Alerts` (`Stage 06 · Visualize & Alert`)**
  * 3 provisioned Dashboards-as-Code (`FastAPI`, `PostgreSQL`, `Containers`) + 4 anti-flapping alerts (`BackendDown`, `PostgresDown`, `HttpServerErrors`, `ContainerHighMemory`).
* **Slide 10: `DevOps: problems solved` & Live Demo**
  * 3 real lessons (`01 Build crashes → 2GB Swap`, `02 Server secrets → SSH rsync`, `03 Silent failures → Alerts & <5s DR`) + Live Demo checklist (`skilio.works`, `/status`, Grafana, `make dr-test`).

---

### Act VI: Team Management, Post-Mortem & Live Demo (Slides 43–46)
*Lead Speakers: Entire Team*

* **Slide 43: Team Organization & Work Distribution**
  * Clear role breakdown (PO, PM, Tech Lead, Frontend, DevOps) and Git commit distribution.
* **Slide 44: Top 3 Engineering Challenges Solved**
  * 1) Memory spikes during cloud builds (Swap buffer).  
  * 2) Multi-tab WebSocket sync (Connection pooling).  
  * 3) Role-switch race conditions (Transactional locks).  
* **Slide 45: Scalability Roadmap (Next Evolution)**
  * Scaling to 100k users: AWS ECS / Kubernetes, Managed RDS Multi-AZ, and Stripe Escrow.
* **Slide 46: Live Production Demo & Staff Q&A**
  * Screen share: `https://skilio.works`, `/status`, Grafana, and `make dr-test`.
