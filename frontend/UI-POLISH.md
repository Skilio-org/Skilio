# Frontend polish

This pass uses `design-taste-frontend` and `redesign-existing-projects` from
Leonxlnx/taste-skill, installed project-locally in `frontend/.agents/skills`.
UI/UX Pro Max supplements the dashboard work.

## Design decisions

- Keep the Freelancer logo, Nohemi/Geist typography, cobalt palette, routes,
  and navigation labels. Use expressive type and studio photography on the
  landing page, with denser, functional layouts in the workspaces.
- Landing design dials: variance 6, motion 4, density 3. Dashboard motion is
  limited to interaction feedback. Entry animations honor reduced motion.
- Cards use 12–16 px corners, inputs use 12 px corners, primary actions remain
  pills, and account avatars use rounded squares. Subtle dividers organize
  content; avoid decorative gradients and stacked heavy shadows.
- Device appearance is the default; a previously saved appearance choice wins.
- Landing expertise filters operate on the existing sample directory. Public
  profiles are labeled as samples. Hiring and freelance CTAs preselect the
  corresponding signup role.

## Workspace switching

The account dropdown exposes the current workspace and a direct switch action.
The existing per-email `account-role:` preference stays on this device. The
new external store updates navigation and route guards immediately and follows
storage events from other tabs. A failed storage write keeps the current role.
It does not change backend permissions or create a second account.

## Images

`public/assets/images/landing-studio-v2.webp` is a new image generated with the
built-in Imagegen tool and encoded as WebP for delivery. It is illustrative
photography, not a photograph of an actual marketplace member.

Prompt: "Create a photorealistic editorial website hero photograph, landscape
4:3. A candid independent creative professional, woman late twenties with dark
curly hair wearing a cobalt blue cotton overshirt, working at a large pale desk
in a genuine bright contemporary creative studio. She is absorbed in arranging
printed visual design studies beside a laptop, not looking at camera. Close
medium framing, human detail, natural skin, subtle film grain, directional
daylight from left. White and cool grey interior, cobalt details, greenery in
distant background. Architectural clean composition but lived-in desk with a
notebook and pencil. Sophisticated magazine photography, realistic not glossy
stock. No text, no logos, no watermarks, no UI, no badges. Main person toward
center right, desk visible. Asset for a freelance talent marketplace."

Existing studio and featured-designer PNGs also have optimized WebP siblings.
The original existing assets are preserved.

## Verification

From `frontend`:

```sh
bun test tests/workspace-layout.test.tsx tests/account-role.test.ts
../node_modules/.bin/tsc -p tsconfig.build.json
../node_modules/.bin/vite build --outDir dist
npm run preview -- --host 127.0.0.1 --port 5174 --outDir dist
```

The explicit `--outDir dist` is intentional: the repository's default build
configuration writes into the backend, outside this task's scope.

`tests/ui-polish.browser.cjs` runs against the local production preview with
Playwright. It uses a mocked account API and a disposable browser context;
no backend writes are performed. Set `PLAYWRIGHT_MODULE` and `CHROMIUM_PATH`
only if Playwright and its browser are installed outside the usual locations.
Screenshots and build reports go to ignored `tests/artifacts/`.

Final results: TypeScript and the production build pass; Biome lint passes for
all changed TypeScript files. Eleven unit tests pass. Browser checks cover
landing filters, role-aware signup links, the mobile menu, workspace switching
with keyboard and pointer, refresh persistence, route guards, cross-tab sync,
dark-panel contrast, and responsive layouts at 375/768/1024/1440 px. Talent,
saved, messages, profile, and settings also pass desktop/mobile overflow checks.
The account endpoint is mocked for these browser checks; live backend account
operations were not exercised.

Local Lighthouse mobile run: performance 85, accessibility 100, CLS 0,
10 ms total blocking time. These are local lab measurements, not production
field measurements. Logo and favicon delivery now use appropriately sized
assets, and the hero has responsive image sources and an early preload.

## Messages and freelancer demo workspace

Both account roles now use the same responsive inbox, with role-specific sample
contacts. Conversation drafts stay separate, unread states update, and search,
archiving, the details drawer, and inserting a brief work locally. Message sends
are explicitly previews and reset when the inbox is left or refreshed.

Freelancer jobs are available in normal frontend builds. Saved jobs and proposal
drafts/submitted/archived states persist per account in browser storage. Projects
include milestones, sample contracts, completed work, client-message links, and
local demo deliverable submissions. Earnings include sample transactions, filtering,
CSV export, and a simulated payout (the payout simulation resets on leaving the
screen). The profile editor can load editable sample details into an empty profile.
Account authentication and security continue to use the existing account services.

Typography now reserves Nohemi for workspace page headlines. Geist handles
secondary headings, cards, metrics, navigation, and message content.

Validation: `tests/messages-workspace.browser.cjs` runs against the local preview
with a mocked account endpoint. It covers inbox interactions, independent drafts,
proposal transitions, project submission persistence, CSV download, payout preview,
profile demo persistence, mobile navigation, light/dark screenshots, and viewport
checks at 375/768/1024/1440 px including a 375×450 composer check.

## Talent directory

The directory uses a single page header, an underlined expertise navigation,
compact profile rows, visible rate choices, removable filter chips, and a mobile
filter drawer. Geist handles profile names and supporting UI. Search submissions
update the URL, the shortlist survives filter changes within the directory, and
both profile and message links remain available. The shortlist now shares one
persistent list with Saved talent and the profile view. Sample profiles no longer display
unsupported verification or online indicators. Design filtering excludes generic
system-design skills, and hourly price bands no longer overlap.

Validation: TypeScript, production build, Biome lint, and the focused browser
script `tests/talent.browser.cjs` cover search/reload, specialty and rate filters,
empty states, shortlist, sorting, profile navigation, mobile filtering, and
responsive light/dark rendering at 375/768/1024/1440 px.

## Freelancer profile view

Profiles use a compact introduction, section links, a continuous content panel,
and a single contact panel that is sticky on desktop and precedes the body on
mobile. Selected work opens accessible demo portfolio dialogs. Background and
feedback use the same Geist typography as the directory. Sample verification,
online indicators, stale local clocks, and decorative mock screenshots were
removed. Saving updates the shared Saved talent list; message actions open
the selected person's conversation.

Validation: `tests/talent-profile.browser.cjs` covers all five profiles, section
navigation, saving, portfolio dialog keyboard dismissal, message and directory
links, four responsive widths, and light/dark screenshots. TypeScript, production
build, and scoped Biome lint pass.

## One saved talent list

Saved now has one main list, with no folders, list creation, renaming, or moving
between lists. It renders the exact same FreelancerCard component as Find talent.
The former sample lists are combined into five unique demo profiles. A shared
account-scoped browser store connects directory, profile, and Saved controls,
including refresh persistence and cross-tab updates. Search, sort, removal, and
empty states work on the single list. Storage failures show feedback rather than
reporting a successful save.

Validation: `tests/saved-talent.browser.cjs` covers shared card markup, all three
save surfaces, reload/cross-tab persistence, search/sort, removing every profile,
the persistent empty state, four viewport widths, and dark mode. Build and scoped
lint pass. No backend changes.

Client dashboard recommendations also use FreelancerCard and the shared saved
talent store. They read the same profile data as the directory, so typography,
rate, availability, skills, and profile/message actions stay consistent. The
saved-list browser check also verifies dashboard card parity and save syncing.
