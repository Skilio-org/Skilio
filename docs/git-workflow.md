# 🚀 Skilio Team Git Workflow & Collaboration Guide

> **Engineering Standard for the Skilio Platform (`ft_transcendence`)**  
> *Target Production Domain: [https://skilio.works](https://skilio.works)*

---

## 1. The Core Principle: Why `master` is Sacred

In our project, the `master` branch is connected directly to our **Automated CI/CD Pipeline on AWS EC2 (`16.192.59.166`)**:

$$\mathbf{git\ push\ origin\ master} \quad \Longrightarrow \quad \text{Live Deployment to } \mathbf{https://skilio.works}$$

Because every commit to `master` immediately updates the live public production server:
1. **`master` must ALWAYS be 100% stable, fully tested, and deployable.**
2. **Direct pushes to `master` are strictly forbidden.**
3. **All changes must pass automated CI tests in a Pull Request (PR) before merging.**

```text
 ┌─────────────────────────────────────────────────────────────┐
 │ ❌ OLD RISKY WAY: Direct Push to Master                     │
 │  Developer Laptop ──▶ git push origin master ──▶ [CRASH]    │
 └─────────────────────────────────────────────────────────────┘
                               VS
 ┌─────────────────────────────────────────────────────────────┐
 │ 🟢 PROFESSIONAL WAY: GitHub Flow                            │
 │  Feature Branch ──▶ Pull Request ──▶ CI Tests (Green ✅)    │
 │                     ──▶ Merge to Master ──▶ AWS EC2 Live!   │
 └─────────────────────────────────────────────────────────────┘
```

---

## 2. Branch Strategy & Management

### 2.1 Our Current Active Branches (KEEP THEM!)
To be 100% clear: **NO existing branches are deleted or discarded!**  
All current active team branches are fully preserved:
- `aysadeq` (DevOps & Cloud Deployment)
- `Hossin`
- `amine`
- `osama`
- `zakaria`
- `wiring_fe`

> [!IMPORTANT]
> **What this means for the team right now**: Everyone continues working on their current branch as normal. When your feature is done, do **not** merge locally into `master` on your laptop—simply push your branch to GitHub and open a **Pull Request (PR)**!

---

### 2.2 Branch Naming Conventions (For New Features & Bug Fixes)
When starting fresh tasks or specific sub-features, use standard, clear naming prefixes:

| Branch Type | Format | Example | Description |
| :--- | :--- | :--- | :--- |
| **New Features** | `feat/<feature-name>` | `feat/chat-websockets`, `feat/profile-card` | Adding a new user-facing capability. |
| **Bug Fixes** | `fix/<bug-name>` | `fix/navbar-mobile-overflow`, `fix/db-timeout` | Correcting a broken functionality. |
| **DevOps / Infra** | `devops/<task-name>` | `devops/monitoring-grafana`, `devops/cd-pipeline` | Server, Docker, CI/CD, or cloud configs. |
| **Personal Workspace**| `<your-name>/<task>` | `amine/dashboard`, `osama/auth` | Dedicated personal feature branch. |

---

### 2.3 What Happens to a Branch AFTER It Is Merged?
A branch is a temporary workspace for a specific unit of work. Once your Pull Request is merged into `master`:

```text
 Feature Complete ──▶ Open PR ──▶ CI Green 🟢 ──▶ Merged into Master ──▶ Live on AWS!
                                                                    │
                 ┌──────────────────────────────────────────────────┴─────────────────┐
                 ▼                                                                    ▼
      Option A: Fresh Feature Branch                                       Option B: Sync Personal Branch
      git checkout master                                                  git checkout your-name
      git pull origin master                                               git pull origin master
      git checkout -b feat/next-feature                                    (Ready for next feature)
```

1. **Option A (Industry Best Practice — Fresh Feature Branch)**:
   Create a fresh, focused branch for your next task off the updated `master`:
   ```bash
   git checkout master
   git pull origin master
   git checkout -b feat/my-next-feature
   ```
2. **Option B (Reusing Your Named Branch)**:
   If you prefer keeping your personal branch name (e.g. `amine`), simply sync it with the latest merged `master` before starting new work:
   ```bash
   git checkout amine
   git pull origin master   # Folds in all new changes from master
   ```

---

### 2.4 Branch Housekeeping & Stale Branches
- **Deleting Merged Feature Branches**: Once a feature PR is merged on GitHub, click the button **"Delete branch"** on GitHub. This keeps the repository clean and prevents 50 dead branches from accumulating.
- **Old Dependabot Branches**: You may see old branches named `dependabot/...` from automated package updates. Since Dependabot has been decommissioned, those can be safely closed and deleted on GitHub without affecting any team code.

---

## 3. The 5-Step Daily Developer Lifecycle

Here is the exact step-by-step lifecycle every teammate follows to build and ship features:

```text
 1. Start Day       2. Code & Commit      3. Push to GitHub     4. Open PR         5. Merge & Deploy
┌─────────────┐     ┌────────────────┐    ┌────────────────┐   ┌───────────────┐   ┌─────────────────┐
│ Sync Branch │ ──▶ │ git add        │ ──▶│ git push       │──▶│ 60s CI Tests  │──▶│ Merge to master │
│ from master │     │ git commit     │    │ origin feature │   │ Turn GREEN ✅ │   │ Auto-deploys 🚀 │
└─────────────┘     └────────────────┘    └────────────────┘   └───────────────┘   └─────────────────┘
```

### Step 1: Start Your Day by Syncing with `master`
Before writing new code, pull in your teammates' latest merged work so your branch never falls behind:
```bash
# Switch to your feature branch
git checkout feat/my-feature

# Pull latest master into your branch
git pull origin master
```

### Step 2: Code and Commit Cleanly
Write your code, test it locally, and create meaningful commit messages:
```bash
git add .
git commit -m "feat: implement user avatar upload with cloudinary"
```

### Step 3: Push Your Branch to GitHub
```bash
git push origin feat/my-feature
```

### Step 4: Open a Pull Request (PR) on GitHub (Takes 15 Seconds!)
1. Open your repository in your browser: `https://github.com/<team>/<repo>`.
2. A yellow banner will appear at the top saying:  
   👉 **"feat/my-feature had recent pushes — Compare & pull request"**.
3. Click the green button: **"Compare & pull request"**.
4. Give your PR a short title and description of what you changed.
5. Click **"Create pull request"**.

### Step 5: Automated CI Quality Gate & Merge
Once your PR is open, GitHub Actions automatically executes our 3 CI workflows:
- 🧪 **`test-backend`**: Spins up PostgreSQL and runs all Python `pytest` suites.
- 📦 **`test-docker-compose`**: Compiles all Docker images to ensure build stability.
- 🧹 **`pre-commit`**: Validates syntax, formatting, and linting with Ruff and Bun.

When all checks turn **GREEN ✅**:
- Click **"Merge pull request"**!
- Click **"Confirm merge"**.
- Your code is now safely on `master`, and GitHub Actions automatically triggers our CD pipeline to ship it live to `https://skilio.works`!

---

## 4. How to Handle Merge Conflicts (Zero-Panic Guide)

### Why do merge conflicts happen?
A merge conflict only happens when **you and a teammate edit the exact same line of the exact same file**. Git stops and asks you to pick which line to keep.

### Method A: Resolving in VS Code / Antigravity IDE (Recommended)
1. On your laptop, pull `master` into your branch:
   ```bash
   git pull origin master
   ```
2. Git will notify you: `CONFLICT (content): Merge conflict in src/App.tsx`.
3. Open `src/App.tsx` in your editor. You will see interactive buttons:
   ```text
   <<<<<<< HEAD (Current Change - Your Code)
   const apiUrl = "https://skilio.works/api";
   =======
   const apiUrl = "https://api.skilio.works";
   >>>>>>> master (Incoming Change - Master Code)
   ```
4. Click **"Accept Current Change"** OR **"Accept Incoming Change"** (or combine them).
5. Save the file, commit the fix, and push:
   ```bash
   git add .
   git commit -m "fix: resolve merge conflicts with master"
   git push origin feat/my-feature
   ```
6. Your Pull Request on GitHub will instantly update and unlock the Merge button!

### Method B: Resolving Directly on GitHub.com
If a PR has conflicts:
1. GitHub displays a button: **"Resolve conflicts"** on the PR page.
2. Click it $\rightarrow$ Edit the file directly in the browser $\rightarrow$ Delete the conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`).
3. Click **"Mark as resolved"** $\rightarrow$ **"Commit merge"**.

---

## 5. How to Activate Branch Protection in GitHub Settings

To prevent accidental direct pushes and guarantee that `master` stays protected, the repository admin should enable GitHub Branch Protection:

```text
 GitHub Repository ──▶ Settings ──▶ Branches ──▶ Add branch ruleset / protection rule
```

### Step-by-Step Activation Instructions:
1. Navigate to your GitHub repository in your browser.
2. Click **Settings** (tab on the top right).
3. In the left navigation sidebar under **Code and automation**, click **Branches** (or **Rules** $\rightarrow$ **Rulesets**).
4. Under **Branch protection rules**, click **"Add rule"** (or **"New branch ruleset"**).
5. Fill in the following settings:
   - **Branch name pattern**: `master`
6. Check these 3 mandatory checkboxes:
   - ☑️ **Require a pull request before merging**  
     *(Blocks `git push origin master` directly from anyone's terminal).*
   - ☑️ **Require status checks to pass before merging**  
     - Under the search box that appears, search and select our 3 CI jobs:
       - `test-backend`
       - `test-docker-compose`
       - `pre-commit`
     *(Locks the green Merge button if any test fails).*
   - ☑️ **Do not allow force pushes**  
     *(Prevents `git push --force` from deleting history or breaking the repo).*
7. Click the green button: **"Create"** or **"Save changes"**.

---

## 6. Copy-Paste Terminal Cheat Sheet

Here are the essential commands you will use 99% of the time:

### Starting a New Task:
```bash
# 1. Update your local master first
git checkout master
git pull origin master

# 2. Create and switch to your new branch
git checkout -b feat/my-new-task
```

### Saving & Uploading Work:
```bash
# Check what files you modified
git status

# Stage all changes
git add .

# Save with a clear message
git commit -m "feat: add user profile settings page"

# Push your branch to GitHub
git push origin feat/my-new-task
```

### Updating Your Branch with Latest Team Changes:
```bash
# On your branch, pull latest master
git pull origin master
```

### Stashing Work (If you need to quickly switch branches without committing):
```bash
# Temporarily hide your uncommitted work
git stash

# Switch to another branch
git checkout other-branch

# When you come back, restore your work
git checkout feat/my-new-task
git stash pop
```

---

## 7. Frequently Asked Questions (FAQ)

#### Q1: "My Pull Request CI checks turned RED 🔴. What do I do?"
1. Click on the failed check (e.g., `Details` next to `test-backend`).
2. Read the error message in the console log.
3. Fix the bug on your laptop on your feature branch.
4. Commit and push:
   ```bash
   git add .
   git commit -m "fix: resolve failing test"
   git push origin feat/my-feature
   ```
5. GitHub will **automatically re-run all tests**. Once they turn green 🟢, you can merge!

#### Q2: "A teammate merged into master while my PR was open. What do I do?"
- On your PR page on GitHub, click the button **"Update branch"**.
- Alternatively, run `git pull origin master` on your laptop and `git push`.

#### Q3: "I accidentally committed directly on `master` locally! How do I fix it?"
Do NOT push it! Move your commits to a new branch safely:
```bash
# Create a new branch with your current commits
git checkout -b feat/my-recovered-work

# Switch back to master and reset it to match GitHub's clean master
git checkout master
git reset --hard origin/master
```
Your work is now safely preserved on `feat/my-recovered-work`, and your local `master` is clean again.

---

*Authored by the DevOps Team for Skilio (`ft_transcendence` v21.2).*
