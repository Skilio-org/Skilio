# ⚠️ Known Limitations & Future Roadmap

> 📝 **What to write in this document:**  
> This document details known architectural constraints, boundary conditions, edge cases, and planned future enhancements of the Skilio platform.  
> - **Evaluator Expectation:** Evaluators respect teams that demonstrate deep technical self-awareness. Admitting known limitations, explaining *why* they exist, and demonstrating how you mitigate them scores much higher than pretending a complex project has zero flaws.  
> - **What you need to complete:**  
>   1. Review the listed limitations and confirm which ones apply to your current build.  
>   2. Add any known quirks or browser-specific considerations you discovered during testing.  
>   3. Detail planned future improvements.

---

## 1. Known Architectural Limitations

### 1.1 In-Memory Real-Time Fallback vs Distributed Clustered Redis
- **Current State:** The WebSocket chat server uses Redis Pub/Sub when available, and automatically falls back to an in-memory `ConnectionManager` if Redis is offline (e.g. during standalone local development).
- **Limitation:** In the in-memory fallback mode, active WebSocket connections cannot communicate across separate physical backend replicas.
- **Mitigation:** In production, Redis is deployed as a managed service within the Docker Compose network, ensuring distributed message delivery across all replicas.

### 1.2 Local SMTP Emulation with Mailpit
- **Current State:** Transactional emails (password recovery, welcome notifications) are delivered to a local Mailpit sandbox at `http://localhost:8025`.
- **Limitation:** Emails do not reach real public inboxes unless a production SMTP provider (SendGrid, AWS SES, or Resend) is configured in `.env`.
- **Mitigation:** Mailpit provides an interactive web UI allowing evaluators to immediately inspect outgoing email HTML, headers, and reset token links without risking spam flags or external email delivery delays.

### 1.3 Cloudinary Media Upload Free Tier Limits
- **Current State:** Uploaded avatars, portfolio screenshots, and PDF resumes are stored on Cloudinary via free-tier API credentials.
- **Limitation:** High-volume image uploads exceeding monthly bandwidth quotas may result in HTTP 429 rate limits.
- **Mitigation:** Strict client-side and server-side file size restrictions are enforced (max 5MB for images, max 10MB for PDF resumes), and the frontend caches asset URLs to avoid duplicate uploads.

### 1.4 Single-Node AWS EC2 Database Architecture
- **Current State:** The production database runs as a single containerized PostgreSQL instance on our AWS EC2 server with persistent Docker volume storage.
- **Limitation:** While high availability is maintained via automated backups and sub-60s disaster recovery drills, there is no active-active multi-region replication.
- **Mitigation:** The automated backup daemon dumps compressed snapshots (`.sql.gz`) hourly and daily, enabling fast point-in-time recovery to a fresh node in under a minute (`make dr-test`).

---

## 2. Edge Cases & Boundary Handling

| Edge Case / Scenario | System Behavior & Protection |
| :--- | :--- |
| **User opens chat in multiple browser tabs** | `ConnectionManager` stores a set of active WebSockets per `user_id`. Incoming events broadcast simultaneously to all active tabs. |
| **Client attempts to double-review a freelancer** | Enforced by SQL composite unique constraint `UNIQUE (client_id, freelancer_id)`. Returns HTTP 409 Conflict with user-friendly error toast. |
| **Freelancer submits multiple proposals for one job** | Enforced by SQL composite unique constraint `UNIQUE (job_post_id, freelancer_id)`. Subsequent submission attempts are rejected. |
| **Network disconnect during WebSocket session** | Client implements exponential backoff reconnection. Backend automatically cleans up dead sockets from the pool. |
| **Non-PDF file uploaded as resume** | Backend validates magic bytes and MIME type (`application/pdf`), returning HTTP 400 Bad Request if invalid. |

---

## 3. Future Roadmap & Planned Enhancements

- [ ] **Escrow Payment Integration:** Integrate Stripe Connect to support secure milestone-based escrow payments and automatic payouts upon contract completion.
- [ ] **End-to-End Encrypted Chat:** Implement Signal Protocol or client-side asymmetric encryption for sensitive contract negotiations.
- [ ] **Video & Audio Calling:** Embed WebRTC peer-to-peer audio and video calling directly into chat threads for client interviews.
- [ ] **Multi-Region Read Replicas:** Configure PostgreSQL streaming replication to read replicas across multiple geographic AWS regions for lower latency.
- [ ] **AI-Powered Job & Talent Matching:** Embed vector embeddings (e.g. pgvector) to match client job requirements with freelancer skills semantically.
