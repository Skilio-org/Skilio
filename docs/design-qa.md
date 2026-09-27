# Job details drawer QA

Updated September 20, 2026.

## Design

Used the supplied Upwork drawer screenshots as a structural reference: compact top bar, project content on the left, actions and client information on the right. Retained the app's typography, navy/light and charcoal/dark colors, rectangular skill tags, and existing dashboard cards. No client ratings, verification claims, or activity statistics were invented.

## Verification

- Inspected desktop light and dark layouts at 1280 × 720 and mobile at 390 × 844.
- Compared desktop output with the supplied reference. This adapts its hierarchy to the existing application rather than copying Upwork branding.
- Fixed a heading style collision discovered during visual review; the project title now renders at 24px.
- Mobile stacks content and actions with no horizontal overflow.
- Verified View details opens the drawer, Back closes it, Save job toggles on and off, Apply now opens the form, and Cancel closes the form.
- Verified card Apply now opens the form directly and the price field receives focus.
- Production build and git diff whitespace check pass.

Screenshots: `/tmp/drawer-redesign/light.png`, `/tmp/drawer-redesign/dark.png`, `/tmp/drawer-redesign/mobile.png`.

## Limits

Proposal drafts and saved jobs use existing browser-local workspace storage. No proposal was submitted during testing. Draft persistence across the full proposals workflow was not tested. The card's pre-existing bookmark state is separate from the drawer's saved-job storage. The preview environment prefers reduced motion, so transition animation was not visually assessed.
