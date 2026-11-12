# 📚 Resources & AI Usage Disclosure

> 📝 **What to write in this document:**  
> This document provides the complete bibliography of technical resources, official documentation, articles, and tutorials referenced during development, as well as an honest and comprehensive disclosure of how Artificial Intelligence (AI) tools were utilized.  
> - **Evaluator Expectation:** 42 evaluation guidelines strictly require full transparency regarding AI usage:
>   1. You must explicitly declare which AI tools were used (ChatGPT, Claude, GitHub Copilot, Gemini, Antigravity, etc.).
>   2. You must specify which exact tasks, components, and code areas utilized AI assistance.
>   3. You must explain your verification and validation process (how you tested and proved that AI code was correct, secure, and bug-free).
>   4. You must articulate which architectural decisions and core concepts were created entirely by team members without AI.
> - **What you need to complete:**  
>   1. Review the bibliography and add any specific tutorials or documentation links your team consulted.  
>   2. Review the AI disclosure table and customize the percentages and specific tasks to accurately reflect your team's development journey.

---

## 1. Classic References & Technical Documentation

### 1.1 Backend, ORM & Database References
- **FastAPI Official Documentation:** [https://fastapi.tiangolo.com/](https://fastapi.tiangolo.com/) — Reference for async routes, dependency injection, and lifespan events.
- **SQLModel Documentation:** [https://sqlmodel.tiangolo.com/](https://sqlmodel.tiangolo.com/) — Unified SQLAlchemy 2.0 and Pydantic v2 data modeling patterns.
- **PostgreSQL 18 Manual:** [https://www.postgresql.org/docs/](https://www.postgresql.org/docs/) — ACID transactions, JSONB indexing, and foreign key cascade rules.
- **Redis Documentation:** [https://redis.io/docs/](https://redis.io/docs/) — Pub/Sub architectural patterns and channel dispatching.
- **Alembic Documentation:** [https://alembic.sqlalchemy.org/](https://alembic.sqlalchemy.org/) — Database schema revision autogeneration and environment hooks.
- **RFC 7519 (JSON Web Tokens):** [https://datatracker.ietf.org/doc/html/rfc7519](https://datatracker.ietf.org/doc/html/rfc7519) — Standard specification for stateless JWT claims and signatures.
- **RFC 6455 (The WebSocket Protocol):** [https://datatracker.ietf.org/doc/html/rfc6455](https://datatracker.ietf.org/doc/html/rfc6455) — Framing, handshake lifecycle, and connection maintenance.

### 1.2 Frontend & UI References
- **React 19 Official Documentation:** [https://react.dev/](https://react.dev/) — Hooks, React Actions, and compiler architecture.
- **Vite Guide:** [https://vitejs.dev/guide/](https://vitejs.dev/guide/) — Build optimization and SWC integration.
- **Tailwind CSS v4 Documentation:** [https://tailwindcss.com/docs](https://tailwindcss.com/docs) — Modern CSS utility engine and theming variables.
- **TanStack Router Documentation:** [https://tanstack.com/router/latest](https://tanstack.com/router/latest) — Type-safe client-side routing, route guards, and code splitting.
- **TanStack Query v5 Documentation:** [https://tanstack.com/query/latest](https://tanstack.com/query/latest) — Server-state management and optimistic mutation handling.
- **Radix UI Primitives:** [https://www.radix-ui.com/primitives](https://www.radix-ui.com/primitives) — Accessible, headless UI component architecture.
- **Hey-API / OpenAPI-TS:** [https://heyapi.vercel.app/](https://heyapi.vercel.app/) — Automated TypeScript SDK generation from backend OpenAPI schemas.

### 1.3 DevOps & Infrastructure References
- **Traefik Proxy 3.6 Documentation:** [https://doc.traefik.io/traefik/](https://doc.traefik.io/traefik/) — Docker provider configuration and Let's Encrypt ACME challenges.
- **Docker Compose Specification:** [https://docs.docker.com/compose/](https://docs.docker.com/compose/) — Multi-file inheritance (`compose.override.yml`, `compose.deploy.yml`).
- **Prometheus Monitoring Guide:** [https://prometheus.io/docs/introduction/overview/](https://prometheus.io/docs/introduction/overview/) — Metric scrape endpoints, histograms, and counters.
- **Grafana Documentation:** [https://grafana.com/docs/](https://grafana.com/docs/) — Dashboard provisioning and dynamic datasource configuration.
- **AWS EC2 Documentation:** [https://docs.aws.amazon.com/ec2/](https://docs.aws.amazon.com/ec2/) — Elastic IP allocation, security groups, and swap space provisioning.

---

## 2. Comprehensive AI Usage Disclosure

> 📝 **Academic Honesty Statement:**  
> The team maintained strict ownership and deep architectural understanding of all code submitted for evaluation. AI tools were leveraged as developer acceleration assistants (similar to enhanced linters, boilerplate generators, and documentation aids), but all logic was manually reviewed, integrated, tested, and understood by the team.

### 2.1 AI Tools Utilized
The team utilized the following AI tools during development:
- **Claude 3.5 Sonnet / Claude Code (Anthropic):** Used for code refactoring, unit test generation, and architectural design reviews.
- **Antigravity / Gemini (Google DeepMind):** Used for project structuring, comprehensive documentation generation, and debugging assistance.
- **GitHub Copilot:** Used during local development for contextual line-by-line autocomplete and repetitive syntax generation.
- **ChatGPT (OpenAI):** Consulted for understanding complex RFC specifications and configuring Linux swap optimization commands.

---

### 2.2 Task Breakdown: Where AI Was & Was Not Used

| Project Domain / Task | AI Assistance Level | Description of How AI Was Used | Human Verification Process |
| :--- | :---: | :--- | :--- |
| **Project Ideation & Feature Scope** | **0% (None)** | Conceptualized completely by the team to create an authentic freelance marketplace matching 42 requirements. | Team brainstorming and evaluation rubric review. |
| **Relational Database Design** | **15% (Low)** | Used AI to generate preliminary SQLModel boilerplate; adjusted foreign keys, cascades, and constraints manually. | Hand-crafted models in `models.py`, validated with Alembic migrations and ERD review. |
| **Core Authentication & Role Switch** | **20% (Low)** | Used AI to reference standard PyJWT and OAuth 2.0 PKCE syntax; core role switching logic authored by team. | End-to-end security review, verified against token replay and unauthenticated route leaks. |
| **Real-Time WebSocket & Redis Engine**| **25% (Moderate)**| Used AI to inspect Redis async Pub/Sub syntax examples and exception handling patterns. | Tested live concurrency across multiple browser tabs; validated fallback to in-memory dispatch. |
| **Frontend UI Component Boilerplate**| **40% (Moderate)**| Generated initial Tailwind component wrappers and repetitive form input fields. | Tailored styling to brand design, integrated with TanStack Query and verified responsive layouts. |
| **Unit & Integration Test Suites** | **50% (High)** | Prompted AI to generate edge-case pytest fixtures and input validation tests based on API schemas. | Executed full test suites (`make test`), verified assertion logic, and ensured >80% code coverage. |
| **Cloud DevOps & Shell Scripts** | **30% (Moderate)**| Generated initial syntax for `server-init.sh` and Prometheus YAML configurations. | Executed live drills on AWS EC2, verified firewall rules, and tested sandbox disaster recovery (`make dr-test`). |
| **Documentation & README Structure** | **60% (High)** | Used AI to organize, structure, and format multi-page markdown documentation from project codebase. | Cross-checked every document against official 42 evaluation requirements and actual code behavior. |

---

### 2.3 Verification & Quality Assurance Strategy for AI Code

To ensure that AI-assisted code met production standards and 42 curriculum compliance:
1. **Mandatory Code Understanding:** Every team member had to understand every line of code committed under their branch. Blindly copying and pasting without full comprehension was prohibited.
2. **Automated CI Quality Gate:** All code had to pass 100% of automated unit tests (Pytest), TypeScript compiler type checks, and linting rules (Ruff & Biome) before merging.
3. **Sandbox Testing:** Any DevOps script or container configuration generated with AI assistance was first executed in an isolated local environment or sandbox test before applying to production.
4. **Peer Code Review:** Pull requests required review to verify that error handling was comprehensive and did not hide silent exceptions.
