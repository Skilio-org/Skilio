# DevOps Presentation Slides (Act V) — Drag & Drop + Speaker Guide

> **Location:** `docs/devops/slides/`  
> **Files:** `slide-01.png` through `slide-10.png` (1920×1080), `deck.html` (Chrome fullscreen backup), `skilio-devops-slides.pdf`

---

## 1. How to Add These to Figma in 2 Minutes

1. Open your team's Figma Slides file in Chrome (`Grid View`).
2. Scroll below Zakaria's **Frontend** row and create a new row/group for **DevOps**.
3. Click **`+`** to add **10 blank slides** (or duplicate any empty slide 10 times).
4. Open `docs/devops/slides/` in your file manager and **drag `slide-01.png` onto Slide 1**, `slide-02.png` onto Slide 2, ... up to `slide-10.png`.
5. Resize each image to fill the `1920×1080` slide canvas (it snaps right to the edges!).
6. *(Optional)* Copy-paste the Speaker Notes below into Figma's **Speaker Notes** bar at the bottom of each slide.

*(Fallback: You can also open `deck.html` in Chrome and press `F11` + Left/Right arrows!)*

---

## 2. What to Say on Each Slide (Simple & Short)

* **Slide 1 — DevOps & Reliability (~15s):**  
  *"Hi everyone, I'm Ayman, Project Manager and DevOps Lead. My job was taking the team's code from local laptops and turning it into a reliable, live product on the internet."*
* **Slide 2 — The Big Picture (~25s):**  
  *"Here is the high-level picture: users visit `skilio.works`, pass through our AWS firewall into our containerized app and database, while monitoring and daily backups watch everything. Everything serves three goals: run reliably, ship safely, and never lose data."*
* **Slide 3 — Docker & Multi-File Compose (~35s):**  
  *"Everything runs in Docker from one shared `compose.yml`. Locally, `make up` enables live reload and debug ports; on AWS, `compose.deploy.yml` runs production settings and locks database ports. Our multi-stage Dockerfile builds the React app with Bun, throws away all build tools, and keeps only the lean Python runtime."*
* **Slide 4 — AWS Cloud & Stability (~35s):**  
  *"We chose AWS EC2 (IaaS) so we manage the OS, firewall, and networking ourselves. Database and Redis ports are locked inside the private network. When building the React frontend on our 2GB server, RAM spiked and crashed — adding a 2GB swap buffer fixed it with zero crashes."*
* **Slide 5 — Zero-Touch CI/CD Pipeline (~40s):**  
  *"Every Pull Request passes linting, TypeScript checks, and 173 Pytest tests hitting 83% coverage before merging. Once merged to `master`, GitHub Actions syncs files over SSH `rsync` — with zero GitHub tokens stored on AWS — tests DB migrations first, and swaps the live container in under 2 minutes with zero downtime."*
* **Slide 6 — Health Check & Public Status (~30s):**  
  *"Instead of a fake health ping, `/api/v1/health` actively runs `SELECT 1` on Postgres, pings Redis, and checks disk space. Our public `/status` page refreshes every 10 seconds so users and evaluators see honest live health."*
* **Slide 7 — Backups & Disaster Recovery (~35s):**  
  *"An untested backup is not a backup. A dedicated container runs compressed daily backups at 02:00 UTC with 7-day retention. Running `make dr-test` creates an isolated sandbox database, restores the latest snapshot, checks every table, and cleans up in under 5 seconds — well under the 60-second target."*
* **Slide 8 — Observability: Prometheus (~30s):**  
  *"Prometheus uses a pull model to scrape metrics every 10–15 seconds from three layers: FastAPI traffic and p99 latency, Postgres connections, and cAdvisor container CPU/RAM — so traffic spikes never overload monitoring."*
* **Slide 9 — Observability: Grafana & Alerts (~30s):**  
  *"All three Grafana dashboards are version-controlled in Git and locked behind login. We also configured four smart alerts — like `BackendDown` and `ContainerHighMemory` — that wait 1–2 minutes before firing so normal restarts don't trigger false alarms."*
* **Slide 10 — Problems Solved & Live Demo (~20s):**  
  *"To wrap up, DevOps solved three real problems: 2GB build crashes, keeping GitHub secrets off the server, and proving backups actually work. Now let's jump into the live demo!"*

---

## 3. Quick Q&A Cheat Sheet (If Staff Ask)

* **"How do you handle HTTPS if it's not on a slide?"**  
  *"Traefik sits in front of our containers, automatically redirects HTTP to HTTPS, and renews free Let's Encrypt certificates."*
* **"Which 42 DevOps modules are you claiming?"**  
  *"5 points total + Mandatory Section III: IV.10 Cloud & CI/CD (2 pts), IV.7 Prometheus & Grafana (2 pts), and IV.7 Health, Status & DR (1 pt)."*
* **"What happens if a DB migration fails during deploy?"**  
  *"The prestart worker runs migrations before swapping containers. If migration fails, deployment stops immediately and the old live site keeps running."*
