*This project has been created as part of the 42 curriculum by <arajma>, <aysadeq>, <lazmoud>, <omorakwant>, <zbakour>.*

# Skilio — Freelancer Marketplace Platform

[![Live Production](https://img.shields.io/badge/Production-skilio.works-success.svg)](https://skilio.works)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Skilio is a full-stack, production-grade freelancer marketplace connecting independent professionals with clients. Built as the final capstone project (`ft_transcendence`) for the 42 Common Core curriculum, Skilio provides a complete end-to-end platform with dual-role accounts, real-time messaging, secure cloud infrastructure, and automated disaster recovery.

- **Live Production Application:** [https://skilio.works](https://skilio.works)
- **Live System Telemetry:** [https://grafana.skilio.works](https://grafana.skilio.works)

---

## Table of Contents
1. [Description](#1-description)
2. [Instructions & Quick Start](#2-instructions--quick-start)
3. [Team Information](#3-team-information)
4. [Project Management](#4-project-management)
5. [Technical Stack](#5-technical-stack)
6. [Database Schema](#6-database-schema)
7. [Features List](#7-features-list)
8. [Subject Modules](#8-subject-modules)
9. [Individual Contributions](#9-individual-contributions)
10. [Resources & AI Usage Disclosure](#10-resources--ai-usage-disclosure)
11. [Known Limitations & Roadmap](#11-known-limitations--roadmap)
12. [License](#12-license)

---

## 1. Description

### Project Goal & Overview
Finding and hiring freelance talent often suffers from fragmented tools. clients and freelancers switch between job boards, messaging apps, and external storage. Skilio solves this by unifying the entire freelance lifecycle into a single platform:
1. **Dual-Role Identity:** A single login allows users to switch between Client and Freelancer roles on demand, with automatic profile generation and role-specific navigation.
2. **Live Messaging:** Full-duplex messaging with online status, and multi-device synchronization via WebSockets and Redis.
3. **End-to-End Workflow:** Clients post jobs, freelancers submit bids with cover letters, contracts are negotiated in real time, and verified reviews establish public trust.
4. **Observability & Status:** Public real-time diagnostic page (`/status`), Prometheus scraping, and Grafana telemetry.
5. **Cloud-Native & Production-Ready:** Deployed on AWS EC2 behind a Traefik 3.6 TLS reverse proxy, automated with 3-tier GitHub Actions CI/CD, daily database backups, and sub-60s disaster recovery drills.

---

## 2. Instructions & Quick Start

Get Skilio up and running locally in under two minutes using Docker.

### Prerequisites
Before you start, make sure you have installed:
- [Docker Engine](https://docs.docker.com/engine/install/) (`>= 24.0`) and Docker Compose (`v2`)
- [GNU Make](https://www.gnu.org/software/make/)
- Modern web browser (Google Chrome recommended)

> Note: All application runtimes and dependencies (Python 3.14, Node.js, Bun, PostgreSQL 18, Redis) run completely inside containers. No local language setup is needed on your host machine.

---

### Step-by-Step Quick Start

1. **Clone the repository:**
   ```bash
   git clone git@github.com:Skilio-org/Skilio.git
   cd Skilio
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   *(The default values in `.env.example` are pre-configured to work out of the box for local testing, except for external apis).*

3. **Start the platform (Single Command):**
   ```bash
   make up
   ```
   This single command builds and starts the full stack (Traefik reverse proxy, PostgreSQL, Redis, FastAPI backend, React SPA, Prometheus, Grafana, Mailpit, and the backup daemon). Database migrations and the default administrator account are automatically created on startup.

---

### Service Access URLs

| Service | Local URL | Description |
| :--- | :--- | :--- |
| **Skilio Web App** | [https://localhost:8443](https://localhost:8443) | Full-stack platform via Traefik HTTPS |
| **Interactive API Docs** | [https://localhost:8443/docs](https://localhost:8443/docs) | Swagger UI for exploring backend endpoints |
| **Public Status Page** | [https://localhost:8443/status](https://localhost:8443/status) | Real-time health diagnostic badges |
| **Grafana Monitoring** | [http://localhost:3000](http://localhost:3000) | Live telemetry dashboards |
| **Prometheus TSDB** | [http://localhost:9090](http://localhost:9090) | Scrape metrics and alerting engine |
| **Mailpit Sandbox** | [http://localhost:8025](http://localhost:8025) | Local SMTP mailbox for password resets |
| **Traefik Dashboard** | [http://localhost:8090](http://localhost:8090) | Reverse proxy ingress rules & routers |

---

> **Note:** Run `make help` to view all available commands.

---

## 3. Team Information

The development team consists of 5 members with clearly separated leadership and technical ownership:

- **`Product Owner`** - *(Amine Rajma)* : Maintained the product backlog, decided on features and priorities, validated completed work, and handled internal communication between team members.
- **`Project Manager`** - *(Ayman Sadik)*: Coordinates the team by running meetings and planning sessions, tracking progress and deadlines, keeping communication clear, and resolving risks and blockers.
- **`Technical Lead`** *(Lahoucine Azmoud)*: Defines the technical architecture, chooses the tech stack, maintains code quality and best practices, and reviews critical code changes.
- **`Developers`** *(Osama Dahriz, Zakaria Bakour, and all the others)*: Builds and tests assigned features and modules, participates in code reviews, and documents the work.

**Note:** more details about individual contributions and technical roles can be found in [section 9](#9-individual-contributions).

---

## 4. Project Management

The team used a straightforward and collaborative project management approach centered on domain ownership and direct communication:

- **Task Organization & Distribution:**
  - Work was divided by technical domain based on each member's core focus (DevOps, Backend, Real-Time Systems, Frontend UI, and QA).
  - Tasks, priorities, and feature requirements were discussed and agreed upon during team meetings.

- **Discord Server:**
  - All project management and day-to-day coordination took place on a dedicated team Discord server.
  - **Issues and Tasks channels:** Used for falagging issues and bugs, and then turn them into tasks tickets for the team member responsible of the domain.
  - **Meetings and Organization:** Organized into dedicated channels for meetings, task updates, and general communication.

- **Meetings & In-Person Syncs:**
  - Regular online check-ins on Discord to review completed work, resolve blockers, and plan upcoming tasks.
  - In-person working sessions in the meeting rooms on campus for architectural discussions, whiteboarding, and integration testing.

---

## 5. Technical Stack

| Layer | Technologies | Justification & Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 19, TypeScript 6, Vite 8, Tailwind CSS v4, TanStack Router & Query | Modern component architecture, type safety, instant client-side routing, optimistic caching. |
| **Backend** | Python 3.14, FastAPI, SQLModel, Alembic, Pydantic v2 | Asynchronous high concurrency, automatic OpenAPI schemas, type-safe validation, and smooth migrations. |
| **Database** | PostgreSQL 18 | ACID transactions prevent double-bidding or booking conflicts; native JSONB stores dynamic skill arrays. |
| **Cache & Bus** | Redis 8 | In-memory message broker for real-time WebSocket pub/sub across multi-user sessions. |
| **Cloud Storage** | Cloudinary SDK | Dedicated media storage and CDN delivery for user avatars, portfolio assets, and streamed PDF resumes. |
| **Ingress & Proxy** | Traefik 3.6 | Dynamic Docker socket discovery, automated Let's Encrypt TLS 1.3 certificates, and HTTP 308 redirects. |
| **Cloud Hosting** | AWS EC2, Ubuntu 24.04 | Dedicated production cloud server with static Elastic IP and memory buffer preventing OOM crashes. |
| **Observability** | Prometheus 2.54, Grafana 11.2, cAdvisor, postgres-exporter | Metrics pull model, Dashboards-as-Code in "Skilio" folder, and automated threshold alerts. |

### Why PostgreSQL was chosen over NoSQL:
Marketplaces are fundamentally relational. A user owns profiles, a client creates jobs, a freelancer submits proposals linked to jobs, and clients write reviews linked to completed contracts. PostgreSQL ensures strict relational integrity with foreign keys and cascading deletes, preventing orphan records or corrupted application state.

---

## 6. Database Schema

The relational database consists of 18 normalized tables managed through SQLModel and Alembic migrations.

### Core Entity-Relationship Diagram

```mermaid
erDiagram
    USER ||--o| FREELANCER_PROFILE : "owns (1:1)"
    USER ||--o| CLIENT_PROFILE : "owns (1:1)"
    USER ||--o{ JOB_POST : "posts as client (1:N)"
    USER ||--o{ PROPOSAL : "submits as freelancer (1:N)"
    USER ||--o{ CONVERSATION : "participates (client or freelancer)"
    USER ||--o{ CHAT_MESSAGE : "sends (1:N)"
    USER ||--o{ MEDIA : "uploads (1:N)"
    USER ||--o{ REVIEW : "authors as client (1:N)"
    USER ||--o{ LIKED_FREELANCER : "favorites as client (1:N)"
    USER ||--o{ SAVED_JOB : "bookmarks as freelancer (1:N)"
    USER ||--o{ RECENT_SEARCH : "records queries (1:N)"
    USER ||--o{ CONNECTION : "participates (sender or receiver)"
    USER ||--o{ NOTIFICATION : "receives (1:N)"
    USER ||--o{ PASSWORD_RESET_TOKEN : "requests via email (1:N)"

    FREELANCER_PROFILE ||--o{ EXPERIENCE : "has (1:N)"
    FREELANCER_PROFILE ||--o{ EDUCATION : "has (1:N)"
    FREELANCER_PROFILE ||--o{ PORTFOLIO_ITEM : "showcases (1:N)"
    FREELANCER_PROFILE ||--o{ MEDIA : "portfolio attachments (1:N)"
    FREELANCER_PROFILE ||--o{ REVIEW : "receives (1:N)"
    FREELANCER_PROFILE ||--o{ LIKED_FREELANCER : "targeted by (1:N)"

    JOB_POST ||--o{ PROPOSAL : "receives (1:N)"
    JOB_POST ||--o{ SAVED_JOB : "saved by (1:N)"
    JOB_POST ||--o{ CONNECTION : "referenced in (0..1:N)"
    JOB_POST ||--o{ NOTIFICATION : "target for notification"

    CONVERSATION ||--o{ CHAT_MESSAGE : "contains (1:N)"
    CHAT_MESSAGE ||--o| MEDIA : "optional attachment (0..1:1)"
    CHAT_MESSAGE ||--o{ NOTIFICATION : "target for notification"

    PROPOSAL ||--o{ NOTIFICATION : "target for notification"
    CONNECTION ||--o{ NOTIFICATION : "target for notification"
    REVIEW ||--o{ NOTIFICATION : "target for notification"

    USER {
        uuid id PK
        string email UK "indexed, max 255"
        string hashed_password
        string full_name "max 100"
        string active_role "client | freelancer"
        boolean is_active "default true"
        boolean is_superuser "default false"
        boolean is_email_verified "default false"
        string avatar_url "max 2000, fallback default"
        string google_id "max 255"
        string linkedin_id "max 255"
        string refresh_token
        timestamptz created_at
    }

    PASSWORD_RESET_TOKEN {
        uuid id PK
        string token_hash UK "indexed, 64-char sha256"
        string email "indexed, max 255"
        timestamptz expires_at
        timestamptz used_at
    }

    FREELANCER_PROFILE {
        uuid id PK
        uuid user_id FK "UK (1:1 with user)"
        string title "max 100"
        string bio "max 3000 chars"
        float hourly_rate "10 - 5000 DH"
        int years_of_experience
        boolean is_available "default true"
        string availability "max 100"
        string hours "max 100"
        string category "indexed, max 100"
        boolean finished "default false"
        string location "max 255"
        string timezone "max 100"
        string languages "max 500"
        string avatar_url "max 2000, fallback default"
        string resume_url "max 2048, Cloudinary PDF"
        string resume_public_id "max 255"
        json skills "JSON array of skill tags"
        timestamptz created_at
        timestamptz updated_at
    }

    CLIENT_PROFILE {
        uuid id PK
        uuid user_id FK "UK (1:1 with user)"
        string company "max 100"
        string company_role "max 100"
        string company_website "max 2048, https"
        string company_size "solo | 2-10 | 11-50 | 51-200 | 201-plus"
        string location "max 255"
        string description "max 5000 chars"
        string avatar_url "max 2000, fallback default"
        timestamptz created_at
        timestamptz updated_at
    }

    JOB_POST {
        uuid id PK
        uuid client_id FK "user.id"
        string title "max 100"
        string description "max 5000 chars, includes experience level"
        string budget_type "fixed | hourly"
        float budget "DH"
        string location "max 255"
        string category "indexed, max 100"
        string status "draft | open | closed"
        json skills "JSON array of skill tags"
        timestamptz created_at
        timestamptz updated_at
    }

    PROPOSAL {
        uuid id PK
        uuid job_post_id FK "jobpost.id"
        uuid freelancer_id FK "user.id"
        string status "draft | pending | accepted | rejected"
        string cover_letter "max 3000 chars"
        timestamptz created_at
        timestamptz updated_at
    }

    REVIEW {
        uuid id PK
        uuid client_id FK "user.id"
        uuid freelancer_id FK "freelancerprofile.id"
        int rating "1 - 5 stars"
        string comment "max 400 chars"
        timestamptz created_at
        timestamptz updated_at
    }

    LIKED_FREELANCER {
        uuid id PK
        uuid client_id FK "user.id"
        uuid freelancer_id FK "freelancerprofile.id"
        timestamptz created_at
    }

    SAVED_JOB {
        uuid id PK
        uuid freelancer_id FK "user.id"
        uuid job_post_id FK "jobpost.id"
        timestamptz created_at
    }

    CONVERSATION {
        uuid id PK
        uuid client_id FK "user.id"
        uuid freelancer_id FK "user.id"
        uuid creator_id FK "user.id"
        int unread_count "default 0"
        timestamptz created_at
        timestamptz updated_at
    }

    CHAT_MESSAGE {
        uuid id PK
        uuid conversation_id FK "conversation.id"
        uuid sender_id FK "user.id"
        uuid attachment_id FK "media.id, SET NULL"
        string content "max 5000 chars"
        boolean is_read "default false"
        timestamptz created_at
    }

    MEDIA {
        uuid id PK
        uuid uploader_id FK "user.id"
        uuid freelancer_profile_id FK "freelancerprofile.id, nullable"
        string title "max 255"
        string description "max 1000"
        string media_type "avatar | resume | portfolio_image | chat_attachment | other"
        string public_id "indexed Cloudinary public ID"
        string url "max 2048"
        string resource_type "default image"
        string format "max 20"
        int bytes
        int width
        int height
        timestamptz created_at
    }

    EXPERIENCE {
        uuid id PK
        uuid freelancer_profile_id FK "freelancerprofile.id"
        string title "max 100"
        string organization "max 100"
        string detail "max 1000 chars"
        string url "max 2048, https"
        timestamptz created_at
        timestamptz updated_at
    }

    EDUCATION {
        uuid id PK
        uuid freelancer_profile_id FK "freelancerprofile.id"
        string institution "max 100"
        string degree "max 100"
        string field_of_study "max 100"
        string start_date "max 50"
        string end_date "max 50"
        string description "max 1000"
        string title "max 100"
        string organization "max 100"
        string detail "max 1000"
        string url "max 2048, https"
        timestamptz created_at
    }

    PORTFOLIO_ITEM {
        uuid id PK
        uuid freelancer_profile_id FK "freelancerprofile.id"
        string title "max 100"
        string description "max 1000"
        string image_url "max 2048"
        string organization "max 100"
        string detail "max 1000"
        string url "max 2048, https"
        timestamptz created_at
        timestamptz updated_at
    }

    RECENT_SEARCH {
        uuid id PK
        uuid user_id FK "user.id, indexed"
        string query "max 255"
        timestamptz created_at
    }

    CONNECTION {
        uuid id PK
        uuid sender_id FK "user.id, indexed"
        uuid receiver_id FK "user.id, indexed"
        uuid client_id FK "user.id, indexed"
        uuid freelancer_id FK "user.id, indexed"
        uuid job_post_id FK "jobpost.id, nullable, indexed"
        string status "indexed: pending | accepted | declined | withdrawn"
        string note "max 300 chars"
        timestamptz created_at
        timestamptz updated_at
        timestamptz responded_at
    }

    NOTIFICATION {
        uuid id PK
        uuid user_id FK "user.id, indexed recipient"
        uuid proposal_id FK "proposal.id, nullable, indexed"
        uuid connection_id FK "connection.id, nullable, indexed"
        uuid review_id FK "review.id, nullable, indexed"
        uuid chat_message_id FK "chatmessage.id, nullable, indexed"
        uuid job_post_id FK "jobpost.id, nullable, indexed"
        string event "indexed: NotificationEvent"
        string title "max 255"
        string content "max 5000 chars"
        boolean is_read "indexed, default false"
        timestamptz created_at
    }
```

### Key Entities & Architecture

- **Identity & Profiles:** Unified `user` with OAuth/JWT auth, 1:1 dual workspaces (`client_profile`, `freelancer_profile`), and credential records (`experience`, `education`, `portfolio_item`, `password_reset_token`).
- **Marketplace & Networking:** Bidding workflow via `job_post` and `proposal`, paired with `connection` networking, bookmarking (`saved_job`, `liked_freelancer`), and verified `review` ratings.
- **Communication & Platform Services:** Threaded live chat via `conversation` and `chat_message`, Cloudinary `media` assets, `recent_search` caching, and event-driven `notification` alerts.

---

## 7. Features List

- **Authentication & Security**  *(Lazmoud)*: supports Google OAuth 2.0, LinkedIn OIDC, and local sign-in with Argon2 password hashing, JWT sessions, email verification.
- **Dual-Role Workspace Switching**  *(Arajma, Zbakour, Odahriz)*: Real-time toggle between Client and Freelancer modes under a single user identity, with diffrent UI for each role selected.
- **Freelancer Showcase**  *(Arajma, Odahriz)*: presents freelancer's preferences and expertise, supported by work history, portfolio samples and resume and other sections.
- **Client workspace**  *(Arajma, Zbakour)*: manage company profiles, publish and close job listings, review incoming proposals, message candidates directly, and shortlist freelancers by saving their profiles.
- **Search & discovery engine**  *(Arajma, Zbakour)*: combines typo-tolerant PostgreSQL search with filters like hourly rate, budget, and ratings, plus saved recent searches and live application badges on job cards.
- **Real-time chat**  *(Lazmoud)*: uses FastAPI WebSockets and Redis pub/sub for messaging across tabs, online status, and a REST fallback.
- **In-app notifications**  *(Lazmoud)*: sends real-time alerts for messages, proposals, and reviews, with inline actions to accept connections or mark items read.
- **Reputation & Networking**  *(Arajma, Odahriz)*: features 1–5 star client reviews with aggregated ratings, plus a networking hub for connection requests with personalized messages.
- **UI & theming**  *(Odahriz, Zbakour)*: pairs Tailwind CSS with TanStack Router/Query for responsive layouts, optimistic caching, and View Transition dark/light mode crossfades.
- **Health checks, Status page & Disaster recovery** *(Aysadeq)*: monitors database, cache, and disk metrics through `/api/v1/health` with a public `/status` dashboard, paired with an automated PostgreSQL backup daemon and recovery verification drills.
- **Monitoring & Observability** *(Aysadeq)*: collects application request throughput, container resource usage, and database metrics via Prometheus, visualized through pre-configured Grafana dashboards.
- **Cloud Infrastructure & CI/CD** *(Aysadeq)*: deploys to AWS EC2 behind a Traefik reverse proxy with automated Let's Encrypt TLS certificates, managed by GitHub Actions for automated testing and rolling container updates.

---

## 8. Subject Modules

We implemented 15 modules from the subject, totaling 21 points. This covers the 14 mandatory points and the 5 bonus points, with 2 buffer points:

| Category | Module | Description | Owner |
| :--- | :--- | :--- | :---: |
| **Web (Major)** | **Frontend & Backend Frameworks** | React 19 single-page application and FastAPI asynchronous REST API. | `Team` |
| **Web (Major)** | **Real-Time Features** | Full-duplex WebSocket chat with Redis Pub/Sub multi-device synchronization. | `Lazmoud` |
| **Web (Major)** | **User Interactions & Social Features** | user profiles, connection requests, and reviews. | `Arajma, Odahriz` |
| **Web (Minor)** | **Database ORM & Migrations** | SQLModel / SQLAlchemy 2.0 object-relational mapping with Alembic migrations. | `Arajma, Lazmoud` |
| **Web (Minor)** | **Complete Notification System** | In-app notification engine with database constraints for all platform events. | `Lazmoud` |
| **Web (Minor)** | **Custom Design System** | Component library with Tailwind CSS v4, and dark/light mode. | `Zbakour, Odahriz` |
| **Web (Minor)** | **Advanced Search & Filtering** | search with PostgreSQL pg_trgm fuzzy matching, sorting, and pagination. | `Arajma, Zbakour` |
| **Web (Minor)** | **File Upload & Asset Pipeline** | Cloudinary media pipeline for avatars, portfolio images, and PDF resumes. | `Lazmoud, Zbakour` |
| **Accessibility (Minor)** | **Cross-Browser Compatibility** | Verified responsive layout and feature compatibility on Chrome, Firefox, Safari, and Edge. | `Odahriz, Zbakour` |
| **User Management (Major)** | **Standard User Management & Auth** | Argon2/Bcrypt password security, JWT session tokens, and dual-role switching. | `Lazmoud, Zbakour, Arajma` |
| **User Management (Minor)** | **Remote Authentication (OAuth 2.0)** | Social sign-in with Google OAuth 2.0 and LinkedIn OpenID Connect. | `Lazmoud` |
| **DevOps (Major)** | **Observability & Monitoring** | Prometheus metrics scraping, cAdvisor container stats, and Grafana dashboards. | `Aysadeq` |
| **DevOps (Minor)** | **Health Checks, Status Page & DR** | Public /status health probe, automated PostgreSQL backup daemon, and <60s DR drill. | `Aysadeq` |
| **Choice (Major)** | **Production Cloud Deployment & CI/CD** | AWS EC2 cloud infrastructure, Traefik Let's Encrypt TLS, and 3-tier GitHub Actions CI/CD. | `Aysadeq` |
| **Choice (Minor)** | **Automated Backend Testing Suite** | Pytest unit and integration test suite covering auth, models, and API endpoints. | `Arajma, Lazmoud` |

**Total Points Claimed:** 6 Major (12 Pts) + 9 Minor (9 Pts) = **21 Points** (14 mandatory + 5 bonus + 2 buffer)

### Justification for Custom Modules of Choice (IV.10)

As required by the subject, each custom module of choice is justified across the four evaluation criteria:

#### 1. Major Module of Choice (2 Points): Production Cloud Deployment & Automated CI/CD

- **Why we chose this module:** To make Skilio publicly accessible at [https://skilio.works](https://skilio.works) with a fully automated, production-grade cloud delivery pipeline.
- **Technical challenges addressed:**
  - **AWS EC2 Provisioning:** Configured Ubuntu 24.04 with an Elastic IP and a 2GB swapfile buffer to prevent Linux kernel OOM crashes during builds.
  - **Traefik 3.6 Ingress:** Implemented dynamic Docker socket discovery, automated Let's Encrypt TLS 1.3 certificates, and mandatory HTTP 308 redirects.
  - **Zero-Downtime CI/CD:** Built a 3-tier GitHub Actions pipeline (lint, test, smoke check) deploying via SSH `rsync` and rolling container swap in < 2 minutes.
- **Value added:** Enables live evaluator access on the public internet, prevents broken code from reaching production, and eliminates manual deployment errors.
- **Why it deserves Major status (2 Points):** Integrates three distinct production domains: cloud infrastructure (AWS), reverse proxy ingress with automated TLS (Traefik), and automated CI/CD pipelines (GitHub Actions).

#### 2. Minor Module of Choice (1 Point): Automated Backend Testing Suite (Pytest)

- **Why we chose this module:** To protect complex platform workflows (dual-role switching, bidding transitions, and auth security) against regressions.
- **Technical challenges addressed:**
  - **Database Isolation:** Designed transactional rollback fixtures to prevent test data leakage across runs.
  - **External Mocking:** Built mock fixtures for asynchronous Redis Pub/Sub, Cloudinary uploads.
  - **High Coverage Gate:** Authored 173 automated tests achieving 83% backend coverage, enforced by CI (`--fail-under=70`).
- **Value added:** Allows instant local validation (`make test`) and gates the CI/CD pipeline against regressions before deployment.
- **Why it deserves Minor status (1 Point):** Comprehensive integration and unit testing with transactional fixtures and CI gating provides critical reliability while maintaining a focused, minor scope.

---

## 9. Individual Contributions

Each team member took full ownership of specific technical domains and solved real engineering challenges:

- **`aysadeq` (DevOps Lead):**  
  *Contributions:* Built the Docker Compose stack, Traefik reverse proxy, GitHub Actions CI/CD pipeline, automated PostgreSQL backup and restore suite , public `/status` page, and Prometheus/Grafana monitoring.  
  *Challenge Solved:* Frontend builds spiked memory on the AWS EC2 instance, causing Linux Out-Of-Memory crashes. Solved by provisioning an automated 2GB swap partition to handle build spikes safely.

- **`arajma` (Backend Lead):**  
  *Contributions:* Architected FastAPI backend, SQLModel models, and comprehensive input validation, designing the core business logic for Freelancers and Clients.
  *Challenge Solved:* Designing frictionless dual-role user profiles created many bugs, but fixing the architecture either eliminated them or made them easier to solve once found.

- **`lazmoud` (Full Stack Developer):**  
  *Contributions:* Built the bidirectional WebSocket chat server (`/api/v1/chat/ws`), Redis Pub/Sub event dispatcher, and client-side chat UI; also implemented Google & LinkedIn OAuth 2.0 social login and account validation through sending validation links using Resend.
  *Challenge Solved:* A user can send big portions of data through web sockets and that can cause memory issues and unresponsiveness in the server. Solved it by rate limiting the user to send specific message size and also limited the amount of frames a user can send every second.

- **`Odahriz` (Frontend Developer / QA):**  
  *Contributions:* Contributed to product requirements, user flow design including reviews and connections, responsive landing page implementation, and conducted cross-browser QA on Google Chrome to ensure zero console errors.  
  *Challenge Solved:* Solved UI alignment and layout shifts on small mobile viewports by restructuring flex/grid layouts with mobile-first breakpoints.

- **`zbakour` (Frontend Lead / UI-UX Lead):**  
  *Contributions:* Built the React 19 Single-Page Application, implemented Tailwind CSS v4 theming, created the Talent Directory with search, and client job management, and proposals feature.  
  *Challenge Solved:* maintaining a clean and scalable codebase became challenging. Solved by reorganizing the project structure, improving separation of concerns, and establishing consistent naming conventions.

---

## 10. Resources & AI Usage Disclosure

### References Consulted
- **FastAPI Documentation:** [https://fastapi.tiangolo.com/](https://fastapi.tiangolo.com/) (Async lifespan, dependency injection)
- **SQLModel Documentation:** [https://sqlmodel.tiangolo.com/](https://sqlmodel.tiangolo.com/) (SQLAlchemy 2.0 async integration)
- **PostgreSQL 18 Manual:** [https://www.postgresql.org/docs/](https://www.postgresql.org/docs/) (ACID constraints, JSONB indexing)
- **React 19 Documentation:** [https://react.dev/](https://react.dev/) (Hooks, client components)
- **Tailwind Documentation:** [https://tailwindcss.com/docs/](https://tailwindcss.com/docs/)
- **Traefik Proxy 3.6 Guide:** [https://doc.traefik.io/traefik/](https://doc.traefik.io/traefik/) (Docker dynamic ingress, ACME TLS)
- **Prometheus & Grafana:** [https://prometheus.io/docs/](https://prometheus.io/docs/) and [https://grafana.com/docs/](https://grafana.com/docs/)

### AI Usage Disclosure
AI tools were used responsibly as developer aids:
- **Tools Used:** Google Antigravity / Gemini, GitHub Copilot.
- **Where AI was used:** Drafting repetitive boilerplate test fixtures (`tests/`), generating initial Tailwind component structures, exploring syntax examples for Redis async Pub/Sub, and structuring documentation outlines.
- **Where AI was NOT used:** System architecture decisions, business logic rules, dual-role identity modeling, AWS server configuration, and peer evaluation defense preparation.
- **Human Verification:** All generated code was manually inspected, modified, and validated through our automated CI testing gates (Pytest, TypeScript type checking, and Docker smoke tests).

---

## 12. License

This project is licensed under the terms of the **MIT License**. See the [LICENSE](LICENSE) file for complete details.
