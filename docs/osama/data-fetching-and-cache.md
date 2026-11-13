# ⚡ Server-State Management & Caching Architecture (TanStack Query)

---

## 1. 42 Subject Compliance & Justification

In Section **IV.1 Web**, the 42 curriculum requires:

> **"Major: Use a framework for the frontend. Implement clean data flow, efficient network requests, and proper state management." (2 Points)**

| Subject Requirement | Plain English Implementation | Key Engineering Artifact |
| :--- | :--- | :--- |
| **1. Server-State Caching Engine** | **TanStack Query v5.101** managing network caching, automatic deduplication, and background synchronization without manual global state stores. | [`frontend/package.json`](../../frontend/package.json) |
| **2. Centralized Query Keys Directory** | Standardized cache key hierarchy in [`query-keys.ts`](../../frontend/src/lib/query-keys.ts) preventing key drift and enabling granular sub-tree cache invalidations. | [`frontend/src/lib/query-keys.ts`](../../frontend/src/lib/query-keys.ts) |
| **3. Type-Safe API Client Integration** | OpenAPI TypeScript client generated via `@hey-api/openapi-ts` ensuring end-to-end type safety between FastAPI schemas and React components. | [`frontend/src/client/`](../../frontend/src/client/) |
| **4. Declarative Mutations & Optimistic Sync** | `useMutation` pipelines with `onSuccess` invalidation patterns, optimistic rollbacks, and structured error reporting with Sonner toasts. | [`frontend/src/hooks/useAuth.ts`](../../frontend/src/hooks/useAuth.ts) |

---

## 2. Server-State Lifecycle & Invalidation Hierarchy

```text
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                         COMPONENT DATA LIFECYCLE                            │
 └──────────────────────────────────────┬──────────────────────────────────────┘
                                        │
                                        ▼
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                  useQuery({ queryKey: queryKeys.currentUser })              │
 │                                                                             │
 │  1. In-Memory Cache Lookup:                                                 │
 │     ├─ Data in cache and fresh? (age < staleTime) ──▶ Return cached snapshot │
 │     └─ Data stale or missing?                                               │
 │            ▼                                                                │
 │  2. Network Fetch via UsersService.readUserMe()                             │
 │     ├─ Request In-Flight elsewhere? ──▶ Deduplicate (Share single promise)   │
 │     └─ New Request ──▶ Stream HTTP GET /api/v1/users/me                     │
 │            ▼                                                                │
 │  3. Store result in TanStack Query Cache (5 min TTL)                        │
 └──────────────────────────────────────┬──────────────────────────────────────┘
                                        │
                         [ USER PERFORMS MUTATION ]
                        e.g., Accepting a Connection
                                        │
                                        ▼
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │           useMutation({ mutationFn: acceptConnectionRequest })              │
 │                                                                             │
 │  1. Execute POST /api/v1/connections/{id}/accept                            │
 │  2. onSuccess Callback Triggered:                                           │
 │     ┌──────────────────────────────────────────────────────────────────┐    │
 │     │ queryClient.invalidateQueries({ queryKey: ["connections"] })     │    │
 │     └────────────────────────────────┬─────────────────────────────────┘    │
 │                                      ▼                                      │
 │  3. Automatic Background Re-Fetch of Affected Queries                       │
 │  4. All subscribed components re-render with fresh data silently            │
 └─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Deep Technical Implementation

### 3.1 Centralized Query Keys Dictionary
In [`frontend/src/lib/query-keys.ts`](file:///home/odahriz/Desktop/Skilio/frontend/src/lib/query-keys.ts#L1-L24):
```ts
// Every TanStack Query key in one place, so a query and the code that invalidates it can't drift apart.
export const queryKeys = {
  currentUser: ["currentUser"] as const,
  categories: ["categories"] as const,
  recentSearches: ["recentSearch"] as const,
  systemHealth: ["system-health"] as const,

  clientProfile: ["clientProfile"] as const,
  clientJobs: ["client-jobs"] as const,
  clientJobsActiveCount: ["client-jobs", "active-count"] as const,
  clientJobProposals: (jobId: string) => ["client-job-proposals", jobId] as const,

  freelancerProfile: (userId: string | undefined) => ["freelancer-profile", userId] as const,
  freelancerAvailability: (userId: string | undefined) => ["freelancer-availability", userId] as const,
  freelancerProposals: ["freelancer-proposals"] as const,
  freelancerJobs: ["freelancer-jobs"] as const,
  savedJobs: ["saved-jobs"] as const,

  talentProfiles: ["talent-profiles"] as const,
  talentProfile: ["talent-profile"] as const,
  savedTalent: ["saved-talent"] as const,
}
```
**Why Factory Functions Matter:** Using `(jobId: string) => ["client-job-proposals", jobId]` guarantees type-safe param injection and allows invalidating either one specific job's proposals or *all* proposals at once by invalidating the prefix `["client-job-proposals"]`.

### 3.2 Cache Configuration & Stale-While-Revalidate
In [`frontend/src/hooks/useAuth.ts`](file:///home/odahriz/Desktop/Skilio/frontend/src/hooks/useAuth.ts#L29-L41):
```tsx
const {
  data: user,
  isPending,
  isFetching,
  error,
  refetch,
} = useQuery<UserMe | null, Error>({
  queryKey: currentUserQueryKey,
  queryFn: fetchCurrentUser,
  enabled: isLoggedIn(),
  retry: false,
  staleTime: 5 * 60 * 1000, // Fresh for 5 minutes
})
```
- `enabled: isLoggedIn()`: Prevents issuing unauthenticated API requests when no token exists.
- `retry: false`: Avoids noisy 3x retry loops when encountering 401 Unauthorized errors.
- `staleTime: 5 * 60 * 1000`: Eliminates redundant network traffic on repeated page transitions.

---

## 4. Engineering Edge Cases & Solutions

### 1. Eliminating Request Thundering Herd
- *Problem:* When loading the dashboard, four different components (Sidebar, TopNav, WelcomeHeader, UserDropdown) all requested `currentUser` simultaneously, generating 4 parallel HTTP GET requests to the backend.
- *Solution:* TanStack Query's automated request deduplication traps identical query keys in-flight and binds all 4 components to a single shared HTTP promise.

### 2. Cache Invalidation upon Workspace Switch
- *Problem:* Switching from Client to Freelancer left the cache populated with Client jobs, occasionally causing layout mismatches before data reloaded.
- *Solution:* In `useAccountRole`, `queryClient.setQueryData(["currentUser"], response.data)` updates the active user immediately, triggering automatic reactive refetches across dependent queries.

---

## 5. Live 42 Evaluation Defense Walkthrough

### How to Demonstrate to Evaluators (3 Minutes):
1. **Demonstrate Request Deduplication:**
   - Open Chrome DevTools Network Tab and filter by `Fetch/XHR`.
   - Reload the dashboard.
   - Point out that despite 4 separate UI components requesting the current user profile, exactly **one** `/api/v1/users/me` network request was made.
2. **Demonstrate Instant Cache Return (Zero-Latency Navigation):**
   - Click from `/dashboard` to `/talent` and back to `/dashboard`.
   - Show how the dashboard appears instantaneously with 0ms loading skeleton because data is served directly from the TanStack Query cache.
3. **Demonstrate Mutation Invalidation:**
   - Post a job or withdraw a proposal.
   - Show in the Network tab how the `POST` request is immediately followed by a single background `GET` request refreshing only the relevant list.
