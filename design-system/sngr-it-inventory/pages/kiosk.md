# Page Override: Kiosk (front-desk iPad)

> Overrides `MASTER.md` for `app/kiosk/**`. Everything not listed here inherits the Master (same color tokens, same fonts).

## Why this page is different

The kiosk is not used by IT staff at a desk — it's a shared iPad at the front desk, used by whoever is dropping equipment off (often an assistant, HR, or a courier, not the equipment's owner). No login friction, no density, no assumed familiarity with the tool. Every design call here optimizes for "a stranger can walk up and use this correctly on the first try, with a finger, standing up."

## Sizing

- **Touch targets**: minimum 44×44px, no exceptions — this applies to checkboxes' clickable area (not just the visible box), buttons, and combobox triggers.
- **Body text**: 16px minimum; form labels and input text should read comfortably from a slight distance/angle, not just up close.
- **Primary action** ("Log this visit"): the single largest, highest-contrast control on the screen — it's the one thing a first-time user needs to find without hunting.
- **Gaps between adjacent controls**: `gap-3` (12px) minimum, more for anything stacked vertically in a form.

## Layout

- Full-screen, **no dashboard chrome** — no sidebar, no breadcrumbs, no nav. This is a single-purpose terminal, not an admin surface. (`app/kiosk/intake/page.tsx` intentionally sits outside the `(dashboard)` route group for this reason.)
- Single column, generous vertical rhythm — this is read top-to-bottom like a paper form, not scanned like a dashboard.
- Sticky submit bar at the bottom (already implemented) so the primary action is always reachable without scrolling back up.

## Signature canvas

- White background regardless of light/dark mode (a signature should look like ink on paper, not adapt to theme) — already implemented this way.
- The "Clear" affordance must be clearly separated from the signing area itself so an accidental tap near the edge doesn't wipe a signature.

## What stays the same as Master

- Color tokens (primary indigo, success/warning/destructive status colors)
- Geist Sans for UI text, Geist Mono for serial numbers / ticket numbers
- Icon set (lucide-react)
- Transition timing, focus visibility, contrast rules
