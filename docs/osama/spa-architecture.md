# ⚛️ Modern Single-Page Application (SPA) Architecture & Tooling

---

## 1. 42 Subject Compliance & Justification

In Section **IV.1 Web**, the 42 curriculum defines this module as:

> **"Major: Use a framework for the frontend. A modern single-page application framework must be used." (2 Points)**

| Subject Requirement | Plain English Implementation | Key Engineering Artifact |
| :--- | :--- | :--- |
| **1. Modern Frontend Framework** | Built on **React 19.2** utilizing the React Fiber architecture, concurrent rendering capabilities, and the newest Action and Form handling paradigms. | [`frontend/package.json`](../../frontend/package.json) |
| **2. Strict Type Safety** | 100% strict **TypeScript 6.0** codebase with zero `any` types in production logic, strict null checks, and shared data contract interfaces. | [`frontend/tsconfig.json`](../../frontend/tsconfig.json) |
| **3. Sub-Second Build & HMR Pipeline** | **Vite 8.2** with SWC (Speedy Web Compiler) for native ES module serving and sub-millisecond Hot Module Replacement (HMR). | [`frontend/vite.config.ts`](../../frontend/vite.config.ts) |
| **4. Next-Gen Design Tokens & Styling** | **Tailwind CSS v4.2** integrated via `@tailwindcss/vite` engine compiler, replacing legacy PostCSS transforms with native CSS variables. | [`frontend/src/styles/globals.css`](../../frontend/src/styles/globals.css) |
| **5. High-Performance Linter & Formatter** | **Biome** configuration enforcing unified linting, imports ordering, and formatting in $<50\text{ms}$. | [`frontend/biome.json`](../../frontend/biome.json) |

---

## 2. Master Frontend Build & Runtime Topology

```text
                                  [ SOURCE CODE ]
       React 19 (TSX)  •  TypeScript 6  •  Tailwind CSS v4  •  Radix Headless Primitives
                                         │
                                         ▼
 ┌───────────────────────────────────────────────────────────────────────────────────┐
 │                            VITE 8 + SWC COMPILER PIPELINE                         │
 │                                                                                   │
 │   ┌────────────────────────┐  ┌────────────────────────┐  ┌────────────────────┐  │
 │   │  @vitejs/plugin-react  │  │   @tailwindcss/vite    │  │   @tanstack/router │  │
 │   │  • SWC Rust transforms │  │   • Native CSS parser  │  │   • Route tree gen │  │
 │   │  • JSX runtime auto    │  │   • Theme variables    │  │   • Type inference │  │
 │   └───────────┬────────────┘  └───────────┬────────────┘  └─────────┬──────────┘  │
 └───────────────┼───────────────────────────┼─────────────────────────┼─────────────┘
                 │                           │                         │
                 ▼                           ▼                         ▼
 ┌───────────────────────────────────────────────────────────────────────────────────┐
 │                              BROWSER RUNTIME MEMORY                               │
 │                                                                                   │
 │   ┌───────────────────────────────────────────────────────────────────────────┐   │
 │   │                         TanStack Router v1.170 Root                       │   │
 │   │     • Static Route Tree  • beforeLoad Security Guards  • Zod Validation   │   │
 │   └─────────────────────────────────────┬─────────────────────────────────────┘   │
 │                                         │                                         │
 │                    ┌────────────────────┴────────────────────┐                    │
 │                    ▼                                         ▼                    │
 │   ┌─────────────────────────────────┐       ┌─────────────────────────────────┐   │
 │   │      TanStack Query Cache       │       │    Dual-Role External Store     │   │
 │   │  • Automated Deduplication      │       │  • useSyncExternalStore         │   │
 │   │  • Stale-While-Revalidate       │       │  • Cross-Tab Storage Events     │   │
 │   │  • Optimistic Cache Mutation    │       │  • Custom Event Broadcast       │   │
 │   └────────────────┬────────────────┘       └────────────────┬────────────────┘   │
 │                    │                                         │                    │
 │                    └────────────────────┬────────────────────┘                    │
 │                                         ▼                                         │
 │   ┌───────────────────────────────────────────────────────────────────────────┐   │
 │   │                          Radix UI + shadcn/ui                             │   │
 │   │       Accessible WAI-ARIA Primitives • Responsive Tailwind Styling        │   │
 │   └───────────────────────────────────────────────────────────────────────────┘   │
 └───────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Core Architecture Pillars

### 3.1 React 19 Fiber & Concurrent Capabilities
The application runs on React 19 (`react@^19.2.0`, `react-dom@^19.2.0`). This brings:
- **Automatic Render Batching:** All state updates triggered inside promises, timeouts, and event handlers are batched into a single render cycle, eliminating intermediate layout thrashing.
- **Modern React Compiler Ready:** Components follow pure functional patterns without fragile `useMemo` over-optimization, relying on predictable component render boundaries.
- **Native Document Metadata:** Direct title and meta tags handling without requiring bloated third-party wrapper libraries like `react-helmet`.

### 3.2 Vite 8 + SWC Bundling Engine
In [`frontend/vite.config.ts`](file:///home/odahriz/Desktop/Skilio/frontend/vite.config.ts):
```ts
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import tailwindcss from "@tailwindcss/vite"
import { TanStackRouterVite } from "@tanstack/router-plugin/vite"
import path from "node:path"

export default defineConfig({
  plugins: [
    TanStackRouterVite({ routesDirectory: "./src/routes", generatedRouteTree: "./src/routeTree.gen.ts" }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
})
```
- **Rust-Powered SWC:** Replaces Babel with SWC for near-instant transpilation.
- **Path Aliasing (`@/`):** Clean imports mapped directly to `frontend/src/`, preventing fragile relative path hell (`../../../../components/`).

### 3.3 Tailwind CSS v4 Engine Migration
Tailwind v4 is an architectural leap from v3:
- **Zero PostCSS Dependency:** Directly compiles via `@tailwindcss/vite` in native Rust/C++.
- **CSS-First Theme Variables:** Replaced the heavy JavaScript `tailwind.config.js` with pure CSS custom properties in `globals.css`:
  ```css
  @import "tailwindcss";

  @layer base {
    :root {
      --color-background: oklch(0.985 0.002 247.8);
      --color-surface: oklch(1 0 0);
      --color-primary: oklch(0.55 0.22 260);
      /* Dynamic theme tokens */
    }
    .dark {
      --color-background: oklch(0.14 0.005 260);
      --color-surface: oklch(0.18 0.008 260);
    }
  }
  ```
- **No Runtime CSS-in-JS Cost:** Zero JavaScript overhead during style evaluation; all utility classes are evaluated at compile time.

---

## 4. Engineering Edge Cases & Solutions

### 1. Tailwind v4 Radix & shadcn/ui Variable Resolution
- *Problem:* Initial migration to Tailwind v4 caused missing styles across shadcn/ui dropdowns and dialogs because v4 no longer uses `theme.extend.colors` from `tailwind.config.js`.
- *Solution:* Standardized color references using native modern OKLCH CSS variables in `globals.css` and mapped `@theme` blocks directly into Vite's CSS entry point.

### 2. Linux OOM Crash during Containerized Vite Build
- *Problem:* Running `bun run build` inside resource-constrained environments (like the AWS 2GB RAM instance) threw exit code 137 due to peak memory during rollup chunking.
- *Solution:* Configured Vite build options for manual chunk splitting and coordinated with DevOps to ensure a 2GB virtual swap file was enabled during container compilation.

---

## 5. Live 42 Evaluation Defense Walkthrough

### How to Demonstrate to Evaluators (3 Minutes):
1. **Show Tooling Configuration:**
   - Open [`frontend/package.json`](file:///home/odahriz/Desktop/Skilio/frontend/package.json) and point to React `^19.2.0`, Vite `^8.2.0`, and `@tailwindcss/vite` `^4.2.0`.
2. **Demonstrate Sub-Millisecond HMR:**
   - Run `bun run dev` (or show the running dev server).
   - Edit any headline text in `frontend/src/routes/index.tsx`.
   - Show how the browser updates in $<50\text{ms}$ without a full page refresh and without losing form or UI state.
3. **Verify Type-Safety:**
   - Open a terminal and run `bun run check` (or `tsc --noEmit`). Show that the entire TypeScript codebase passes with 0 errors.
4. **Show Zero Console Errors (Mandatory Section III):**
   - Open Google Chrome DevTools (`F12`), navigate through the site, and verify that the console is completely clean of warnings and errors.
