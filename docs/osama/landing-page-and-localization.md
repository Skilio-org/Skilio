# 🇲🇦 Moroccan Marketplace Localization & Landing Page Architecture

---

## 1. 42 Subject Compliance & Justification

In Section **IV.1 Web** and Section **III Mandatory**, the 42 curriculum requires:

> **"A cohesive, high-performance web presentation that represents the platform's domain. Responsive layouts, fast initial load, and accessible typography." (2 Points / Core Subject Compliance)**

| Subject Requirement | Plain English Implementation | Key Engineering Artifact |
| :--- | :--- | :--- |
| **1. Domain Localization (Morocco)** | Moroccan currency (`MAD / DH`), local tech hubs (Casablanca, Rabat, Marrakech, Tangier), and local freelance marketplace terminology. | [`frontend/src/components/landing/landing-testimonials.tsx`](../../frontend/src/components/landing/landing-testimonials.tsx) |
| **2. Modular Component Architecture** | Deconstructed monolithic landing page into 8 specialized, lazy-loadable sub-components with independent layout boundaries. | [`frontend/src/pages/common/landing-page.tsx`](../../frontend/src/pages/common/landing-page.tsx) |
| **3. Auth-Aware Single-Click Navigation** | Smart header detecting user authentication and active workspace role (`client` vs `freelancer`), routing directly to their workspace dashboard. | [`frontend/src/components/landing/landing-header.tsx`](../../frontend/src/components/landing/landing-header.tsx) |
| **4. Dual-Mode Search Hub** | Integrated interactive Hero section allowing users to instantly switch between *"Hire Talent"* and *"Find Work"* with dynamic URL parameter injection. | [`frontend/src/components/landing/landing-hero.tsx`](../../frontend/src/components/landing/landing-hero.tsx) |

---

## 2. Landing Component Hierarchy & User Flow

```text
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                         <LandingHeader /> (Sticky Top)                      │
 │   • Logo  • Anchor Links  • ThemeToggle  • Smart Auth CTA ("Dashboard")    │
 └──────────────────────────────────────┬──────────────────────────────────────┘
                                        │
                                        ▼
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                          <LandingHero /> (Above Fold)                       │
 │   • Centered Moroccan Headline: "Hire skilled Moroccan freelancers."        │
 │   • Interactive Mode Toggle: [ Hire Talent ] vs [ Find Work ]               │
 │   • Search Bar + 11 Dynamic Category Badges (Web Dev, UI/UX, Mobile...)     │
 └──────────────────────────────────────┬──────────────────────────────────────┘
                                        │
                                        ▼
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                     <LandingTalent /> & <LandingContracts />                │
 │   • Moroccan Specialist Cards (Casablanca, Rabat, Tangier)                  │
 │   • Transparent Dirham Hourly Rates (DH/hr) & Verified Star Ratings         │
 │   • Live Moroccan Contracts Feed (Escrow Milestones, Delivery Timelines)    │
 └──────────────────────────────────────┬──────────────────────────────────────┘
                                        │
                                        ▼
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                 <LandingTestimonials /> & <LandingFooter />                 │
 │   • Moroccan Founders (Casablanca Logistics, Atlas E-Com Marrakech)         │
 │   • Complete Dynamic Category Taxonomy                                      │
 └─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Deep Technical Implementation

### 3.1 Auth-Aware Smart Navigation
In [`frontend/src/components/landing/landing-header.tsx`](file:///home/odahriz/Desktop/Skilio/frontend/src/components/landing/landing-header.tsx#L21-L70):
```tsx
const { user } = useAuth()
const role = useAccountRole()
const dashboardPath = role === "freelancer" ? "/freelancer-dashboard" : "/dashboard"

return (
  <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md transition-colors">
    {/* ... */}
    <div className="flex items-center gap-2 sm:gap-3.5">
      <ThemeToggle />
      {!user ? (
        <>
          <Link to="/login" className="hidden sm:inline-flex min-h-10 items-center px-3 font-medium text-sm">
            Log in
          </Link>
          <Link to="/signup" className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-xs font-medium">
            Join Skilio
          </Link>
        </>
      ) : (
        <Link
          to={dashboardPath}
          className="inline-flex h-9 items-center justify-center rounded-lg bg-primary px-4 text-xs font-medium"
        >
          Dashboard
        </Link>
      )}
    </div>
  </header>
)
```
**Why this improves UX:** Returning users landing on the homepage are not forced to see redundant "Join Skilio" or "Log In" CTAs, nor are they interrupted by complex multi-tier dropdown menus. Clicking **"Dashboard"** takes them directly into their current workspace view in a single click.

### 3.2 Dual-Mode Search & Dynamic Filtering
In [`frontend/src/components/landing/landing-hero.tsx`](file:///home/odahriz/Desktop/Skilio/frontend/src/components/landing/landing-hero.tsx#L15-L32):
```tsx
const handleSearch = (e: FormEvent) => {
  e.preventDefault()
  if (roleMode === "hire") {
    navigate({
      to: "/talent",
      search: { q: searchQuery.trim() || undefined },
    })
  } else {
    navigate({
      to: "/freelancer-jobs",
      search: { q: searchQuery.trim() || undefined },
    })
  }
}
```
Depending on whether the visitor wants to hire talent or find freelance work, the form seamlessly dispatches to the corresponding directory with pre-populated URL search parameters.

---

## 4. Engineering Edge Cases & Solutions

### 1. Eliminating Category Slicing Inconsistencies
- *Problem:* The legacy landing page hardcoded `.slice(0, 7)` on category lists. When backend developers added new Moroccan business categories (e.g. *Accounting & Bookkeeping*), they failed to appear on the homepage.
- *Solution:* Replaced hardcoded slices with reactive TanStack Query feeds backed by `PLATFORM_CATEGORIES` fallback constants, ensuring full catalog synchronization.

### 2. Layout Shift with Backdrop Blurring
- *Problem:* Applying high blur on the sticky navigation header caused Cumulative Layout Shift (CLS) on mobile browsers when scrolling past the hero video/banner.
- *Solution:* Fixed the header height to exact pixel values (`h-[70px] sm:h-[74px]`) and used `contain: layout` style properties to prevent reflows.

---

## 5. Live 42 Evaluation Defense Walkthrough

### How to Demonstrate to Evaluators (3 Minutes):
1. **Show Moroccan Domain Localization:**
   - Scroll down to **"Stories"** on the landing page.
   - Point out authentic Moroccan client testimonials (Casablanca Logistics, Atlas E-Com Marrakech) and Dirham pricing displays (`DH/hr`).
2. **Demonstrate Interactive Search Navigation:**
   - Select **"Hire Talent"**, type `"React"`, and press Enter. Show that it navigates to `/talent?q=React`.
   - Go back, toggle to **"Find Work"**, type `"Python"`, and press Enter. Show that it navigates to `/freelancer-jobs?q=Python`.
3. **Demonstrate Auth-Aware Single-Click Routing:**
   - Log into an account.
   - Click the Skilio logo to return to the landing page.
   - Point out the header: the "Log in" / "Sign up" buttons are replaced by a single **"Dashboard"** button.
   - Click it and verify instant navigation to `/dashboard` or `/freelancer-dashboard`.
