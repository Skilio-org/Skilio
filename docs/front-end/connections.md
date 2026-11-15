# 🤝 Connections & Professional Network Architecture (`/connects`)

---

## 1. 42 Subject Compliance & Justification

In Section **IV.1 Web**, **IV.2 User Management**, and Section **III Mandatory**, the 42 curriculum requires:

> **"A clean, responsive user management and relationship system. Users must be able to establish connections, review requests, and interact smoothly on both desktop and mobile viewports." (2 Points / Core Subject Compliance)**

| Subject Requirement | Plain English Implementation | Key Engineering Artifact |
| :--- | :--- | :--- |
| **1. Professional Relationship Engine** | Full lifecycle connection management: browse accepted partnerships, evaluate incoming requests, and track pending outgoing proposals. | [`frontend/src/pages/common/connects-page.tsx`](../../frontend/src/pages/common/connects-page.tsx) |
| **2. Mobile-First Responsive Ergonomics** | Viewport-calibrated layout with edge-to-edge tab scrolling, minimum 44px touch targets (`h-9`), and 50/50 split mobile action rows. | [`frontend/src/components/connections/connection-cards.tsx`](../../frontend/src/components/connections/connection-cards.tsx) |
| **3. Declarative Cache Invalidation** | TanStack Query mutation hooks (`useAcceptConnectionRequest`, `useDeclineConnectionRequest`) automatically invalidating `["connections"]` query keys. | [`frontend/src/hooks/useConnections.ts`](../../frontend/src/hooks/useConnections.ts) |
| **4. Real-Time Client-Side Filtering** | High-performance sub-string search filter parsing partner full names, attached job postings, and personal invitation notes in real time. | [`frontend/src/pages/common/connects-page.tsx`](../../frontend/src/pages/common/connects-page.tsx) |

---

## 2. Connections Lifecycle & State Machine

```text
               ┌────────────────────────────────────────────────────────┐
               │              CLIENT / FREELANCER ACTIONS               │
               │           Sends collaboration connection request       │
               └───────────────────────────┬────────────────────────────┘
                                           │
                                           ▼
 ┌───────────────────────────────────────────────────────────────────────────────────┐
 │                               STATUS: "pending"                                   │
 │                                                                                   │
 │   ┌─────────────────────────────────────┐   ┌─────────────────────────────────┐   │
 │   │         Sender's Workspace          │   │       Receiver's Workspace      │   │
 │   │        "Sent Inquiries" Tab         │   │     "Received Requests" Tab     │   │
 │   │  • Displays <SentRequestCard />     │   │  • Displays <ReceivedRequestCard />│
 │   │  • Action: [ Withdraw Request ]     │   │  • Actions: [ Decline ] [ Accept ] │
 │   └──────────────────┬──────────────────┘   └────────────────┬────────────────┘   │
 └──────────────────────┼───────────────────────────────────────┼────────────────────┘
                        │                                       │
            (Sender Withdraws or Receiver Declines)   (Receiver Accepts)
                        │                                       │
                        ▼                                       ▼
 ┌─────────────────────────────────────────┐   ┌─────────────────────────────────────┐
 │            STATUS: "declined"           │   │          STATUS: "accepted"         │
 │   • Record soft-deleted / pruned        │   │                                     │
 │   • Query cache automatically evicted   │   │  • Moved to "My connections" Tab    │
 │   • Toast notification displayed        │   │  • Unlocks 1-on-1 Direct Chat       │
 └─────────────────────────────────────────┘   │  • Displays <ConnectionCard />      │
                                               │  • Actions: [ Message ] [ Remove ]  │
                                               └─────────────────────────────────────┘
```

---

## 3. Deep Technical Implementation

### 3.1 Mobile Ergonomics & Edge-to-Edge Navigation
In [`frontend/src/pages/common/connects-page.tsx`](file:///home/odahriz/Desktop/Skilio/frontend/src/pages/common/connects-page.tsx#L103-L115):
```tsx
<nav 
  aria-label="Connection tabs" 
  className="-mx-4 flex gap-3 overflow-x-auto border-outline-variant border-b px-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:gap-6 sm:px-0"
>
  {tabs.map((t) => (
    <button
      key={t.id}
      type="button"
      onClick={() => setActiveTab(t.id)}
      aria-pressed={activeTab === t.id}
      className={`min-h-11 shrink-0 border-b-2 px-1 font-medium text-sm transition-colors whitespace-nowrap sm:min-h-12 ${
        activeTab === t.id ? "border-primary text-link" : "border-transparent text-on-surface-variant hover:text-on-surface"
      }`}
    >
      {t.label} <span className="ml-1 text-xs">{t.count}</span>
    </button>
  ))}
</nav>
```
- **Bleeding Viewport Margins (`-mx-4 px-4`):** On mobile devices ($<640\text{px}$), screen containers have horizontal padding. Applying negative margins allows the horizontal tabs to touch the absolute screen edge, creating an intuitive edge-to-edge swipe gesture without ugly scrollbars.
- **Minimum 44px Touch Targets (`min-h-11 sm:min-h-12`):** Complies with mobile accessibility guidelines to prevent mis-clicks.

### 3.2 Responsive Dual Action Bar in `ReceivedRequestCard`
In [`frontend/src/components/connections/connection-cards.tsx`](file:///home/odahriz/Desktop/Skilio/frontend/src/components/connections/connection-cards.tsx#L194-L220):
```tsx
<div className="flex w-full shrink-0 items-center gap-2 pt-2.5 border-t border-outline-variant/50 sm:w-auto sm:border-t-0 sm:pt-0 sm:self-center">
  <button
    type="button"
    disabled={busy}
    onClick={onDecline}
    className={cn(
      workspaceStyles.secondaryAction,
      "flex-1 sm:flex-initial h-9 sm:h-8 justify-center px-3.5 text-destructive text-xs hover:border-destructive/30 hover:bg-destructive/10 disabled:opacity-50",
    )}
  >
    <X className="size-3.5" />
    <span>Decline</span>
  </button>
  <button
    type="button"
    disabled={busy}
    onClick={onAccept}
    className={cn(
      workspaceStyles.primaryAction,
      "flex-1 sm:flex-initial h-9 sm:h-8 justify-center px-4 text-xs disabled:opacity-50",
    )}
  >
    <Check className="size-3.5" />
    <span>Accept</span>
  </button>
</div>
```
- **Mobile Mode ($<640\text{px}$):** The buttons expand symmetrically using `flex-1` into an anchored 50/50 bottom action row separated by a subtle top border (`border-t`).
- **Desktop Mode ($\ge 640\text{px}$):** Automatically shifts using `sm:w-auto sm:border-t-0` into an inline right-aligned button group.

### 3.3 Multi-Field Real-Time Search Filtering
In [`frontend/src/pages/common/connects-page.tsx`](file:///home/odahriz/Desktop/Skilio/frontend/src/pages/common/connects-page.tsx#L23-L27):
```tsx
function matchesSearch(search: string, name: string | null | undefined, connection: ConnectionPublic) {
  const text = `${name || MEMBER_FALLBACK} ${connection.job_post?.title ?? ""} ${connection.note ?? ""}`
  return text.toLowerCase().includes(search.toLowerCase())
}
```
Users can filter through dozens of connections not only by the person's name, but also by the referenced job title or the personal message included in the initial request.

---

## 4. Engineering Edge Cases & Solutions

### 1. Card Padding Compression on 360px Viewports
- *Problem:* Previous fixed `p-5` (20px) padding consumed 40px of total width, squeezing user profile cards and forcing names and roles onto 3 vertical lines on standard Android devices.
- *Solution:* Calibrated padding to `p-4 sm:p-5`, immediately recovering 16px of horizontal space and preserving single-line typography.

### 2. Double-Click Mutation Race Conditions
- *Problem:* Rapid double-clicking on the "Accept" button triggered two simultaneous HTTP requests to the backend, resulting in a 409 Conflict error on the second call.
- *Solution:* Bound buttons to mutation loading states (`disabled={busy}`), disabling pointer events immediately upon first dispatch.

---

## 5. Live 42 Evaluation Defense Walkthrough

### How to Demonstrate to Evaluators (3 Minutes):
1. **Demonstrate Mobile Viewport Ergonomics:**
   - Open Chrome DevTools (`F12`), toggle Device Mode (`Ctrl+Shift+M`), and select **iPhone SE (375px)**.
   - Navigate to `/connects`.
   - Show how the tabs scroll smoothly edge-to-edge without scrollbars.
2. **Demonstrate Request Processing:**
   - Click the **"Received requests"** tab.
   - Point out the 50/50 responsive action row.
   - Click **"Accept"**. Show the Sonner toast notification, the instantaneous removal of the request, and its immediate appearance under **"My connections"**.
3. **Demonstrate Search Filtering:**
   - Type a keyword into the filter input.
   - Show how the list updates in real time and how clicking the "Clear filter" button restores the full list.
