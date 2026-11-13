# 🏗️ Skilio Frontend Architecture & Implemented Features

**Author:** Osama Dahriz (`<omorakwant>`) — Frontend Lead & UI/UX Architect  
**Project:** Skilio Freelancer Marketplace Platform  
**Target Evaluation:** 42 Peer Evaluation & Bocal Defense  

---

## 1. Architectural Philosophy & Technology Stack

The Skilio frontend is built as a pure **Single-Page Application (SPA)** designed for zero unnecessary re-renders, strict end-to-end type safety, and immediate user responsiveness.

```
┌────────────────────────────────────────────────────────────────────────┐
│                              CLIENT BROWSER                            │
│  React 19 • TypeScript 6 • Vite 8 (SWC) • Tailwind CSS v4             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
           ┌────────────────────────┴────────────────────────┐
           ▼                                                 ▼
┌─────────────────────────────────┐       ┌──────────────────────────────────┐
│         ROUTING LAYER           │       │        SERVER-STATE LAYER        │
│   TanStack Router v1.170        │       │       TanStack Query v5.101      │
│  - Type-safe file route tree    │       │  - Query Cache & Deduplication   │
│  - beforeLoad auth guards       │       │  - Background Revalidation       │
│  - Zod search param validation  │       │  - Optimistic Mutations          │
└────────────────┬────────────────┘       └─────────────────┬────────────────┘
                 │                                          │
                 └────────────────────┬─────────────────────┘
                                      ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        COMPONENT ARCHITECTURE                          │
│  - UI Primitives (Radix UI / shadcn/ui headless components)           │
│  - Domain Components (Landing, Connections, Chat, Reviews)             │
│  - Page Views (Thin composition layers)                                │
└────────────────────────────────────────────────────────────────────────┘
```

### Technology Matrix:
| Layer | Library / Version | Technical Justification |
| :--- | :--- | :--- |
| **Runtime & Compiler** | React 19.2 + TypeScript 6.0 | Latest React Fiber architecture with automatic render batching, Actions, and end-to-end type safety shared with backend schemas via OpenAPI. |
| **Bundler & HMR** | Vite 8.2 (SWC) | Sub-millisecond Hot Module Replacement (HMR) powered by native ES modules and compiled Rust-based transform (SWC). |
| **Styling & Design Tokens** | Tailwind CSS v4.2 (`@tailwindcss/vite`) | Engine-level CSS utility framework integrated directly into Vite, utilizing native CSS variables for dynamic Dark/Light theming without CSS-in-JS runtime overhead. |
| **Client Routing** | TanStack Router 1.170 | Build-time type-safe routing tree (`routeTree.gen.ts`) with route guards (`beforeLoad`) and strict URL query-parameter validation with Zod. |
| **Server State Management** | TanStack Query 5.101 | Declarative caching, background revalidation, automatic request deduplication, and optimistic cache mutations. |
| **Headless UI Primitives** | Radix UI / shadcn/ui | Unstyled, fully accessible (WAI-ARIA compliant) component primitives styled with Tailwind CSS. |

---

## 2. Type-Safe Routing & Route Protection

Traditional routing libraries rely on string paths (e.g. `navigate('/talent/' + id)`), which easily causes runtime 404s, broken links, and unvalidated query parameters. Skilio uses **TanStack Router**.

### 2.1 File-Based Route Hierarchy
Routes in `frontend/src/routes/` are statically analyzed by `@tanstack/router-plugin` to generate `routeTree.gen.ts`:
- `__root.tsx`: Top-level application shell with toast providers and DevTools.
- `index.tsx`: Public Landing Page.
- `login.tsx` / `signup.tsx`: Public authentication pages.
- `_layout.tsx`: **The protected route boundary** (the `_` prefix denotes a pathless layout). All inner routes inherit this layout's security constraints.

### 2.2 Route Guard (`beforeLoad`) Implementation
In [`frontend/src/routes/_layout.tsx`](file:///home/odahriz/Desktop/Skilio/frontend/src/routes/_layout.tsx#L9-L28):
```tsx
export const Route = createFileRoute("/_layout")({
  component: AppLayout,
  beforeLoad: async ({ context }) => {
    // 1. Synchronously verify token presence in localStorage
    if (!isLoggedIn()) throw redirect({ to: "/login" })

    // 2. Asynchronously verify token validity against the backend
    try {
      await context.queryClient.fetchQuery({
        queryKey: currentUserQueryKey,
        queryFn: fetchCurrentUser,
        staleTime: 0,
        retry: false,
      })
    } catch (error) {
      // 3. If token is invalid or expired (401/403), purge credentials and redirect
      if (isAxiosError(error) && [401, 403].includes(error.response?.status ?? 0)) {
        localStorage.removeItem("access_token")
        window.dispatchEvent(new Event(AUTH_TOKEN_CHANGED_EVENT))
        context.queryClient.clear()
        throw redirect({ to: "/login" })
      }
      throw error
    }
  },
})
```
**Why this is superior:** The authentication check executes **before any component mounts**. The browser never renders private UI or performs unauthorized sub-queries.

### 2.3 Strict URL Search Parameter Validation with Zod
In [`frontend/src/routes/_layout/talent.tsx`](file:///home/odahriz/Desktop/Skilio/frontend/src/routes/_layout/talent.tsx):
```tsx
validateSearch: (search: Record<string, unknown>): { q?: string; category?: string } => ({
  q: typeof search.q === "string" ? search.q : undefined,
  category: typeof search.category === "string" ? search.category : undefined,
})
```
All query string inputs (`?q=React&category=Design`) are validated and coerced into strongly typed objects before being passed to page components, preventing injection and state desynchronization.

---

## 3. Server-State Caching Architecture (TanStack Query)

Skilio maintains a clean separation between **Client State** (modal open, active tab) and **Server State** (jobs, proposals, profiles, categories).

### 3.1 Centralized Query Keys
All query keys are organized in [`frontend/src/lib/query-keys.ts`](file:///home/odahriz/Desktop/Skilio/frontend/src/lib/query-keys.ts) to establish predictable cache invalidation hierarchies:
```ts
export const queryKeys = {
  currentUser: ["currentUser"] as const,
  categories: ["categories"] as const,
  clientProfile: ["client-profile"] as const,
  clientJobs: ["client-jobs"] as const,
  clientJobsActiveCount: ["client-jobs", "active-count"] as const,
  connections: ["connections"] as const,
  talentProfiles: ["talent-profiles"] as const,
}
```

### 3.2 Cache Invalidation & Optimistic Updates
When a user takes an action (e.g. accepting a connection request or posting a job), we use `useMutation`. Instead of manually re-fetching or manually patching complex lists, we invalidate the query key:
```tsx
const acceptMutation = useAcceptConnectionRequest()
// On success, queryClient.invalidateQueries({ queryKey: queryKeys.connections })
// triggers a silent background re-fetch, keeping all subscribed views in sync.
```

---

## 4. Dual-Role Workspace Synchronization (`useSyncExternalStore`)

### The Challenge:
Skilio accounts have two roles: **Client** and **Freelancer**. Users can toggle between them in one click. Storing the role only in component state (`useState`) would lose state on navigation; storing it only in `localStorage` without a subscription would cause hydration bugs or require full-page reloads.

### The Solution:
In [`frontend/src/hooks/useAccountRole.ts`](file:///home/odahriz/Desktop/Skilio/frontend/src/hooks/useAccountRole.ts), we use React 19's native `useSyncExternalStore`:
```tsx
export function useAccountRole(): AccountRole {
  const { user } = useAuth()
  return useSyncExternalStore(
    subscribeAccountRole, // Listens to storage events and custom "account-role-changed" events
    () => {               // Client snapshot: reads from user or localStorage
      if (user?.active_role) return user.active_role as AccountRole
      if (user?.email) return accountRole(user.email)
      return "client"
    },
    () => "client"        // SSR / Fallback snapshot
  )
}
```
**Why this matters:** When a user switches workspace:
1. `UsersService.switchRole()` notifies the backend.
2. `setAccountRole()` updates `localStorage` and dispatches `window.dispatchEvent(new Event("freelancer:account-role-changed"))`.
3. Every subscribed component across the entire application instantly re-renders with the new workspace layout **without a page reload**.

---

## 5. Responsive Connections Interface (`/connects`)

The Connections page was completely overhauled for consistent mobile ergonomics on screens from 320px to 1440px.

### Key Refactorings in [`connection-cards.tsx`](file:///home/odahriz/Desktop/Skilio/frontend/src/components/connections/connection-cards.tsx) and [`connects-page.tsx`](file:///home/odahriz/Desktop/Skilio/frontend/src/pages/common/connects-page.tsx):
1. **Edge-to-Edge Tab Scrolling**:
   On mobile screens, navigation tabs frequently clipped at container edges. Added `-mx-4 px-4 sm:mx-0 sm:px-0` with `[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden` for smooth, touch-friendly edge-to-edge tab scrolling.
2. **Card Padding Calibration**:
   Reduced fixed `p-5` padding down to `p-4 sm:p-5`, reclaiming 16px of horizontal space on narrow screens (360px–390px) to prevent avatar and badge squashing.
3. **Full-Width Mobile Action Bars**:
   - In `ReceivedRequestCard`: Replaced floating right-aligned buttons with a responsive action bar:
     `w-full grid grid-cols-2 gap-2 pt-2.5 border-t border-outline-variant/50 sm:w-auto sm:border-t-0 sm:pt-0 sm:self-center`
     Buttons expand to 50% width on mobile with `h-9` touch targets, and smoothly convert to inline `h-8` buttons on desktop.
   - In `SentRequestCard`: The "Withdraw" button expands to full width on mobile (`w-full sm:w-auto h-9 sm:h-8`).
4. **Collision Prevention**:
   Wrapped the `ConnectionCard` footer in `flex-wrap gap-2 justify-between` to ensure *"Collaboration unlocked"* and *"Message"* never collide or wrap awkwardly on small viewports.

---

## 6. Moroccan Market Landing Page Modularization

The landing page was modernized to remove generic Silicon Valley jargon, eliminate bloated code, and directly serve Moroccan founders and freelancers.

### 6.1 Component Architecture:
- [`LandingHero`](file:///home/odahriz/Desktop/Skilio/frontend/src/components/landing/landing-hero.tsx):
  - Headline centered: *"Hire skilled Moroccan freelancers."*
  - Interactive search hub with role toggle (`Hire Talent` / `Find Work`).
  - Search box with dynamic categories directly beneath it.
- [`LandingHeader`](file:///home/odahriz/Desktop/Skilio/frontend/src/components/landing/landing-header.tsx):
  - Unified with platform `TopNav` at `h-14` with backdrop blur (`backdrop-blur-md`).
  - **Auth-Aware Single-Click Navigation**: Public visitors see "Log in" and "Join Skilio". For logged-in users, clicking "Log in" routes directly to their active dashboard (`/freelancer-dashboard` or `/dashboard`) without disruptive profile dropdowns.
- [`LandingTalentCard`](file:///home/odahriz/Desktop/Skilio/frontend/src/components/landing/landing-talent-card.tsx):
  - Modularized card component utilizing `formatMoney` with transparent Dirham rates (`DH/hr`), Moroccan city badges (Casablanca, Rabat, Tangier), and verified star ratings.
- [`LandingFooter`](file:///home/odahriz/Desktop/Skilio/frontend/src/components/landing/landing-footer.tsx):
  - Replaced the hardcoded `.slice(0, 7)` specialties limit with live dynamic mapping of all 11 backend categories.

---

## 7. Dropdown UX & Overcoming Global Scrollbar Suppression

### 7.1 The Hidden Root Cause:
In [`frontend/src/styles/globals.css`](file:///home/odahriz/Desktop/Skilio/frontend/src/styles/globals.css#L891-L897), a legacy global rule stripped scrollbars across the entire application:
```css
@layer base {
  * { scrollbar-width: none; }
  ::-webkit-scrollbar { display: none; }
}
```
This caused all scrollable popovers and dropdowns (such as `CategorySelect`) to appear completely static. Users had no visual indication that the category list had more items below the fold.

### 7.2 The Multi-Tier UX Fix in [`CategorySelect`](file:///home/odahriz/Desktop/Skilio/frontend/src/components/common/category-select.tsx):
1. **Explicit Custom Scrollbar**:
   Overrode the global suppression on `CommandList`:
   ```tsx
   className="max-h-[268px] overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:var(--color-outline-variant)_transparent] [&::-webkit-scrollbar]:block [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-outline-variant hover:[&::-webkit-scrollbar-thumb]:bg-outline"
   ```
2. **Visual Cut-Off Affordance**:
   Calibrated `max-h-[268px]` so the 7th item is sliced halfway across the bottom edge. In UX psychology, a partially visible item immediately informs users that additional content exists below.
3. **Live Status Footer**:
   Added a subtle status row when categories exceed 5:
   ```
   11 categories                     Scroll for more
   ```

---

## 8. Dashboard Decluttering & Auto-Dismissing Onboarding

1. **Freelancer Profile Readiness**:
   Extracted into [`FreelancerProfileReadinessCard`](file:///home/odahriz/Desktop/Skilio/frontend/src/components/freelancer/freelancer-profile-readiness-card.tsx). Automatically hides itself when profile completion reaches 100%, preventing permanent sidebar noise.
2. **Client Workspace Cleanup**:
   Eliminated the misleading, static *"Set your project up for success"* card (`dashboard-profile-progress.tsx`) from [`dashboard-page.tsx`](file:///home/odahriz/Desktop/Skilio/frontend/src/pages/client-area/dashboard-page.tsx). The client sidebar now cleanly prioritizes **Saved Talent** (`QuickSavedSearch`).

