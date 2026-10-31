# 🚀 Stage 4: Zero-Touch CI/CD Pipeline & Automated Delivery
### Comprehensive Presentation & Technical Reference Guide

---

## 1. Architectural Overview & The Zero-Touch Delivery Pipeline

In amateur deployments, developers log into production servers over SSH, run manual `git pull` commands, edit `.env` files directly on the host, and restart containers by hand. This error-prone pattern creates "snowflake servers," undetected syntax bugs in production, and server downtime.

Our architecture implements a **Zero-Touch Continuous Integration & Continuous Deployment (CI/CD) Pipeline** using GitHub Actions and SSH automation. The moment code merges into `master`, it passes through a 3-tier testing gate, syncs securely over encrypted SSH, executes an ephemeral pre-flight database migration, and performs a zero-downtime rolling container swap on AWS in under 2 minutes.

```text
 [ DEVELOPER WORKSTATION ]
           │
           │ git push (Pull Request or merge to master)
           ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │                   GITHUB ACTIONS CI GATE (Ephemeral Runners)           │
 │                                                                        │
 │   ┌───────────────────────┐         ┌───────────────────────┐          │
 │   │ Tier 1: Linting       │         │ Tier 2: Integration   │          │
 │   │ • Python Ruff Syntax  │         │ • 173 Pytest Tests    │          │
 │   │ • TypeScript Compiler │         │ • PostgreSQL & Mailpit│          │
 │   │   (bun run build)     │         │ • 70% Coverage Gate   │          │
 │   └───────────┬───────────┘         └───────────┬───────────┘          │
 │               │                                 │                      │
 │               └────────────────┬────────────────┘                      │
 │                                │                                       │
 │                                ▼                                       │
 │                     ┌───────────────────────┐                          │
 │                     │ Tier 3: Smoke Build   │                          │
 │                     │ • Docker Stack Build  │                          │
 │                     │ • Prestart Migrations │                          │
 │                     │ • /health Probe Curl  │                          │
 │                     └──────────┬────────────┘                          │
 └────────────────────────────────┼───────────────────────────────────────┘
                                  │
                                  │ ALL 4 QUALITY GATES PASS (needs: [...])
                                  │ AND Branch is 'master' (push)
                                  ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │                 SECURE TRANSPORT & ZERO-DOWNTIME SWAP                  │
 │                                                                        │
 │  1. Ephemeral Runner loads `SERVER_SSH_KEY` (chmod 600)                │
 │  2. rsync transfers codebase (Excludes .env*, .git*, node_modules)     │
 │  3. Remote execution via SSH: `bash /opt/skilio/devops/scripts/deploy.sh`
 └────────────────────────────────┬───────────────────────────────────────┘
                                  │
                                  ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │                      AWS EC2 PRODUCTION SERVER                         │
 │                                                                        │
 │  Step 1: Background Build ──▶ `docker compose build backend`           │
 │                               (Old container keeps serving live users) │
 │  Step 2: Migration Gate   ──▶ `docker compose run -T --rm ...`         │
 │                               (If DB migration fails, halts deploy)    │
 │  Step 3: Atomic Swap      ──▶ `docker compose up -d --force-recreate`  │
 │                               (Swaps container in < 1 second)          │
 │  Step 4: Storage Prune    ──▶ `docker image prune -f`                  │
 │                               (Removes dangling layers on 29 GB SSD)   │
 │  Step 5: Health Polling   ──▶ Probes https://skilio.works/api/v1/health│
 └────────────────────────────────────────────────────────────────────────┘
```

---

### Mandatory 42 Subject Alignment (Section IV.10 Major — 2 Points)

Under Section `IV.10 Modules of choice`, the 42 subject mandates:
> **"Major: Implement a custom module that is not listed above. The module must be substantial and demonstrate technical complexity."**

| Evaluation Criteria | How Our Pipeline Fulfills It |
| :--- | :--- |
| **Why did we choose this module?** | A modern web application cannot rely on manual server restarts. Automating code testing and deployment eliminates "it works on my machine" bugs and delivers features to evaluators within 2 minutes of merging a PR. |
| **What technical challenges does it address?** | • **Automated Quality Gates:** Enforcing Python linting, TypeScript build verification, and 173 backend pytest tests (83% coverage) before code reaches `master`.<br>• **Asymmetric Least-Privilege Security:** Deploying over SSH without storing any GitHub Personal Access Tokens on AWS.<br>• **Zero-Downtime Delivery:** Pre-building container images in the background and executing database migrations in ephemeral containers before swapping the live container. |
| **Why does it deserve Major (2 Points) status?** | It is not a trivial single-command VPS script. It coordinates 4 distinct disciplines: Continuous Integration (CI), Infrastructure Security, Database Schema Migration Gates, and Zero-Downtime Container Swaps. |

---

## 2. GitHub Actions Deep Dive: Architecture, Runner Lifecycle & Syntax Reference

### What is GitHub Actions?
**GitHub Actions** is an event-driven automation platform built directly into GitHub. It allows developers to define automated workflows triggered by repository events—such as opening a Pull Request, pushing code to `master`, or creating a release tag.

Instead of running an external, self-hosted automation server (like Jenkins) that requires manual maintenance, security patching, and server hosting, GitHub Actions provides cloud-native execution environments that manage the entire build, test, and deployment cycle.

---

### The 4-Level Architectural Hierarchy

GitHub Actions organizes automation into a strict 4-level structural hierarchy:

```text
 ┌────────────────────────────────────────────────────────────────────────┐
 │ 1. WORKFLOW (.github/workflows/ci-cd.yml)                              │
 │    The top-level configurable automated process defined in YAML.       │
 │    Triggered by repository events (push, pull_request).                │
 ├────────────────────────────────────────────────────────────────────────┤
 │   │                                                                    │
 │   ├─▶ 2. JOBS (lint-backend, test-backend, deploy, ...)                │
 │   │      Independent execution units running on separate virtual VMs.  │
 │   │      ⚡ Run in PARALLEL by default (unless chained via `needs:`).   │
 │   │                                                                    │
 │   │   ┌────────────────────────────────────────────────────────────┐   │
 │   │   │ 3. STEPS (Executed sequentially inside a single Job VM)    │   │
 │   │   │    Linear sequence of tasks sharing the same filesystem.   │   │
 │   │   ├────────────────────────────────────────────────────────────┤   │
 │   │   │   │                                                        │   │
 │   │   │   ├─▶ 4a. ACTIONS (`uses: actions/checkout@v4`)            │   │
 │   │   │   │       Reusable pre-packaged modules from Marketplace.  │   │
 │   │   │   │                                                        │   │
 │   │   │   └─▶ 4b. SHELL COMMANDS (`run: uv run pytest`)            │   │
 │   │   │           Direct bash commands executed on the VM shell.   │   │
 │   │   └────────────────────────────────────────────────────────────┘   │
 └────────────────────────────────────────────────────────────────────────┘
```

1. **Workflow (`.github/workflows/*.yml`):**
   * The overarching automation blueprint stored in the repository.
   * Can contain multiple jobs triggered by defined Git events.
2. **Job (`jobs.<job_id>`):**
   * A discrete unit of work executed on a specific runner instance (e.g., `runs-on: ubuntu-latest`).
   * **Crucial Rule:** Jobs execute **in parallel** by default to minimize wait times. To run them sequentially, jobs must explicitly declare dependencies using the `needs:` keyword.
3. **Step (`steps:`):**
   * An ordered list of tasks executed **sequentially** on the same runner VM.
   * If step 1 creates a file, step 2 can immediately read or modify that file because they share the same physical VM disk.
4. **Action / Command (`uses:` vs. `run:`):**
   * **Action (`uses:`):** A reusable, pre-built component developed by GitHub or the open-source community (e.g., checking out code, installing Python, configuring SSH).
   * **Command (`run:`):** Direct shell scripts executed in the runner's default shell (e.g., `bash`).

---

### How GitHub Actions Executes Behind the Scenes (The Ephemeral Runner Lifecycle)

When a developer runs `git push origin master`, what happens behind the scenes?

```text
 1. EVENT TRIGGER        2. ORCHESTRATOR           3. EPHEMERAL VM BOOT
 [ git push master ] ──▶ [ GitHub Workflow ] ──▶ [ Provision Ubuntu VM ]
                         [   Scheduler     ]     (Pristine 2-core / 7GB RAM)
                                                            │
 ┌──────────────────────────────────────────────────────────┘
 ▼
 4. STEP EXECUTION       5. STREAM TELEMETRY       6. ZERO-TRACE DESTRUCTION
 [ Checkout Code   ] ──▶ [ Real-Time Logs  ] ──▶ [ VM completely scrubbed ]
 [ Install Deps    ]     [ HTML Artifacts  ]     [ and destroyed from cloud]
 [ Run Tests/Deploy]     [ Status Checks   ]     (Zero state leakage)
```

1. **Webhook Event:** GitHub detects the Git `push` or `pull_request` event.
2. **Orchestrator Queue:** GitHub's workflow scheduler parses [`.github/workflows/ci-cd.yml`](file:///home/aysadeq/Desktop/Freelancer/.github/workflows/ci-cd.yml), evaluates event filters (`branches`, `paths-ignore`), and queues the jobs.
3. **Ephemeral Cloud VM Provisioning:** For each job, GitHub spins up a fresh, isolated virtual machine (e.g., Azure VM running Ubuntu Linux).
4. **Environment Isolation & Secrets:** The VM injects encrypted secrets into process memory (never writing them as plaintext to disk) and pulls down the code.
5. **Execution & Log Streaming:** Steps execute in order while ANSI logs stream in real-time to the developer's browser.
6. **Teardown & Zero Trace:** Once the job finishes (or fails), the virtual machine is **immediately destroyed**. No files, credentials, or residual build artifacts persist to the next run, guaranteeing zero state contamination.

---

### YAML Syntax & Keyword Anatomy (The Skilio Engine Cheat Sheet)

Every directive in [`.github/workflows/ci-cd.yml`](file:///home/aysadeq/Desktop/Freelancer/.github/workflows/ci-cd.yml) serves an intentional purpose:

| Keyword | Purpose & Architectural Usage | Example from [`ci-cd.yml`](file:///home/aysadeq/Desktop/Freelancer/.github/workflows/ci-cd.yml) |
| :--- | :--- | :--- |
| **`name`** | The human-readable label displayed in the GitHub UI and Pull Request status checks. | `name: CI/CD Pipeline` |
| **`on`** | Defines repository events that trigger workflow execution. Supports branch filters and path exclusions. | `on: push: branches: [master]` |
| **`concurrency`** | Controls simultaneous workflow runs. Prevents redundant queue backlog and race conditions. | `group: ${{ github.workflow }}-${{ github.ref }}`<br>`cancel-in-progress: ${{ github.ref != 'refs/heads/master' }}` |
| **`jobs`** | Container mapping defining all execution units in the pipeline. | `jobs:`<br>&nbsp;&nbsp;`lint-backend:`<br>&nbsp;&nbsp;`deploy:` |
| **`runs-on`** | Defines the operating system image for the runner VM. | `runs-on: ubuntu-latest` |
| **`needs`** | Defines job dependencies, turning parallel jobs into a sequential **Directed Acyclic Graph (DAG)**. | `needs: [lint-backend, lint-frontend, test-backend, test-docker-compose]` |
| **`if`** | Conditional expression evaluated before executing a job or step. | `if: github.ref == 'refs/heads/master' && github.event_name == 'push'` |
| **`steps`** | Sequential array of tasks executed inside the job's runner VM. | `steps:`<br>&nbsp;&nbsp;`- uses: actions/checkout@v4` |
| **`uses`** | Invokes a reusable action from GitHub Marketplace or another repository. | `uses: actions/checkout@v4`<br>`uses: oven-sh/setup-bun@v2` |
| **`with`** | Key-value map of input arguments passed directly to an action. | `with:`<br>&nbsp;&nbsp;`bun-version: 1.3.12` |
| **`run`** | Executes raw multi-line or single-line shell commands via bash. | `run: \|`<br>&nbsp;&nbsp;`uv run ruff check` |
| **`working-directory`**| Overrides the default working directory root for a step. | `working-directory: frontend` |
| **`env`** | Sets environment variables accessible by processes inside the runner. | `env:`<br>&nbsp;&nbsp;`PYTHON_VERSION: 3.14` |

---

### Contexts & Secrets (`${{ ... }}` Syntax)

GitHub Actions evaluates dynamic expressions wrapped in `${{ <expression> }}`:

1. **GitHub Context (`${{ github.* }}`):**
   * Accesses metadata about the triggering event and repository.
   * `${{ github.sha }}`: The exact 40-character Git commit hash.
   * `${{ github.ref }}`: The Git reference being built (e.g., `refs/heads/master` or `refs/pull/42/merge`).
   * `${{ github.event_name }}`: The name of the event (`push`, `pull_request`).
2. **Encrypted Secrets (`${{ secrets.* }}`):**
   * Production credentials (SSH private keys, server IP, API keys) stored encrypted in repository settings (`Settings -> Secrets and variables -> Actions`).
   * `${{ secrets.SERVER_SSH_KEY }}`: Ephemeral private key for AWS EC2 access.
   * `${{ secrets.SERVER_HOST }}`: AWS Elastic IP (`16.192.59.166`).
   * **Automatic Masking:** GitHub Actions automatically redacts known secret values from all console output, replacing them with `***` to prevent accidental credential leaks.

---

## 3. CI Fundamentals: The Testing Pyramid & Cloud Runner Architecture

### The Problem CI Solves: "Integration Hell"
Before Continuous Integration was formalized, software teams suffered from merge collisions:
* Developers worked on isolated feature branches for weeks.
* On "Merge Day," dozens of conflicting database models, broken imports, and syntax errors collided simultaneously.
* **The CI Rule:** Developers integrate small changes frequently into `master`. Every push is automatically built, linted, and tested by an automated runner. If a test fails, the build is marked red, and deployment is blocked.

---

### The Testing Pyramid in Our Pipeline

```text
                 ▲
                / \
               / E2E \          Tier 3: Docker Build & Smoke Test
              / Smoke \         (Builds Docker image, boots stack, curls /health)
             /─────────\
            /           \
           / Integration \      Tier 2: Backend Pytest Suite
          /     Tests     \     (173 tests against live Postgres & Mailpit)
         /─────────────────\
        /                   \
       /     Unit Tests      \  Tier 1: Static Analysis & Compilation
      /    & Static Linting   \ (Ruff Python Syntax & Bun TypeScript Build)
     └─────────────────────────┘
```

---

### Cloud SaaS Runners vs. Self-Hosted Runners

| Architectural Property | GitHub-Hosted Cloud Runners (Our Choice) | Self-Hosted Runners (e.g. Jenkins) |
| :--- | :--- | :--- |
| **Runner Lifecycle** | **Ephemeral:** Spun up fresh per job, destroyed immediately upon completion. | **Persistent:** Runs continuously on an existing virtual machine. |
| **State Contamination** | **Zero:** Every job runs on a pristine, isolated Ubuntu virtual machine. | **High:** Leftover files, stale packages, and caches can contaminate future builds. |
| **Host Resource Impact**| **Zero overhead on AWS:** Heavy test suites run on GitHub's compute, saving EC2 RAM/CPU. | Consumes CPU and memory on your own cloud servers. |
| **Credential Security** | Secrets injected into memory only; deleted when the VM terminates. | Private keys remain stored on the persistent runner disk. |

---

### The 4 Types of Workflows in DevOps

1. **CI Workflows (Quality Gate):** Validates pull requests (Lints, runs unit and integration tests).
2. **CD Workflows (Delivery):** Ships validated code to cloud servers (SSH, rsync, rolling container swap).
3. **Scheduled Workflows (Cron Maintenance):** Time-based triggers (e.g., automated nightly backups or security scans).
4. **Operations / Housekeeping Workflows:** Repository automations (auto-closing stale issues, PR labeling).

> **Architectural Decision:** In [`ci-cd.yml`](file:///home/aysadeq/Desktop/Freelancer/.github/workflows/ci-cd.yml), we combined **Type 1 (CI Gate)** and **Type 2 (CD Delivery)** into a single unified pipeline driven by a Directed Acyclic Graph (`needs:`).

---

## 4. The 3-Tier CI Quality Gate ([`ci-cd.yml`](file:///home/aysadeq/Desktop/Freelancer/.github/workflows/ci-cd.yml))

Our pipeline executes four parallel testing jobs across three tiers before deployment:

```text
 ┌────────────────────────────────────────────────────────────────────────┐
 │                      THE 3-TIER CI QUALITY GATE                        │
 ├────────────────────────────────────────────────────────────────────────┤
 │ TIER 1: Static Analysis & Code Quality                                 │
 │   • Job: lint-backend  ──▶ uv run ruff check --select E9,F63,F7,F82    │
 │   • Job: lint-frontend ──▶ bun install && bun run build                │
 ├────────────────────────────────────────────────────────────────────────┤
 │ TIER 2: Integration Test Suite (173 Pytest Tests)                      │
 │   • Job: test-backend  ──▶ Boots Postgres & Mailpit via Compose        │
 │                        ──▶ Runs prestart.sh (DB migrations)            │
 │                        ──▶ Runs tests-start.sh (Pytest + Coverage)     │
 │                        ──▶ Enforces coverage: --fail-under=70          │
 ├────────────────────────────────────────────────────────────────────────┤
 │ TIER 3: Docker Build & Smoke Test                                      │
 │   • Job: test-docker-compose ──▶ docker compose build                 │
 │                              ──▶ Run ephemeral prestart.sh             │
 │                              ──▶ docker compose up -d --wait backend   │
 │                              ──▶ curl http://localhost:8000/health     │
 │                              ──▶ curl http://localhost:8000 (UI root)  │
 └────────────────────────────────────────────────────────────────────────┘
```

### Detailed Breakdown of Each Job:

#### Tier 1: Static Code Quality
1. **`lint-backend` (Ruff Syntax Integrity):**
   * Uses Astral's Rust-based `uv` to install and execute Ruff in milliseconds.
   * `--select E9,F63,F7,F82`: Strictly checks for fatal syntax errors, invalid imports, undefined variable references, and breaking runtime bugs without blocking on minor cosmetic whitespace style.
2. **`lint-frontend` (TypeScript & Asset Compilation):**
   * Uses `oven-sh/setup-bun@v2` with Bun v1.3.12.
   * `bun run build`: Executes the full Vite + TypeScript compiler against React 19 source code, guaranteeing zero type errors or missing imports.

#### Tier 2: Backend Integration Testing (`test-backend`)
* Uses `enable-cache: true` with `astral-sh/setup-uv@v5` to cache Python packages based on `uv.lock`, speeding up subsequent test runs.
* Spawns live database and mock email dependencies inside the runner:
  ```bash
  cp .env.example .env
  docker compose up -d db mailpit
  ```
* Executes database migrations using Alembic:
  ```bash
  uv run bash scripts/prestart.sh
  ```
* Runs the complete test suite:
  ```bash
  uv run bash scripts/tests-start.sh "Coverage for ${{ github.sha }}"
  ```
* **Enforces 70% Code Coverage Gate:**
  `uv run coverage report --fail-under=70` halts the pipeline if test coverage drops below 70% (our actual backend achieves **83% coverage across 173 tests**).

#### Tier 3: Docker Build & Smoke Test (`test-docker-compose`)
* Proves that the actual production container build succeeds on a clean system:
  ```bash
  docker compose build
  docker compose run --rm backend bash scripts/prestart.sh
  docker compose up -d --wait backend
  ```
* **HTTP Smoke Testing:** Uses `curl -f --retry 5 --retry-delay 2` to verify that both the backend health diagnostic endpoint (`/api/v1/utils/health-check/`) and the compiled React single-page application (`/`) respond with HTTP 200 OK.
* **Automated Cleanup:** Enforces `docker compose down -v --remove-orphans` using `if: always()` to destroy test volumes cleanly.

---

## 5. Pipeline Mechanics: Directed Graphs (DAG), Concurrency & Security

### 1. Directed Acyclic Graph (DAG) Safety Gate
In [`ci-cd.yml`](file:///home/aysadeq/Desktop/Freelancer/.github/workflows/ci-cd.yml), the `deploy` job declares:
```yaml
deploy:
  name: Deploy to AWS
  runs-on: ubuntu-latest
  needs: [lint-backend, lint-frontend, test-backend, test-docker-compose]
  if: github.ref == 'refs/heads/master' && github.event_name == 'push'
```

* **The Mathematical Guarantee:** The `deploy` job cannot start until all 4 preceding quality checks return a green checkmark (`success`).
* **Pull Request Isolation:** On Pull Requests, the 4 test jobs run concurrently, while `deploy` is cleanly skipped because `github.ref` is not `master`.

---

### 2. Smart Dynamic Concurrency Control
```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: ${{ github.ref != 'refs/heads/master' }}
```

| Context | `cancel-in-progress` Value | Operational Behavior |
| :--- | :---: | :--- |
| **Pull Request (Feature Branch)** | **`true`** | If a developer pushes commit #2 while commit #1 is still testing, commit #1 is canceled immediately, saving CI queue time. |
| **Production (`master`)** | **`false`** | If two PRs merge in close succession, the active AWS deployment is **never aborted midway**, preventing half-finished container swaps. |

---

### 3. Path Filtering Without PR Deadlocks (`push.paths-ignore`)
```yaml
on:
  push:
    branches: [master]
    paths-ignore:
      - '**.md'
      - 'docs/**'
      - 'devops/docs/**'
  pull_request:
    branches: [master]
```

* **The Problem It Solves:** Editing documentation files or learning guides should never trigger an AWS container redeployment.
* **Why `paths-ignore` is ONLY on `push`:** If `paths-ignore` is placed on `pull_request`, GitHub Actions skips the workflow entirely. However, if GitHub Branch Protection requires `test-backend` to pass, GitHub waits forever for a check that never ran, locking the PR merge button.
* **Our Solution:** Pushes to `master` skip documentation edits cleanly, while PRs run tests unconditionally to satisfy branch protection rules.

---

### 4. The Principle of Least Privilege (Zero Server Tokens)
Evaluators frequently ask how the cloud server communicates with GitHub:

```text
 ┌──────────────────────┐                           ┌───────────────────────────┐
 │ GITHUB ACTIONS RUNNER│                           │      AWS EC2 SERVER       │
 │                      │                           │                           │
 │ • Holds SSH Key:     │                           │ • Zero GitHub Tokens      │
 │   `SERVER_SSH_KEY`   │ ──▶ rsync over SSH ──▶    │ • Zero GitHub Deploy Keys │
 │ • Ephemeral Memory   │                           │ • Passive Container Host  │
 └──────────────────────┘                           └───────────────────────────┘
```

* Storing a GitHub Personal Access Token (PAT) or repository write key on the AWS server violates the Principle of Least Privilege. If the cloud server were compromised, the attacker could manipulate the entire GitHub repository.
* In our architecture, the AWS server holds **zero credentials to access GitHub**. The GitHub Actions runner connects inbound via SSH using an ephemeral private key, pushes files, and terminates.

---

## 6. Secure Transport (`rsync`) & Zero-Downtime Swap ([`deploy.sh`](file:///home/aysadeq/Desktop/Freelancer/devops/scripts/deploy.sh))

### Why `rsync` over SSH instead of `git pull` on the Server?
1. **No Git Overhead:** `git pull` on the server requires installing Git credentials and pulling `.git` commit histories that bloat the 29 GB disk.
2. **Delta Differential Transfer:** `rsync` compares files between the runner and AWS, transferring only modified binary blocks with gzip compression (`-z`). Deployments sync in under **2 seconds**.
3. **Strict Exclusion Security:**
   ```bash
   rsync -avz --delete \
     --exclude '.git*' \
     --exclude '.env*' \
     --exclude 'node_modules' \
     --exclude '.venv' \
     --exclude '__pycache__' \
     --exclude 'devops/backup/dumps' \
     ./ ${{ secrets.SERVER_USER }}@${{ secrets.SERVER_HOST }}:/opt/skilio/
   ```
   * **`--exclude '.env*'`: Strict Secret Protection:** Guarantees that production secrets and database passwords configured on AWS are never overwritten by template files.
   * **`--exclude 'devops/backup/dumps'`: Data Resilience:** Guarantees that automated database backup snapshots are never deleted during code synchronization.
   * **`--delete`:** Cleans up deleted source files on the server to prevent stale code accumulation.

---

### The 4-Step Zero-Downtime Rollout ([`devops/scripts/deploy.sh`](file:///home/aysadeq/Desktop/Freelancer/devops/scripts/deploy.sh))

Once files are synchronized, GitHub Actions triggers `bash /opt/skilio/devops/scripts/deploy.sh`.

```text
 ┌────────────────────────────────────────────────────────────────────────┐
 │           STEP 1: BACKGROUND DOCKER CONTAINER BUILD                    │
 │                                                                        │
 │  docker compose -f compose.yml -f compose.deploy.yml build backend     │
 │                                                                        │
 │  • Compiles React 19 SPA & Python 3.14 image in the background.        │
 │  • Live container CONTINUES SERVING HTTP TRAFFIC without interruption. │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │           STEP 2: THE EPHEMERAL PRE-FLIGHT MIGRATION GATE              │
 │                                                                        │
 │  docker compose ... run -T --rm backend bash scripts/prestart.sh       │
 │                                                                        │
 │  • Spins up ONE-OFF temporary container from the new image.            │
 │  • Probes DB readiness, executes `alembic upgrade head`.               │
 │  • 💥 IF MIGRATION CRASHES: Script halts (`set -e`).                   │
 │     THE LIVE WEBSITE IS NEVER TOUCHED! Zero production outage.         │
 │  • If migration succeeds: container self-destructs (`--rm`).           │
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │           STEP 3: ATOMIC LIVE CONTAINER SWAP                           │
 │                                                                        │
 │  docker compose ... up -d --wait --force-recreate --no-deps backend    │
 │                                                                        │
 │  • Docker terminates old container and starts new container in < 1s.   │
 │  • `--no-deps`: Prevents restarting healthy db, redis, or proxy.       │
 │  • `--wait`: Blocks until internal container healthcheck reports ready.│
 └───────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼
 ┌────────────────────────────────────────────────────────────────────────┐
 │           STEP 4: DISK STORAGE PRUNING                                 │
 │                                                                        │
 │  docker image prune -f                                                 │
 │                                                                        │
 │  • Removes untagged dangling intermediate build layers.                │
 │  • Keeps AWS EBS root SSD disk utilization below 15%.                  │
 └────────────────────────────────────────────────────────────────────────┘
```

#### Why Line 38 (`docker compose run -T --rm ...`) is Best Practice:
* **Why not run migrations inside container startup (`CMD` / `entrypoint.sh`)?**  
  If multiple replicas of the backend start simultaneously, all instances race to apply `alembic upgrade head` at the exact same millisecond, corrupting database tables. Furthermore, if a migration fails, the container enters a `CrashLoopBackOff`, dropping user connections.
* **Our Solution:** An ephemeral one-off container acts as a gatekeeper. If the schema migration fails, the script aborts before the running container is ever touched.
* **Flag Breakdown:**
  * `-T`: Disables pseudo-TTY allocation to prevent terminal hangs during automated SSH pipelines.
  * `--rm`: Automatically removes the temporary container upon exit, preventing disk clutter.

---

## 7. Production Verification, CD Cons & Defense Guide

### Step 5: Live Production Health Verification Loop
After swapping the container, [`ci-cd.yml`](file:///home/aysadeq/Desktop/Freelancer/.github/workflows/ci-cd.yml#L157-L176) executes a post-deployment verification loop:

```bash
HEALTH_URL="https://skilio.works/api/v1/health"
MAX_RETRIES=12
RETRY_INTERVAL=5

for ((i=1; i<=MAX_RETRIES; i++)); do
  if curl -fsSL "$HEALTH_URL" 2>/dev/null | grep -q '"status":"healthy"'; then
    echo "==> Production deployment verified successfully at $HEALTH_URL!"
    exit 0
  fi
  sleep $RETRY_INTERVAL
done
exit 1
```

* **Active Telemetry Probing:** Does not simply check if Port 443 is open. It verifies that Traefik has routed traffic to the newly swapped container and that `/api/v1/health` confirms active PostgreSQL query latency (`SELECT 1`) and Redis ping latency.
* **Timeout Window:** Retries 12 times with 5-second intervals (60-second total window). If the backend fails to become healthy, the workflow exits with code 1, marking the deployment failed.

---

### The 4 Real Cons of Our CD Approach (Evaluation Self-Critique)

When evaluators ask: *"What are the limitations or cons of your CD approach compared to enterprise systems?"*, give this honest, technical assessment:

| Limitation / Con | What Happens in Our Pipeline | How Enterprise Tech Companies Solve It | Why Our Choice Fits 42 |
| :--- | :--- | :--- | :--- |
| **1. Compiling on the Host** | We `rsync` source code and run `docker compose build` on the EC2 host, spiking CPU/RAM during Vite builds. | Build images on CI runners, push to a private **Container Registry** (AWS ECR / Docker Hub), and run `docker pull` on the host. | Avoids paid private registry dependencies and moving parts; mitigated via our 2 GB Swap buffer. |
| **2. Single-Node Target (SPOF)** | We deploy to a single EC2 virtual machine (`16.192.59.166`). If the AWS datacenter zone fails, the site is offline. | Multi-node **Kubernetes (EKS)** or Auto-Scaling Groups distributed across multiple Availability Zones. | Running multi-node clusters costs hundreds of dollars per month; single node is realistic for student projects. |
| **3. No Automated Rollback** | If the `/health` check fails, the pipeline fails with `exit 1`, but requires manual intervention to revert code. | **Blue/Green Deployments:** Old version stays active until new version passes health checks, auto-reverting on error. | Blue/Green requires doubling physical server RAM (4 GB+) to run two complete versions simultaneously. |
| **4. SSH "Push" Architecture** | GitHub Actions connects inbound over SSH to trigger deployments, requiring Port 22 to accept connections. | **GitOps "Pull" Architecture (ArgoCD):** An in-cluster agent polls Git and pulls changes, allowing Port 22 to be closed. | SSH `rsync` gives direct, transparent terminal output without running a heavy background daemon eating RAM. |


---

### The 30-Second Defense Elevator Pitch
> *"Our delivery pipeline is a zero-touch CI/CD system implemented in `ci-cd.yml`. Pull Requests must pass a 3-tier quality gate comprising Ruff linting, Bun TypeScript compilation, 173 backend pytest tests enforcing 70% coverage, and a Docker build smoke test. Upon merging to `master`, code is synchronized over SSH using `rsync` with strict secret and backup exclusions. Deployments execute via `deploy.sh`, which builds updated images in the background, runs database migrations inside an ephemeral pre-flight container to prevent crash loops, atomically swaps running containers in milliseconds, and verifies live application health against `/api/v1/health` with zero downtime."*

