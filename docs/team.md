# 👥 Team Information & Role Allocation

> 📝 **What to write in this document:**  
> This document details the organizational structure of the development team for the 42 evaluation.  
> - **Evaluator Expectation:** Evaluators want to know who was responsible for what, whether roles were clearly separated, and how leadership/ownership was handled.  
> - **What you need to complete:**  
>   1. Verify and fill in each team member's full name, 42 login, assigned role (PO, PM, Tech Lead, Full-stack Dev, DevOps Lead, etc.), and contact email.  
>   2. Write 2-3 sentences explaining each member's primary responsibilities and areas of ownership.  
>   3. Complete the RACI (Responsible, Accountable, Consulted, Informed) matrix below to demonstrate clear teamwork.

---

## 1. Team Roster & Role Overview

*Note: Below are the 5 contributors identified from git history and project records. Please adjust names, logins, and roles to match your official 42 intra team registration.*

| 42 Login | Full Name | Primary Role(s) | Focus Area | Contact |
| :--- | :--- | :--- | :--- | :--- |
| `<aysadeq>` | [Ayman Sadik] | **DevOps Lead / Infrastructure Architect** | Cloud (AWS EC2), Docker Compose, CI/CD, Traefik SSL, Backups & DR | `[email@42.fr]` |
| `<arajma>` | [Amine Rajma] | **Backend Lead / Security Specialist** | FastAPI, SQLModel ORM, Authentication (JWT/Argon2), Input Validation | `[email@42.fr]` |
| `<lazmoud>` | [Lahoucine Azmoud] | **Full-Stack Developer / Real-Time Lead** | WebSocket Chat Engine, Redis Pub/Sub, Chat UI, Proposals Workflow | `[email@42.fr]` |
| `<omorakwant>`| [Osama Dahriz] | **Frontend Lead / UI-UX Architect** | React 19, Tailwind CSS v4, Landing Page, Navigation, Responsive Layout | `[email@42.fr]` |
| `<zbakour>` | [Zakaria Bakour] | **Product Owner / QA & Full-Stack Dev** | Talent Directory, Job Management, Reviews, Testing, Currency/Locale | `[email@42.fr]` |

---

## 2. Detailed Member Responsibilities

> 💡 **Tip for Team Members:** In the sections below, describe the exact scope of your responsibilities during the project. Avoid generic statements like *"worked on frontend"*; instead write *"designed and implemented the dual-role routing guard in TanStack Router and integrated the Cloudinary asset upload widget"*.

### 👤 `<aysadeq>` — DevOps Lead & Cloud Infrastructure Architect
- **Assigned Role(s):** DevOps Lead, Systems Administrator.
- **Key Responsibilities:**
  - Designed and configured the AWS EC2 production hosting environment with Elastic IP and Linux kernel hardening (Swap/OOM protection).
  - Built the multi-stage `Dockerfile` and multi-environment `docker compose` orchestrations (`compose.yml`, `compose.override.yml`, `compose.deploy.yml`).
  - Implemented the Traefik 3.6 reverse proxy with automated Let's Encrypt TLS 1.3 certificates and dynamic container routing.
  - Engineered the 3-tier GitHub Actions CI/CD pipeline and automated zero-downtime rolling deployment over SSH `rsync`.
  - Built the automated PostgreSQL backup daemon (`.sql.gz`), retention rotation, and sub-60s disaster recovery verification drill (`make dr-test`).
  - Configured Prometheus and Grafana observability stack for real-time application and system telemetry.

### 👤 `<arajma>` — Backend Lead & API Architect
- **Assigned Role(s):** Backend Tech Lead, Security Lead.
- **Key Responsibilities:**
  - Designed the relational data schema in SQLModel (SQLAlchemy 2.0 + Pydantic v2) with foreign key constraints and cascade rules.
  - Implemented secure authentication with Argon2/Bcrypt password hashing and stateless PyJWT token lifecycles.
  - Integrated OAuth 2.0 social login (Google OAuth & LinkedIn OIDC) with automated user and profile provisioning.
  - Built robust input sanitization, Pydantic field validators, and error handling middleware across all REST endpoints.
  - Configured database migrations using Alembic and developed automated prestart migration gates.

### 👤 `<lazmoud>` — Real-Time Systems & Messaging Lead
- **Assigned Role(s):** Full-Stack Developer, Real-Time Systems Specialist.
- **Key Responsibilities:**
  - Architected the bidirectional WebSocket messaging server (`/api/v1/chat/ws`) with typing indicators, presence, and read receipts.
  - Implemented distributed message routing through Redis Pub/Sub channels (`user:{id}:events`) with graceful in-memory fallback.
  - Developed the client-side messaging interface in React, including auto-scroll, message acknowledgements, and conversation threading.
  - Implemented proposal submission workflows, contract status changes (`pending`, `accepted`, `rejected`), and real-time alerts.

### 👤 `<omorakwant>` — Frontend Lead & UI/UX Architect
- **Assigned Role(s):** Frontend Lead, UI/UX Designer.
- **Key Responsibilities:**
  - Set up modern frontend architecture with React 19, TypeScript 6, Vite 8 (SWC), and Tailwind CSS v4.
  - Designed the design system and component primitives utilizing Radix UI and shadcn/ui.
  - Built the responsive landing page, unified navigation bar (`TopNav`), faceted search bars, and category badges.
  - Created client-side route layouts, persistent dark/light theming, and mobile-friendly responsive viewports.
  - Enforced frontend code cleanliness, bundle optimization, and linting standards with Biome.

### 👤 `<zbakour>` — Product Owner & Full-Stack Developer
- **Assigned Role(s):** Product Owner (PO), Full-Stack Developer, QA Lead.
- **Key Responsibilities:**
  - Defined product requirements, user stories, acceptance criteria, and project scope alignment with 42 evaluation guidelines.
  - Built the Talent Directory with dynamic filters (skills, hourly rate, availability, category) and talent profile detail pages.
  - Implemented the Client Job Posting management interface (creation, status update, budget configuration).
  - Developed the ratings and reviews system, ensuring client-to-freelancer feedback integrity and average score calculations.
  - Conducted end-to-end user testing, cross-browser verification, and currency/localization standardization.

---

## 3. RACI Responsibility Matrix

> 📝 **What to write:** The RACI matrix defines accountability across the project's key domains:
> - **R (Responsible):** The person who does the work.
> - **A (Accountable):** The person who has final approval and ownership.
> - **C (Consulted):** People who provide input and feedback.
> - **I (Informed):** People kept updated on progress.

| Project Domain / Deliverable | `<aysadeq>` | `<arajma>` | `<lazmoud>` | `<omorakwant>` | `<zbakour>` |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **System Architecture & Cloud Infra** | **A / R** | C | C | I | C |
| **Docker Containerization & Compose** | **A / R** | C | I | I | I |
| **CI/CD Pipeline & Deploy Automation**| **A / R** | C | I | I | I |
| **Database Modeling & Migrations**    | C | **A / R** | C | I | C |
| **Authentication & Authorization**    | C | **A / R** | C | C | I |
| **Real-Time WebSocket & Redis Engine**| C | C | **A / R** | C | I |
| **Frontend Architecture & Routing**   | I | I | C | **A / R** | C |
| **Talent & Job Marketplace Features** | I | C | C | C | **A / R** |
| **Disaster Recovery & Status Page**   | **A / R** | I | I | C | I |
| **Documentation & 42 Defense Prep**   | C | C | C | C | **A / R** |
