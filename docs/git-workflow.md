# Skilio Team Git Workflow Guide

> **Engineering Standard for the Skilio Platform (`ft_transcendence`)**  
> Target Production Domain: [https://skilio.works](https://skilio.works)

---

## 1. Workflow Overview

We follow a lightweight **GitHub Flow** to protect the production deployment on AWS:

```text
 Feature Branch ──▶ Pull Request (PR) ──▶ Automated CI Tests (Green ✅) ──▶ Merge to master ──▶ Deploy to AWS
```

- **`master`** is always production-ready and automatically deploys to [skilio.works](https://skilio.works).
- **Direct pushes to `master` are forbidden**; all changes merge via Pull Requests.
- **Self-merging is enabled**: Once automated CI checks pass (🟢), the author can merge directly without waiting for manual reviews.

---

## 2. Branch Management

### Active Team Branches
All existing team branches remain active. Continue development on your current branch:
- `aysadeq`
- `Hossin`
- `amine`
- `osama`
- `zakaria`
- `wiring_fe`

When your task is complete, push your branch and open a **Pull Request** targeting `master`.

### Lifecycle After Merging
Once a PR is merged into `master`, choose one of the following for your next task:
1. **Fresh Feature Branch (Recommended)**:
   ```bash
   git checkout master
   git pull origin master
   git checkout -b feat/my-next-task
   ```
2. **Continue on Named Branch**:
   ```bash
   git checkout <branch-name>
   git pull origin master   # Sync with latest master before continuing
   ```

---

## 3. Daily Developer Lifecycle

```text
 1. Sync Branch          2. Commit Changes        3. Push to GitHub        4. Open PR           5. Merge
┌──────────────────┐    ┌─────────────────┐      ┌─────────────────┐      ┌─────────────┐      ┌───────────────┐
│ git checkout ... │──▶ │ git add .       │ ──▶  │ git push origin │ ──▶  │ Open PR on  │ ──▶  │ CI Green ✅   │
│ git pull master  │    │ git commit -m   │      │ <branch>        │      │ GitHub.com  │      │ Author Merges │
└──────────────────┘    └─────────────────┘      └─────────────────┘      └─────────────┘      └───────────────┘
```

### Step 1: Start the Day (Sync with `master`)
```bash
git checkout <your-branch>
git pull origin master
```

### Step 2: Stage & Commit
```bash
git add .
git commit -m "feat: descriptive commit message"
```

### Step 3: Push to GitHub
```bash
git push origin <your-branch>
```

### Step 4: Open a Pull Request
1. Navigate to the repository on GitHub.
2. Click **"Compare & pull request"** on your pushed branch.
3. Verify base branch is `master` and submit the PR.

### Step 5: Automated CI & Merge
GitHub Actions automatically runs the verification gate:
- 🧪 **`test-backend`**: Pytest suite and database migrations.
- 📦 **`test-docker-compose`**: Multi-stage Docker image compilation and container startup.
- 🧹 **`lint`**: Code quality checks (Python syntax via Ruff, TypeScript build via Bun).

Once all checks are **GREEN ✅**, click **"Merge pull request"** $\rightarrow$ **"Confirm merge"**.

---

## 4. Resolving Merge Conflicts

A conflict occurs only when two branches modify the exact same lines in the same file.

### Local Resolution (Recommended)
1. Pull the latest `master` into your branch:
   ```bash
   git pull origin master
   ```
2. Git marks the conflicting files (`CONFLICT (content): ...`).
3. Open the file in your editor and select the desired version (`Accept Current`, `Accept Incoming`, or merge both).
4. Stage, commit, and push:
   ```bash
   git add .
   git commit -m "fix: resolve merge conflicts with master"
   git push origin <your-branch>
   ```
5. The PR on GitHub updates automatically and unlocks the merge button.

### Web Resolution
For simple conflicts, click **"Resolve conflicts"** directly on the GitHub PR page, edit the lines, and click **"Commit merge"**.

---

## 5. Quick Terminal Cheat Sheet

| Task | Command |
| :--- | :--- |
| **Check status** | `git status` |
| **Switch to branch** | `git checkout <branch>` |
| **Sync with master** | `git pull origin master` |
| **Stage all changes** | `git add .` |
| **Commit staged changes** | `git commit -m "feat/fix: summary message"` |
| **Push current branch** | `git push origin <branch>` |
| **Temporarily stash work** | `git stash` (restore with `git stash pop`) |
| **Discard local unstaged changes** | `git restore <file>` |

---

## 6. Frequently Asked Questions (FAQ)

#### Q1: "A CI check failed with a red X (🔴). What should I do?"
Click **Details** next to the failing check in your PR, inspect the error log, fix the code locally on your branch, and push. GitHub will automatically re-run the tests.

#### Q2: "Another teammate merged into `master` while my PR was open."
Click **"Update branch"** on the GitHub PR page, or run `git pull origin master` locally and push.

#### Q3: "I accidentally committed directly on `master` locally. How do I fix it?"
Do not push. Move the commits to a branch and reset local `master`:
```bash
git checkout -b feat/recovered-work
git checkout master
git reset --hard origin/master
```
