# 🎓 42 Frontend Defense Guide & Mock Evaluation Drills

**Author:** Osama Dahriz (`<omorakwant>`) — Frontend Lead & UI/UX Architect  
**Project:** Skilio Freelancer Marketplace Platform  
**Target:** 42 Peer Evaluation & Bocal Defense  

---

## 1. The 60-Second Frontend Opening Pitch

When the evaluator sits down and says: *"Tell me about the frontend architecture and your role"*:

> **"I am the Frontend Lead on Skilio. I architected our Single-Page Application using React 19, TypeScript 6, and Vite 8, styled with Tailwind CSS v4 and Radix UI headless primitives.**  
> **Rather than relying on legacy runtime routing, we used TanStack Router for 100% build-time type-safe routing, code-splitting, and Zod query validation, with `beforeLoad` authentication guards protecting our workspaces.**  
> **For data management, we strictly decoupled UI state from Server State using TanStack Query v5 for declarative caching and background revalidation.**  
> **I also engineered our dual-role workspace switcher using React 19's `useSyncExternalStore` so users can transition between Client and Freelancer modes without page reloads, and rebuilt our connections and landing interfaces for mobile ergonomics and Moroccan market localization."**

---

## 2. Core Web Development Concepts (The 42 Defense Answers)

Evaluators frequently ask basic and intermediate web concepts to verify that you didn't just copy libraries. Master these 7 definitions:

### 1. Zod Validation
- **Simple Definition**: Schema validation library that checks untrusted data at runtime.
- **The Technical Defense**: TypeScript types only exist during development; they are completely erased when compiled to JavaScript. Zod validates data while the program is running in the browser. In Skilio, we use Zod in TanStack Router's `validateSearch` to sanitize URL query strings (`?category=...&q=...`) and in form submissions with React Hook Form.

### 2. JSX (JavaScript XML)
- **Simple Definition**: An HTML-like syntax extension for JavaScript that allows writing markup and logic together.
- **The Technical Defense**: Browsers cannot execute JSX. Vite's SWC compiler compiles `<h1 className="title">{name}</h1>` into `React.createElement("h1", { className: "title" }, name)`. Crucially, JSX automatically escapes all dynamic expressions inside `{}` before rendering to the DOM, providing built-in protection against Cross-Site Scripting (XSS).

### 3. Client-Side Routing (SPA vs MPA)
- **Simple Definition**: Switching views without reloading the page.
- **The Technical Defense**: In a Multi-Page Application (MPA), clicking a link requests a full HTML document from the server. In our Single-Page Application (SPA), the browser intercepts clicks using the HTML5 History API (`window.history.pushState`). The URL in the address bar changes, and React mounts/unmounts components in memory with zero page reloads.

### 4. TanStack (Router & Query)
- **Simple Definition**: A suite of headless, framework-agnostic libraries for routing and data management.
- **The Technical Defense**:
  - **TanStack Router**: Generates a type-safe route tree at build time. Prevents invalid URL links and enforces route authentication guards (`beforeLoad`) before components mount.
  - **TanStack Query (React Query)**: Manages **Server State**. Instead of writing fragile `useEffect` calls, TanStack Query provides caching, background synchronization, automatic deduplication, and optimistic cache mutations.

### 5. Props in React
- **Simple Definition**: Inputs passed from a parent component down to a child component.
- **The Technical Defense**: Props enforce React's unidirectional data flow. Props are strictly read-only (immutable); a child component must never modify its own props. If a child needs to send data upward, the parent passes a callback function prop.

### 6. `useState`
- **Simple Definition**: A React Hook that gives functional components memory.
- **The Technical Defense**: Normal JS variables disappear when a function finishes executing. `useState` persists state across component renders on the React Fiber node. Calling the setter function triggers a scheduled re-render. In React 19, multiple state updates inside the same event are automatically batched into a single render pass.

### 7. `useSyncExternalStore`
- **Simple Definition**: React's official hook for safely subscribing to data sources outside the React state tree.
- **The Technical Defense**: Reading `localStorage` or window events inside `useEffect` causes hydration mismatches and visual "tearing" in Concurrent React (where different components read different values during the same render). `useSyncExternalStore` enforces synchronous snapshot reads. In Skilio, [`useAccountRole.ts`](file:///home/odahriz/Desktop/Skilio/frontend/src/hooks/useAccountRole.ts) uses it to sync role changes across the entire app without a page reload.

---

## 3. High-Probability Evaluator Questions & Model Answers

### Q1: *"Show me how an unauthenticated user is prevented from viewing the Client Dashboard."*
- **Action**: Open [`frontend/src/routes/_layout.tsx`](file:///home/odahriz/Desktop/Skilio/frontend/src/routes/_layout.tsx).
- **Answer**:
  > *"All protected routes sit under `_layout.tsx`. We define a `beforeLoad` hook on this route. Before any component or child route mounts, `beforeLoad` checks `isLoggedIn()`. If no token exists, it throws a router `redirect({ to: '/login' })`. If a token exists, it verifies it against `/api/v1/users/me`. If the backend returns 401 or 403, credentials are wiped from `localStorage` and the user is redirected to `/login`."*

### Q2: *"Why did you use `useCategories()` with React Query instead of fetching in a `useEffect` inside the Landing Page?"*
- **Action**: Open [`frontend/src/hooks/useCategories.ts`](file:///home/odahriz/Desktop/Skilio/frontend/src/hooks/useCategories.ts).
- **Answer**:
  > *"If we used `useEffect`, every component that needs categories (Hero search, Footer specialties, Talent filter) would fire redundant HTTP requests on mount, causing race conditions and layout shifts. With TanStack Query, the query key `['categories']` deduplicates requests across the whole app. We also provide `initialData: () => [...PLATFORM_CATEGORIES]` so the landing page renders immediately without empty blanks while the background cache warms up."*

### Q3: *"What was wrong with the category dropdown scrollbar, and how did you diagnose and fix it?"*
- **Action**: Open [`frontend/src/styles/globals.css`](file:///home/odahriz/Desktop/Skilio/frontend/src/styles/globals.css#L891) and [`frontend/src/components/common/category-select.tsx`](file:///home/odahriz/Desktop/Skilio/frontend/src/components/common/category-select.tsx#L83).
- **Answer**:
  > *"In `globals.css`, a legacy rule had set `* { scrollbar-width: none; }` and `::-webkit-scrollbar { display: none; }`, which globally hid scrollbars across every element in the browser. In `CategorySelect`, users saw only 6 items with no clue that 5 more existed below.  
  > I resolved this with a three-layer UX fix:  
  > 1. Overrode the scrollbar suppression on `CommandList` with an explicit, styled custom scrollbar thumb.  
  > 2. Calibrated container height to `max-h-[268px]` so the 7th item is partially sliced, providing visual cut-off affordance.  
  > 3. Added a dynamic footer showing `11 categories · Scroll for more`."*

### Q4: *"How does the Dual-Role Workspace switch work without reloading the page?"*
- **Action**: Open [`frontend/src/components/sidebar/user.tsx`](file:///home/odahriz/Desktop/Skilio/frontend/src/components/sidebar/user.tsx#L45) and [`frontend/src/hooks/useAccountRole.ts`](file:///home/odahriz/Desktop/Skilio/frontend/src/hooks/useAccountRole.ts).
- **Answer**:
  > *"When the user clicks 'Freelancer' or 'Client', `switchWorkspace()` sends a `POST /api/v1/users/me/switch-role` request. Upon success, it updates `localStorage` and dispatches a custom `freelancer:account-role-changed` window event. `useAccountRole` is subscribed to this event via `useSyncExternalStore`. All navigation bars, sidebars, and route links update immediately in memory, and TanStack Router navigates to `/dashboard` or `/freelancer-dashboard`."*

---

## 4. Live Code Modification Drills (Be Ready to Code!)

Evaluators love saying: *"Change this component right now."* Here is how to handle the most common requests:

### Drill 1: *"Change the max items visible in a list or add a badge"*
- **Scenario**: Evaluator asks to add a "NEW" badge or limit display count in `LandingTalent`.
- **File**: [`frontend/src/components/landing/landing-talent.tsx`](file:///home/odahriz/Desktop/Skilio/frontend/src/components/landing/landing-talent.tsx)
- **Code to modify**:
  ```tsx
  // Change slice count from 3 to 4:
  const DISPLAY_FREELANCERS = freelancers.slice(0, 4)
  ```

### Drill 2: *"Disable a button while an action is pending"*
- **Scenario**: Evaluator asks to prevent double-clicks during request acceptance.
- **File**: [`frontend/src/components/connections/connection-cards.tsx`](file:///home/odahriz/Desktop/Skilio/frontend/src/components/connections/connection-cards.tsx#L207)
- **Code**:
  ```tsx
  <button
    type="button"
    disabled={busy}
    onClick={onAccept}
    className={cn(workspaceStyles.primaryAction, "disabled:opacity-50 disabled:cursor-not-allowed")}
  >
    {busy ? "Accepting..." : "Accept"}
  </button>
  ```

### Drill 3: *"Add an empty state if no search results match"*
- **Scenario**: Evaluator asks to display a message when a filter returns 0 items.
- **Pattern**:
  ```tsx
  {filteredList.length === 0 ? (
    <p className="text-center py-8 text-on-surface-variant text-sm">
      No matching items found.
    </p>
  ) : (
    filteredList.map(...)
  )}
  ```

