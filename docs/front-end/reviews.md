# ⭐ Reviews & Ratings Engine Architecture

---

## 1. 42 Subject Compliance & Justification

In Section **IV.1 Web**, **IV.2 User Management**, and Section **IV.10 Minor**, the 42 curriculum requires:

> **"A complete feedback and rating system. Clients must be able to review freelancers, rate performance, and browse community testimonials with proper permission controls." (Rating & Review System)**

| Subject Requirement | Plain English Implementation | Key Engineering Artifact |
| :--- | :--- | :--- |
| **1. Dynamic Rating Engine** | Real-time calculation of overall score (`averageRating`), total review count, and 1-to-5 star percentage distributions. | [`frontend/src/hooks/useFreelancerReviews.ts`](../../frontend/src/hooks/useFreelancerReviews.ts) |
| **2. Interactive Review UI & Filters** | Modular reviews component with interactive star-rating filters (5, 4, 3, 2, 1 stars) and sorting options (Newest, Highest, Lowest). | [`frontend/src/components/reviews/freelancer-reviews-section.tsx`](../../frontend/src/components/reviews/freelancer-reviews-section.tsx) |
| **3. Strict Role-Based Review Permissions** | Multi-tier authorization logic (`canCreateReview`) preventing freelancers from reviewing themselves or submitting duplicate reviews. | [`frontend/src/hooks/useFreelancerReviews.ts`](../../frontend/src/hooks/useFreelancerReviews.ts) |
| **4. Full Review CRUD Operations** | Modal forms for creating reviews, inline editing of existing reviews, and destructive confirmation modals with automated cache invalidation. | [`frontend/src/components/reviews/review-modal.tsx`](../../frontend/src/components/reviews/review-modal.tsx) • [`review-delete-dialog.tsx`](../../frontend/src/components/reviews/review-delete-dialog.tsx) |

---

## 2. Review Engine Architecture & Dataflow

```text
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                         FREELANCER PROFILE PAGE                             │
 │                <FreelancerReviewsSection freelancerId={id} />               │
 └──────────────────────────────────────┬──────────────────────────────────────┘
                                        │
                                        ▼
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                 useFreelancerReviews(freelancerId, userId)                  │
 │                                                                             │
 │  1. TanStack Query: GET /api/v1/reviews/freelancers/{id}                    │
 │  2. Analytical Computations:                                                │
 │     • averageRating = sum(ratings) / totalCount                             │
 │     • distributionPercent = { 5: 75%, 4: 20%, 3: 5%, 2: 0%, 1: 0% }         │
 │  3. Permission Engine Checks:                                               │
 │     • Is user logged in?                                                    │
 │     • Is active_role == "client"?                                           │
 │     • Is user.id != profileUserId? (Cannot review self)                     │
 │     • Has client already reviewed? (!myReview)                              │
 │     └─▶ canCreateReview = true / false                                      │
 └──────────────────────────────────────┬──────────────────────────────────────┘
                                        │
                        ┌───────────────┴───────────────┐
                        │                               │
                        ▼ (Visitor / Freelancer)        ▼ (Authorized Client)
             ┌─────────────────────┐         ┌─────────────────────────────┐
             │ Read-Only Showcase  │         │ Full CRUD Controls:         │
             │ • Star Distribution │         │ • [ + Write a Review ]      │
             │ • Star Filter Bars  │         │ • [ Edit My Review ]        │
             │ • Sorted Card List  │         │ • [ Delete My Review ]      │
             └─────────────────────┘         └──────────────┬──────────────┘
                                                            │
                                             (Client Submits / Edits / Deletes)
                                                            │
                                                            ▼
                                             ┌─────────────────────────────┐
                                             │ invalidateReviewQueries()   │
                                             │ • Evicts "reviews" key      │
                                             │ • Evicts "talent-profile"   │
                                             │ • Profile re-renders fresh  │
                                             └─────────────────────────────┘
```

---

## 3. Deep Technical Implementation

### 3.1 Permission Rules & Computed Metrics
In [`frontend/src/hooks/useFreelancerReviews.ts`](file:///home/odahriz/Desktop/Skilio/frontend/src/hooks/useFreelancerReviews.ts#L34-L54):
```tsx
const reviews: ReviewPublic[] = reviewsQuery.data?.data ?? []
const totalCount: number = reviewsQuery.data?.count ?? reviews.length

// Calculate overall average rating (e.g. 4.9)
const totalRatingSum = reviews.reduce((sum, r) => sum + r.rating, 0)
const averageRating = totalCount > 0 ? Number((totalRatingSum / totalCount).toFixed(1)) : 0

// Compute distribution percentages for each star tier
const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
for (const r of reviews) {
  const star = Math.min(5, Math.max(1, Math.round(r.rating)))
  distribution[star] = (distribution[star] || 0) + 1
}

const distributionPercent: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
if (totalCount > 0) {
  for (let s = 1; s <= 5; s++) {
    distributionPercent[s] = Math.round((distribution[s] / totalCount) * 100)
  }
}

// Strict Client-Side Authorization
const myReview = user ? reviews.find((r) => r.client_id === user.id) : undefined
const isClientRole = user?.active_role === "client" || Boolean(user?.is_superuser)
const isOwnProfile = Boolean(user && profileUserId && user.id === profileUserId)
const canCreateReview = Boolean(user && isClientRole && !isOwnProfile && !myReview)
```
**Why this is robust:**
- **Zero Self-Reviews:** `!isOwnProfile` ensures freelancers cannot boost their own rating score.
- **Single-Review Idempotency:** `!myReview` prevents spamming; once a client leaves a review, the button transitions from "Write a Review" to "Edit My Review".
- **Role Enforcement:** `isClientRole` prevents accounts currently in Freelancer workspace mode from submitting reviews without switching contexts.

### 3.2 Granular Cache Invalidation Pipeline
In [`frontend/src/hooks/useFreelancerReviews.ts`](file:///home/odahriz/Desktop/Skilio/frontend/src/hooks/useFreelancerReviews.ts#L55-L64):
```tsx
const invalidateReviewQueries = async () => {
  if (freelancerId) {
    // 1. Invalidate review list query
    await queryClient.invalidateQueries({ queryKey: reviewKeys.freelancer(freelancerId) })
    
    // 2. Invalidate parent talent profile to update rating badges in directory
    if (profileUserId) {
      await queryClient.invalidateQueries({ queryKey: [...queryKeys.talentProfile, profileUserId] })
    }
    await queryClient.invalidateQueries({ queryKey: [...queryKeys.talentProfile, freelancerId] })
  }
}
```
Whenever a review is created, edited, or removed, the query client does not only refresh the reviews section—it also invalidates the parent profile record so the overall rating badge displayed in the page hero and talent directory immediately updates.

### 3.3 Interactive Star Rating Component
In [`frontend/src/components/reviews/review-stars.tsx`](file:///home/odahriz/Desktop/Skilio/frontend/src/components/reviews/review-stars.tsx):
- Renders fractional and half-star displays.
- Fully accessible with `aria-label={`${rating} out of 5 stars`}`.
- Supports interactive input mode (with hover effects and click selection) inside [`ReviewModal`](file:///home/odahriz/Desktop/Skilio/frontend/src/components/reviews/review-modal.tsx).

---

## 4. Engineering Edge Cases & Solutions

### 1. Rating Drift on Zero Reviews
- *Problem:* When a newly registered freelancer has 0 reviews, calculating `totalRatingSum / totalCount` resulted in `0 / 0 = NaN`, breaking React numerical rendering.
- *Solution:* Guarded with `totalCount > 0 ? Number(...) : 0`, ensuring a safe numerical fallback.

### 2. Deletion Confirmation & Safe UX
- *Problem:* Accidental clicks on a delete button could wipe out a client's detailed testimonial.
- *Solution:* Implemented [`ReviewDeleteDialog`](file:///home/odahriz/Desktop/Skilio/frontend/src/components/reviews/review-delete-dialog.tsx) as an alert dialog requiring explicit confirmation before invoking `deleteReview`.

---

## 5. Live 42 Evaluation Defense Walkthrough

### How to Demonstrate to Evaluators (3 Minutes):
1. **Show Rating Distribution & Star Filters:**
   - Navigate to any freelancer's profile in the Talent directory (e.g. `/talent`).
   - Scroll down to the **"Client Reviews & Ratings"** section.
   - Point out the average rating score, total count, and visual percentage distribution bars.
   - Click on the **"5 stars"** bar: show how the list dynamically filters to only show 5-star reviews.
2. **Demonstrate Role Security:**
   - Switch your workspace to **Freelancer**.
   - Show how the "Write a Review" button is replaced with an informative prompt: *"Switch to Client workspace to leave a review"*.
3. **Demonstrate Full CRUD Workflow:**
   - Switch back to **Client** workspace.
   - Click **"Write a review"**, select 5 stars, write a comment, and submit.
   - Show the toast notification and immediate appearance of the review at the top of the list.
   - Click the options menu on your review, select **"Edit"**, update the rating, and confirm.
   - Finally, select **"Delete"** and confirm in the alert dialog to clean up.
