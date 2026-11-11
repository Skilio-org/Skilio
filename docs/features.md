# ✨ Features Catalog & Functionality Guide

> 📝 **What to write in this document:**  
> This document details every user-facing and backend capability implemented in the Skilio platform.  
> - **Evaluator Expectation:** Evaluators want to test features systematically. Each feature must have a concise description, steps to reproduce or test it, which team member developed it, and the underlying API / UI components.  
> - **What you need to complete:**  
>   1. Verify the list of features against your actual implementation.  
>   2. Check and adjust the assigned team members for each feature.  
>   3. Ensure you can demonstrate every feature live during the defense without bugs or console errors.

---

## 1. Feature Master Inventory

| Domain | Feature Name | Description | Key Tech / Endpoints | Assigned Member(s) | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **Auth** | **Dual OAuth 2.0 Social Login** | One-click login with Google OAuth 2.0 and LinkedIn OIDC with automated profile initialization. | `GET /login/google`, `GET /login/linkedin` | `<arajma>` | ✅ Done |
| **Auth** | **Password Auth & Recovery** | Argon2/Bcrypt password hashing, email recovery with reset token flow via Mailpit. | `POST /login/access-token`, `POST /password-recovery` | `<arajma>` | ✅ Done |
| **Identity**| **Dynamic Role Switching** | Switch between Client and Freelancer workspace in real-time with automatic profile generation. | `POST /users/me/switch-role`, `useAccountRole` | `<arajma>`, `<omorakwant>`| ✅ Done |
| **Freelancer**| **Profile & Portfolio Showcase** | Multi-section profile with bio, hourly rate, skills, work history, education, and portfolio items. | `/profiles/me`, `POST /profiles/me/portfolio` | `<zbakour>`, `<omorakwant>`| ✅ Done |
| **Freelancer**| **Live Availability Toggle** | Real-time switch indicating whether a freelancer is accepting new contracts immediately. | `PATCH /profiles/me/availability` | `<zbakour>` | ✅ Done |
| **Freelancer**| **Cloud Resume Upload** | Upload and preview PDF resume files securely hosted on Cloudinary with streaming endpoint. | `POST /profiles/resume`, Cloudinary SDK | `<arajma>`, `<zbakour>` | ✅ Done |
| **Client** | **Job Posting & Lifecycle** | Create, edit, and close project posts with fixed or hourly budget, categories, and skill requirements. | `POST /jobs/`, `PUT /jobs/{id}` | `<zbakour>` | ✅ Done |
| **Talent** | **Faceted Talent Search** | Search talent by keywords, filter by category, hourly rate range, availability, and skills. | `GET /profiles/`, `TalentDirectoryPage` | `<zbakour>`, `<omorakwant>`| ✅ Done |
| **Jobs** | **Job Discovery & Bookmarking**| Search open projects, filter by budget/skill, and save favorite jobs for later review. | `GET /jobs/`, `POST /jobs/{id}/save` | `<zbakour>`, `<omorakwant>`| ✅ Done |
| **Proposals**| **Proposals & Bidding Engine** | Freelancers submit bids with cover letters; clients accept or reject proposals. | `POST /proposals/`, `PUT /proposals/{id}/status` | `<lazmoud>` | ✅ Done |
| **Chat** | **Real-Time WebSocket Messaging**| Bidirectional chat with instant message delivery, typing indicators, and read receipts. | `WS /chat/ws`, Redis Pub/Sub channels | `<lazmoud>` | ✅ Done |
| **Feedback**| **Client Ratings & Reviews** | Verified clients submit 1-5 star ratings and reviews that calculate public freelancer reputation. | `POST /reviews/`, `GET /reviews/freelancer/{id}` | `<zbakour>` | ✅ Done |
| **UI/UX** | **Responsive Design & Theming** | Full light/dark mode support, mobile-friendly navigation, accessible Radix UI primitives. | Tailwind CSS v4, shadcn/ui, Biome | `<omorakwant>` | ✅ Done |
| **DevOps** | **Automated Zero-Downtime CI/CD**| 3-tier GitHub Actions testing gate and rolling container swap to AWS EC2 over SSH `rsync`. | `.github/workflows/ci-cd.yml`, `rsync` | `<aysadeq>` | ✅ Done |
| **DevOps** | **Automated DB Backup Daemon** | Continuous `.sql.gz` dump daemon with 7-day retention and isolated sub-60s disaster recovery drill. | `devops/backup/`, `make dr-test` | `<aysadeq>` | ✅ Done |
| **DevOps** | **Observability Suite** | Live metrics scraping with Prometheus and system dashboards rendered in Grafana. | `devops/monitoring/`, Grafana UI | `<aysadeq>` | ✅ Done |
| **DevOps** | **Public System Status Dashboard**| Real-time `/status` page probing database roundtrip latency, Redis health, and disk storage. | `/api/v1/health`, `StatusPage.tsx` | `<aysadeq>` | ✅ Done |

---

## 2. Deep-Dive Feature Descriptions & User Journeys

### 2.1 Unified Dual-Role System
- **How it works:** Rather than requiring separate logins, every account possesses both roles. Users can toggle freely from the header avatar menu:
  - Switching to **Client** switches navigation to project postings, talent search, and incoming applicant proposals.
  - Switching to **Freelancer** switches navigation to available jobs, proposal status, portfolio editor, and earnings overview.
- **Route Guard Protection:** If a freelancer attempts to navigate directly to `/client-jobs`, `AppLayout` intercepts and redirects them to the appropriate freelancer workspace.

### 2.2 Real-Time Chat & Distributed Event Bus
- **How it works:**
  - Upon establishing a connection at `WS /api/v1/chat/ws?token=<JWT>`, the backend registers the client socket in `ConnectionManager`.
  - When User A sends a message to User B:
    1. Message is stored immediately in PostgreSQL with an auto-generated timestamp.
    2. Backend sends a `message_ack` frame back to User A for optimistic UI completion.
    3. Event is published to the Redis channel `user:<target_id>:events`.
    4. Any backend worker instance holding an open socket for User B receives the event and pushes it to User B's active tabs.
  - Features real-time typing indicators (`{"type": "typing"}`) with automatic 3-second debounce timers.

### 2.3 Cloudinary Media & Document Streaming
- **How it works:**
  - User avatars, portfolio screenshots, and PDF resumes are uploaded directly through `/api/v1/media/upload`.
  - Files are streamed to Cloudinary's encrypted CDN.
  - Cloudinary public IDs and URLs are securely attached to the user's database records.
  - Resumes are validated for MIME type (`application/pdf`) and size limit (max 10MB) before storage.

### 2.4 Disaster Recovery & System Health Monitoring
- **How it works:**
  - The `/status` route exposes an interactive real-time dashboard displaying system health.
  - Evaluators can test database disaster recovery live in terminal using `make dr-test`. This command spins up an ephemeral database container, restores the latest compressed backup archive, tests schema and row counts, and verifies full recovery in under 5 seconds.
