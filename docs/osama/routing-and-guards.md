# 🧭 Type-Safe Routing, Access Guards & URL State Validation

---

## 1. 42 Subject Compliance & Justification

In Section **IV.1 Web** and **IV.2 User Management**, the 42 curriculum requires:

> **"Major: Use a framework for the frontend with routing. Implement proper access control, authenticated guards, and clean role separation." (2 Points)**

| Subject Requirement | Plain English Implementation | Key Engineering Artifact |
| :--- | :--- | :--- |
| **1. Type-Safe Client-Side Routing** | **TanStack Router v1.170** with automated file-based route tree generation (`routeTree.gen.ts`), eliminating string-based 404 navigation bugs. | [`frontend/src/routeTree.gen.ts`](../../frontend/src/routeTree.gen.ts) |
| **2. Pre-Render Route Protection (`beforeLoad`)** | Authentication guard in [`_layout.tsx`](../../frontend/src/routes/_layout.tsx) executing *before* components mount, verifying JWT token validity and redirecting unauthenticated users to `/login`. | [`frontend/src/routes/_layout.tsx`](../../frontend/src/routes/_layout.tsx) |
| **3. Strict URL Search Param Validation** | Typed query param validation schemas in [`talent.tsx`](../../frontend/src/routes/_layout/talent.tsx) coercing search strings (`?q=...&category=...`) into validated runtime objects. | [`frontend/src/routes/_layout/talent.tsx`](../../frontend/src/routes/_layout/talent.tsx) |
| **4. Centralized Layout & Error Boundaries** | Hierarchical layout nesting via Pathless Layout (`_layout.tsx`), custom 404 handlers, and global React Error Boundaries in `__root.tsx`. | [`frontend/src/routes/__root.tsx`](../../frontend/src/routes/__root.tsx) |

---

## 2. Route Topology & Guard Lifecycle

```text
                             [ USER BROWSER ATTEMPT ]
                             Navigate to /dashboard
                                        │
                                        ▼
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                      TANSTACK ROUTER EXECUTION LIFECYCLE                    │
 │                                                                             │
 │  1. Match Route Pattern: /_layout/dashboard                                 │
 │  2. Execute Ancestor beforeLoad Hooks:                                      │
 │                                                                             │
 │     ┌──────────────────────────────────────────────────────────────────┐    │
 │     │                _layout.tsx: beforeLoad Guard                     │    │
 │     │                                                                  │    │
 │     │  Step A: Check localStorage.getItem("access_token")              │    │
 │     │          ├─ Missing? ──▶ throw redirect({ to: "/login" }) ─────┐ │    │
 │     │          └─ Present?                                           │ │    │
 │     │                 ▼                                              │ │    │
 │     │  Step B: Asynchronously query currentUser from cache/API       │ │    │
 │     │          ├─ HTTP 401/403 Expired?                              │ │    │
 │     │          │  • Clear localStorage & queryClient                 │ │    │
 │     │          │  • throw redirect({ to: "/login" }) ────────────────┼─┤    │
 │     │          └─ Success HTTP 200                                   │ │    │
 │     │                 ▼                                              │ │    │
 │     │  Step C: Permit Transition ──▶ Render <AppLayout />            │ │    │
 │     └────────────────────────────────────────────────────────────────┘ │    │
 └──────────────────────────────────────┬─────────────────────────────────┴────┘
                                        │
                        ┌───────────────┴───────────────┐
                        │                               │
                        ▼ (Denied)                      ▼ (Granted)
             ┌─────────────────────┐         ┌─────────────────────┐
             │ Redirect to /login  │         │ Render <Outlet />   │
             │ (URL state cleaned) │         │ (Dashboard Mounted) │
             └─────────────────────┘         └─────────────────────┘
```

---

## 3. Deep Technical Implementation

### 3.1 Pathless Layout Guard (`_layout.tsx`)
In [`frontend/src/routes/_layout.tsx`](file:///home/odahriz/Desktop/Skilio/frontend/src/routes/_layout.tsx#L7-L28):
```tsx
export const Route = createFileRoute("/_layout")({
  component: AppLayout,
  beforeLoad: async ({ context }) => {
    // 1. Synchronous check: immediately block users with no token
    if (!isLoggedIn()) throw redirect({ to: "/login" })

    // 2. Asynchronous check: verify token is valid against backend
    try {
      await context.queryClient.fetchQuery({
        queryKey: currentUserQueryKey,
        queryFn: fetchCurrentUser,
        staleTime: 0,
        retry: false,
      })
    } catch (error) {
      // 3. Trap 401/403, clean up session artifacts, and redirect
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
**Key Advantage:** Unlike traditional `useEffect` checks inside page components which render an initial "flash" of private content before redirecting, TanStack Router's `beforeLoad` executes **before the component tree mounts**. Unauthorized users never download or render private DOM nodes.

### 3.2 URL Search Parameter Validation
In [`frontend/src/routes/_layout/talent.tsx`](file:///home/odahriz/Desktop/Skilio/frontend/src/routes/_layout/talent.tsx#L4-L28):
```tsx
export const Route = createFileRoute("/_layout/talent")({
  validateSearch: (search: Record<string, unknown>): { q?: string; category?: string } => ({
    q: typeof search.q === "string" ? search.q : undefined,
    category: typeof search.category === "string" ? search.category : undefined,
  }),
  component: () => {
    const { q, category } = Route.useSearch()
    const navigate = Route.useNavigate()

    return (
      <TalentDirectoryPage
        query={q}
        category={category}
        onQueryChange={(query) => 
          void navigate({ search: (current) => ({ ...current, q: query }), replace: true })
        }
        onCategoryChange={(nextCategory) =>
          void navigate({
            search: (current) => ({
              ...current,
              category: nextCategory === "all" ? undefined : nextCategory,
            }),
            replace: true,
          })
        }
      />
    )
  },
})
```
- **Bookmarkable & Shareable:** Filtering results in the UI updates the browser URL bar in real time with `replace: true`.
- **Type-Coerced State:** Invalid query parameters (e.g. `?q=[object%20Object]`) are rejected and sanitized into `undefined` before hitting business logic.

---

## 4. Engineering Edge Cases & Solutions

### 1. The "Ghost Token" Vulnerability
- *Problem:* A user has an old, expired JWT stored in `localStorage`. If the guard only checks `isLoggedIn()` (token exists), the page begins loading private UI and then crashes when sub-queries fail with 401 Unauthorized.
- *Solution:* Implemented a two-stage verification in `beforeLoad`. Stage 1 performs a fast synchronous check; Stage 2 validates the token against `fetchCurrentUser` with `staleTime: 0, retry: false`. If expired, it triggers an atomic cleanup (`removeItem`, `queryClient.clear()`) and redirects cleanly to `/login`.

### 2. Multi-Tab Logout Desync
- *Problem:* When logging out in Tab A, Tab B would retain the active layout until the user refreshed.
- *Solution:* Dispatched `AUTH_TOKEN_CHANGED_EVENT` which triggers WebSocket disconnects and informs global listeners to clear session state immediately across active tabs.

---

## 5. Live 42 Evaluation Defense Walkthrough

### How to Demonstrate to Evaluators (3 Minutes):
1. **Demonstrate Route Protection:**
   - In private browsing mode (unauthenticated), enter `http://localhost:5173/dashboard` directly into the address bar.
   - Show how the browser is immediately intercepted and redirected to `/login` without rendering the dashboard or flashing private data.
2. **Show Network Tab Verification:**
   - Inspect the Network tab in DevTools.
   - Point out that no protected dashboard API calls (`/api/v1/jobs/me`, `/api/v1/proposals`) were triggered.
3. **Demonstrate Search Parameter Sync:**
   - Go to `/talent`, type `"Frontend"` in search and select `"Development"`.
   - Show how the URL dynamically reflects `?q=Frontend&category=Development`.
   - Copy the link into a new tab and demonstrate that the page reconstructs the exact filter state from the URL.
