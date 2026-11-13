# 👤 Individual Contributions & Technical Defense

> 📝 **What to write in this document:**  
> This document provides a transparent, detailed breakdown of each team member's personal contributions, implemented features/modules, technical challenges faced, and how those challenges were resolved.  
> - **Evaluator Expectation:** Evaluators review individual contributions to determine individual grades. They test whether every member genuinely wrote the code they claim, understands the underlying concepts, and can explain how they overcame real bugs. Being honest about challenges proves technical maturity.  
> - **What you need to complete:**  
>   1. Personalize each team member's section below with your specific components, files, and git commits.  
>   2. Write 1-2 real technical challenges you encountered during development and clearly explain how you debugged and solved them.  
>   3. Prepare to speak to these exact points during your evaluation defense.

---

## 1. Member Contribution Summary

| Member Login | Full Name | Core Contributions | Claimed Modules |
| :--- | :--- | :--- | :--- |
| `<aysadeq>` | [Ayman Sadik] | Cloud Infrastructure (AWS), Docker Compose, Traefik TLS, CI/CD, DB Backup Daemon & DR, Prometheus & Grafana | IV.10 Major, IV.7 Major, IV.7 Minor, Sec III |
| `<arajma>` | [Amine Rajma] | FastAPI REST API, SQLModel schemas, Alembic migrations, JWT/Argon2 auth, Google/LinkedIn OAuth, Input Validation | IV.1 Major, IV.1 Minor, IV.2 Major |
| `<lazmoud>` | [Lahoucine Azmoud] | WebSocket messaging server, Redis Pub/Sub event bus, chat frontend UI, message deletion, proposal workflows | IV.4 Major |
| `<omorakwant>`| [Osama Dahriz] | React 19 SPA architecture, Tailwind CSS v4 design system, dual-role state sync (`useSyncExternalStore`), TanStack routing & guards, responsive mobile UX, landing page redesign | IV.1 Major, IV.2 Major |
| `<zbakour>` | [Zakaria Bakour] | Talent directory & faceted search, job post management, review & rating engine, status page UI, QA & localization | IV.10 Minor |

---

## 2. Detailed Individual Breakdown & Defense

---

### 👤 `<aysadeq>` — DevOps Lead
#### 🛠️ Implemented Components & Codebase Footprint:
- **Cloud Infrastructure & Networking:** AWS EC2 deployment, static Elastic IP (`16.192.59.166`), security groups, and automated Linux server initialization script (`devops/scripts/server-init.sh`).
- **Containerization:** Multi-stage `Dockerfile`, root `compose.yml`, local development overrides (`compose.override.yml`), and cloud deployment overrides (`compose.deploy.yml`).
- **Ingress & TLS:** Traefik 3.6 setup with ACME Let's Encrypt TLS 1.3 automated certificate issuing and HTTP $\rightarrow$ HTTPS redirection.
- **CI/CD Automation:** `.github/workflows/ci-cd.yml` executing a 3-tier testing gate (lint, pytest, Docker build) and zero-downtime rolling deployment over SSH `rsync`.
- **Disaster Recovery:** Automated PostgreSQL backup daemon with gzip compression, retention manager, and `<60s` verification drill script (`devops/backup/dr-test.sh`).
- **Observability:** Prometheus scrape configurations and Grafana monitoring dashboards for live server telemetry.

#### 🧗 Technical Challenges Faced & Solutions:
1. **Challenge — Linux OOM Exit 137 during Frontend Build on AWS:**  
   - *Problem:* Running `bun run build` during Docker image creation on the AWS `t3.small` instance exceeded the 2GB physical RAM limit, causing the Linux kernel OOM Killer to abruptly terminate the build process with Exit Code 137.  
   - *Solution:* Implemented an automated 2GB swapfile creation routine in `server-init.sh` (`fallocate -l 2G /swapfile`) with `vm.swappiness=10`, giving Vite sufficient virtual memory to finish bundling without affecting system stability.
2. **Challenge — Zero-Downtime Deployment with Database Schema Migrations:**  
   - *Problem:* Updating containers while running database migrations could cause incoming client requests to hit an inconsistent schema.  
   - *Solution:* Structured the deployment pipeline into sequential phases: ephemeral migration container execution (`run --rm backend prestart.sh`) before swapping live containers (`up -d --remove-orphans`).

---

### 👤 `<arajma>` — Backend Lead & Security Specialist
#### 🛠️ Implemented Components & Codebase Footprint:
- **Data Modeling & Migrations:** Designed SQLModel entity relationships in `backend/app/models.py` and configured Alembic revision tracking.
- **Authentication & Authorization:** Implemented Argon2/Bcrypt password hashing in `backend/app/core/security.py`, stateless JWT tokens, and Google / LinkedIn OAuth 2.0 endpoints.
- **API Architecture:** Built CRUD services (`backend/app/crud.py`) and REST endpoints for users, profiles, jobs, and proposals.
- **Input Sanitization & Security:** Added robust Pydantic field validators for HTTPS URLs, skill counts, and character lengths with automated unit tests (`backend/tests/`).

#### 🧗 Technical Challenges Faced & Solutions:
1. **Challenge — Secure Dual-Role Switching without Session Corruption:**  
   - *Problem:* Users needed to switch roles without re-authenticating, but missing profile records could lead to null pointer exceptions in client dashboards.  
   - *Solution:* Built `POST /users/me/switch-role` with atomic profile auto-provisioning: if the target profile does not exist, the backend automatically initializes an empty draft profile before updating the user's active role.
2. **Challenge — Social OAuth User Provisioning with Secure Password Constraints:**  
   - *Problem:* Social login users lack a local password, but the relational schema requires non-nullable password hashes for standard email login fallback.  
   - *Solution:* Generated cryptographically secure random 12-character passwords hashed with Argon2 upon first OAuth registration, preventing password-bypass exploits.

---

### 👤 `<lazmoud>` — Real-Time Systems & Full-Stack Developer
#### 🛠️ Implemented Components & Codebase Footprint:
- **WebSocket Gateway:** Engineered `WS /api/v1/chat/ws` endpoint in FastAPI with JWT query authentication and multi-socket connection pooling (`ConnectionManager`).
- **Redis Pub/Sub Event Bus:** Implemented distributed event publishing across `user:{id}:events` channels with automatic fallback to local memory when Redis is absent.
- **Chat Interface:** Developed responsive chat UI in React with real-time typing indicators, read receipts, auto-scroll, and message deletion capabilities.
- **Proposals & Bidding Workflow:** Created proposal submission models, cover letter handling, and status transition endpoints (`pending` $\rightarrow$ `accepted` / `rejected`).

#### 🧗 Technical Challenges Faced & Solutions:
1. **Challenge — Message Synchronization across Multiple Active Device Tabs:**  
   - *Problem:* When a user had multiple browser tabs open, incoming WebSocket messages were only arriving at one random socket.  
   - *Solution:* Refactored `ConnectionManager` to store a `set[WebSocket]` for each `user_id`. When an incoming message arrives from Redis, it broadcasts simultaneously to all active sockets belonging to that user.
2. **Challenge — Distributed Chat in Local Development without Redis:**  
   - *Problem:* Developers working offline without Redis running suffered socket connection crashes.  
   - *Solution:* Implemented graceful fallback logic in `publish_to_user()`: the service detects Redis connection failures and dispatches directly to the local in-memory socket manager without throwing errors.

---

### 👤 `<omorakwant>` — Frontend Lead & UI/UX Architect
#### 🛠️ Implemented Components & Codebase Footprint:
- **Frontend Architecture & Tooling:** Structured React 19 SPA with Vite, TypeScript 6, Biome linting/formatting, and environment configuration.
- **Design System & Components:** Configured Tailwind CSS v4 with custom color themes, Radix UI primitives, custom scrollbar utilities, and shadcn/ui components.
- **Dual-Role State Synchronization:** Engineered multi-tab and multi-component client/freelancer role synchronization using `useSyncExternalStore` in `frontend/src/features/account/useAccountRole.ts` with custom broadcast events (`skilio:account-role-changed`), eliminating reload requirements.
- **Routing & Route Guards:** Configured TanStack Router file-based routing with programmatic `beforeLoad` authentication and role redirection (`/dashboard` vs `/freelancer-dashboard`), typed Zod URL search validation, and nested layout route outlets.
- **Landing Page & Navigation UX:** Built Moroccan-localized landing page (`frontend/src/routes/index.tsx`), animated `HeroSection`, category cards, and responsive `TopNav` with auth-aware single-click dashboard navigation.
- **Mobile Ergonomics & Responsive UI:** Overhauled `/connects` purchasing interface with sticky viewport-pinned mobile action bars (`fixed bottom-0 z-40 md:static`) and responsive touch-target layouts.
- **Dashboard Optimization & Onboarding:** Cleaned up client dashboard onboarding clutter and implemented auto-dismissal logic for `FreelancerProfileReadinessCard` when reaching 100% completion.
- **Scroll Affordances & Accessible Menus:** Resolved global scrollbar suppression issues in `CategorySelect.tsx` with custom thin scrollbars, partial item height slicing (`max-h-[268px]`), and live selection counters.
- **Documentation & 42 Defense Preparation:** Authored comprehensive frontend architectural specifications and 42 peer/Bocal defense guides in `docs/ossama/`.

#### 🧗 Technical Challenges Faced & Solutions:
1. **Challenge — Multi-Tab & Dual-Role Synchronization without Concurrent Tearing:**  
   - *Problem:* Switching roles between client and freelancer in one component or browser tab left the top navigation, route guards, and dashboards in inconsistent states, previously requiring full browser reloads (`window.location.reload()`) that wiped out client cache and broke SPA continuity.  
   - *Solution:* Implemented a native React 19 `useSyncExternalStore` hook in `useAccountRole.ts`. It subscribes simultaneously to browser `storage` events (for cross-tab synchronization) and an internal `CustomEvent('skilio:account-role-changed')` (for intra-tab instant synchronization). All components re-render simultaneously with zero tearing and without refreshing the page.
2. **Challenge — Global Scrollbar Suppression vs Dropdown Scroll UX:**  
   - *Problem:* A global `* { scrollbar-width: none; }` and `::-webkit-scrollbar { display: none; }` rule in `globals.css` completely hid scrollbars across the application. In dropdown menus like `CategorySelect`, users had no visual indicator that the list was scrollable beyond the first visible items.  
   - *Solution:* Configured a scoped `.scrollbar-thin` utility in Tailwind v4 that overrides global hidden styles with high-specificity selectors. In `CategorySelect.tsx`, tuned the container height to `max-h-[268px]` (creating a visual item slice cut-off affordance) and added a sticky live status footer showing exact visible items and scroll hints.
3. **Challenge — Tailwind CSS v4 Migration & Dynamic Theming:**  
   - *Problem:* Tailwind v4 introduced fundamental changes to CSS variable handling and build-time pipeline, causing custom component styles from shadcn/ui to break.  
   - *Solution:* Migrated the project to `@tailwindcss/vite` and restructured base styling using modern CSS variables, ensuring seamless dark/light theme switching.

---

### 👤 `<zbakour>` — Product Owner & Full-Stack Developer
#### 🛠️ Implemented Components & Codebase Footprint:
- **Talent Discovery Platform:** Built faceted talent directory with search filters by category, hourly rate, and skills.
- **Job Management:** Implemented client job post creation, editing, closing, and budget selection (fixed vs hourly).
- **Ratings & Reviews System:** Created 1-5 star review forms, average rating computation, and public testimonials display.
- **Public System Status UI:** Developed `/status` dashboard with auto-refreshing health indicators and latency monitoring.
- **Product Quality & QA:** Verified cross-browser compatibility on Google Chrome with zero console errors and standardized currency/localization.

#### 🧗 Technical Challenges Faced & Solutions:
1. **Challenge — Deduplication of Reviews and Bookmarks:**  
   - *Problem:* Accidental double-clicks on submit buttons were creating duplicate review records and bookmark entries.  
   - *Solution:* Enforced database composite unique constraints (`UNIQUE(client_id, freelancer_id)` for reviews and `UNIQUE(freelancer_id, job_post_id)` for saved jobs) paired with optimistic UI disabling on submit.
2. **Challenge — Multi-Filter Talent Search Query Performance:**  
   - *Problem:* Filtering talent by multiple dynamic skills and salary ranges was generating sluggish SQL queries.  
   - *Solution:* Optimized SQLModel queries using indexed JSONB contains operators and structured parameter filtering on the backend.
