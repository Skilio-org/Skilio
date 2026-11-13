# 🎨 Frontend Engineering & UI/UX Architecture Hub

## 1. 42 Evaluation Point Ledger (4 Points Total + Core Mandatory)

As Frontend Lead & UI/UX Architect, Osama Dahriz (`<omorakwant>`) claims **4 Points** of major evaluation modules plus the **Section III Mandatory Requirements**:

| Module ID | Scope | Description | Points | Primary Documentation |
| :--- | :--- | :--- | :---: | :--- |
| **IV.1** | **Web (Major)** | **Modern Frontend Framework (React 19, TypeScript, Vite, Tailwind v4)**<br>• React 19 SPA architecture with automatic batching and concurrent fiber rendering.<br>• TanStack Router v1.170 with type-safe file routes and Zod URL validation.<br>• TanStack Query v5 with centralized query keys and automated deduplication.<br>• Tailwind CSS v4 with native OKLCH theme variables and zero runtime CSS-in-JS cost. | **2 Pts** | 👉 **[spa-architecture.md](spa-architecture.md)**<br>👉 **[routing-and-guards.md](routing-and-guards.md)**<br>👉 **[data-fetching-and-cache.md](data-fetching-and-cache.md)** |
| **IV.2** | **User Management (Major)** | **Standard User Management & Dual-Role Workspaces**<br>• Unified user account supporting dual Client & Freelancer workspaces.<br>• Synchronous state subscription via React 19 `useSyncExternalStore`.<br>• Multi-tab window `storage` events & intra-tab `CustomEvent` bus.<br>• Zero-reload instant role transition without `window.location.reload()`. | **2 Pts** | 👉 **[dual-role-state-sync.md](dual-role-state-sync.md)** |
| **Sec III** | **Mandatory** | **Core Subject Compliance & UI/UX Standards**<br>• Zero JavaScript console errors on Google Chrome (`F12`).<br>• Fluid responsive mobile ergonomics (320px to 1440px) on `/connects`.<br>• Moroccan market localization (Dirhams, Moroccan cities, local categories).<br>• Scroll affordance fixes overcoming global scrollbar suppression. | **Pass/Fail** | 👉 **[mobile-ergonomics-connects.md](mobile-ergonomics-connects.md)**<br>👉 **[landing-page-and-localization.md](landing-page-and-localization.md)**<br>👉 **[scroll-affordance-and-dropdowns.md](scroll-affordance-and-dropdowns.md)** |

---

## 2. Master Frontend System Architecture

```text
                                  [ USER BROWSER ]
                   Desktop (1440px)  •  Tablet (768px)  •  Mobile (375px)
                                         │
                                         ▼
 ┌───────────────────────────────────────────────────────────────────────────────────┐
 │                            REACT 19 SPA RUNTIME SHELL                             │
 │                                                                                   │
 │   ┌───────────────────────────────────────────────────────────────────────────┐   │
 │   │                       TanStack Router v1.170 Root                         │   │
 │   │   • __root.tsx (Global Toast Provider, DevTools, Layout Outlets)          │   │
 │   │   • _layout.tsx (beforeLoad JWT Verification & 401 Session Interceptor)   │   │
 │   └─────────────────────────────────────┬─────────────────────────────────────┘   │
 │                                         │                                         │
 │                    ┌────────────────────┴────────────────────┐                    │
 │                    ▼                                         ▼                    │
 │   ┌─────────────────────────────────┐       ┌─────────────────────────────────┐   │
 │   │    Server State (TanStack Query)│       │    Client State (React 19)      │   │
 │   │  • Centralized Query Keys       │       │  • useSyncExternalStore         │   │
 │   │  • Request Deduplication        │       │  • LocalStorage Subscription    │   │
 │   │  • Invalidation on Mutation     │       │  • Custom Event Bus             │   │
 │   │  • 5-min Stale-While-Revalidate │       │  • Zero-Reload Role Switching   │   │
 │   └────────────────┬────────────────┘       └────────────────┬────────────────┘   │
 │                    │                                         │                    │
 │                    └────────────────────┬────────────────────┘                    │
 │                                         ▼                                         │
 │   ┌───────────────────────────────────────────────────────────────────────────┐   │
 │   │                          DOMAIN UI COMPONENT LAYER                        │   │
 │   │  • Moroccan Bento Landing Page   • Edge-to-Edge Mobile /connects Page     │   │
 │   │  • Accessible CategorySelect     • Auto-Dismissing Readiness Cards        │   │
 │   │  • Radix UI Accessible Primitives Styled with Tailwind CSS v4             │   │
 │   └─────────────────────────────────────┬─────────────────────────────────────┘   │
 └─────────────────────────────────────────┼─────────────────────────────────────────┘
                                           │
                                           ▼ (Axios HTTP / HTTPS)
 ┌───────────────────────────────────────────────────────────────────────────────────┐
 │                            FASTAPI APPLICATION GATEWAY                            │
 │                Stateless REST Endpoints  •  JWT Auth  •  WebSockets               │
 └───────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Frontend Documentation Directory

Our frontend documentation is organized into dedicated, deep-dive specifications for each implemented feature and architectural module:

### 📑 Feature & Architectural Specifications
* ⚛️ **[spa-architecture.md](spa-architecture.md)**: React 19, TypeScript 6, Vite 8 (SWC), Tailwind CSS v4, and Biome tooling (**IV.1 Web Major — 2 Pts**).
* 🧭 **[routing-and-guards.md](routing-and-guards.md)**: TanStack Router file-based tree, `beforeLoad` authentication guards, and Zod query search parameter validation (**IV.1 Web Major**).
* 🔄 **[dual-role-state-sync.md](dual-role-state-sync.md)**: Dual-role client/freelancer architecture, React 19 `useSyncExternalStore`, multi-tab sync, and non-reload role switching (**IV.2 User Management Major — 2 Pts**).
* ⚡ **[data-fetching-and-cache.md](data-fetching-and-cache.md)**: TanStack Query server-state caching, centralized query keys, request deduplication, and declarative mutations (**IV.1 Web Major**).
* 📱 **[mobile-ergonomics-connects.md](mobile-ergonomics-connects.md)**: Mobile-first responsive UI, edge-to-edge tab swipe, minimum 44px touch targets, and full-width mobile action bars (**UI/UX & Mandatory**).
* 🇲🇦 **[landing-page-and-localization.md](landing-page-and-localization.md)**: Moroccan market localization (Dirhams `DH/hr`, Moroccan cities), Bento-grid landing page, and auth-aware single-click navigation (**UI/UX & Mandatory**).
* 🖱️ **[scroll-affordance-and-dropdowns.md](scroll-affordance-and-dropdowns.md)**: Overcoming global scrollbar suppression, high-specificity `.scrollbar-thin` overrides, visual item slicing affordance, and dashboard onboarding decluttering (**UI/UX Engineering**).
* 🎓 **[presentation-plan.md](presentation-plan.md)**: Master 42 Evaluation Defense Plan, 60-second elevator pitch, 7 core web concept explanations, evaluator Q&A, and live-coding drills.
* 📋 **[landing-page-qa.md](landing-page-qa.md)**: Moroccan localization and QA test checklist.

---

## 4. Key CLI Commands (Frontend Operations Cheat Sheet)

All frontend commands can be executed using Bun or standard npm/Node:

### Local Development
```bash
bun run dev          # Start local Vite development server with SWC Hot Module Reload
bun run build        # Compile production bundle and generate type-safe route tree
bun run preview      # Locally preview the production production build
```

### Type Checking & Quality Assurance
```bash
bun run check        # Run strict TypeScript compiler verification (tsc --noEmit)
bun run lint         # Run Biome high-speed linter across all TSX components
bun run format       # Format all TSX, CSS, and JSON files to project standard
```

### Route Generation
```bash
# TanStack Router automatically regenerates src/routeTree.gen.ts on save during 'dev'.
# To force full regeneration:
bunx tsr generate
```
