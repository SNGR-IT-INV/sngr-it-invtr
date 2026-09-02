# Design System Master File

> **LOGIC:** When building a specific page/surface, first check `design-system/sngr-it-inventory/pages/[name].md`.
> If that file exists, its rules **override** this Master file. Otherwise, follow the rules below.
>
> Generated via `ui-ux-pro-max`, then adapted by hand to fit what's already in this codebase
> (Geist fonts, shadcn neutral base, `@base-ui/react` primitives) rather than accepted raw —
> see notes inline for what changed and why.

---

**Project:** SNGR IT Inventory
**Category:** Internal operational tool — admin dashboard + a front-desk touch kiosk (two different density profiles, one shared token system)

---

## Style

**Data-Dense Dashboard** for the admin surface — data tables, status badges, minimal padding, space-efficient. This is an internal ops tool for IT staff, not a marketing surface — skip the "hero / CTA / gateway" landing-page patterns the raw tool output suggested; they don't apply here.

## Typography

**Kept as-is: Geist Sans + Geist Mono** (already wired in `app/layout.tsx` via `next/font/google`, exposed as `--font-geist-sans` / `--font-geist-mono`). The tool's raw suggestion was Fira Code + Fira Sans for the "dashboard/data" mood — same mono-for-data-sans-for-labels philosophy, but there's no reason to add a second font family when Geist already covers it and is already loaded.

- **UI text** (labels, nav, body): Geist Sans — already the default (`font-sans` on `html`).
- **Technical/identifying values** (serial numbers, ticket numbers, asset IDs): Geist Mono — apply `font-mono` explicitly wherever these values render, in both the dashboard and the kiosk. This is the one typographic signal worth being consistent about: mono means "this is an identifier, not prose."

## Color Palette

Kept shadcn's existing neutral grayscale base (`app/globals.css`) — it's already WCAG-safe and fits a data-dense internal tool. Added one accent (indigo, close to the tool's own recommendation) plus semantic status colors, since equipment/staff status badges are a recurring UI need across both surfaces.

| Role | Token | Light (oklch) | Use |
|---|---|---|---|
| Primary / accent | `--primary` | `oklch(0.511 0.262 276.966)` (indigo-600) | Primary buttons, links, active nav item, focus rings |
| Success | `--success` | `oklch(0.696 0.17 162.48)` (emerald-500) | `in_storage`, `active` status |
| Warning | `--warning` | `oklch(0.769 0.188 70.08)` (amber-500) | `awaiting_repair`, `on_leave` status |
| Destructive | `--destructive` | *(unchanged — already existed)* | `retired`, `resigned`, delete actions |
| Everything else | *(unchanged neutral scale)* | — | backgrounds, borders, muted text, cards |

Dark mode: lighten each by roughly one step (`oklch(0.585 0.233 277.117)` indigo-500 for primary, etc.) to keep contrast — see `app/globals.css` for the actual `.dark` block values once applied.

**Status → color mapping** (use consistently anywhere equipment/staff status renders as a badge):

| Status | Color |
|---|---|
| `in_storage` / `active` | success |
| `handed_out` | primary (it's "in play", not a problem state) |
| `awaiting_repair` / `on_leave` | warning |
| `retired` / `resigned` | destructive (muted/outline variant, not solid — these are inactive, not alarming) |

## Density — two profiles, one token system

This is the one place the dashboard and the kiosk deliberately diverge, and that's intentional, not an inconsistency:

- **Dashboard**: data-dense. Compact table rows, `sm`-size inputs/buttons where available, tight padding (`p-3`/`p-4`), small icons (16px). Built for IT staff who use it repeatedly and want to see as much as possible at once.
- **Kiosk**: spacious, touch-first. This is a walk-up iPad used by a rotating cast of people (assistants, HR, couriers) who are not IT staff and aren't logging in with any expectation of density. Minimum 44×44px touch targets (already a hard UX rule, not just a style preference — see `pages/kiosk.md`), generous gaps (`gap-3`+ between adjacent controls), base text no smaller than 16px, primary submit action large and unambiguous.

Full kiosk-specific sizing rules: `design-system/sngr-it-inventory/pages/kiosk.md`.

## Icons

`@iconify/react`, Tabler set (`tabler:*`) — matches the reference shadcn-starter template's own icon choice. No emoji as icons, ever. Fixed 16–20px sizing in dense dashboard contexts, 20–24px on the kiosk to match its larger touch scale.

**Always import `Icon` from `@/components/icon`, never `@iconify/react` directly.** That wrapper pulls in `lib/icons.ts`, which pre-registers every icon this app uses via `addCollection` from the `/offline` entry point — so icons render as real inline SVG synchronously, including in the initial SSR HTML, with zero runtime network dependency on Iconify's API. Using the bare package would silently regress to network-fetched icons (a blank-icon flash on every load, and a hard dependency on a third-party CDN for basic UI chrome).

When a new icon is needed: check it exists first (`curl "https://api.iconify.design/tabler.json?icons=<name>"`), then add its entry to `lib/icons.ts`'s `addCollection` call — don't just reference a new `tabler:*` name in JSX without registering it, it'll render as an empty span.

**Note for future `shadcn add` runs**: this project's `components.json` still has `"iconLibrary": "lucide"`, and the shadcn CLI doesn't have first-class Iconify support — any newly-generated `components/ui/*.tsx` file will come back importing from `lucide-react`. Swap those imports to `@/components/icon` + register any new icon names by hand, the same way the existing primitives (`select`, `command`, `checkbox`, `dropdown-menu`, `breadcrumb`, `sidebar`, `dialog`, `sheet`) were converted.

## Anti-patterns (do not do)

- ❌ Emoji as icons
- ❌ Missing `cursor-pointer` on clickable elements
- ❌ Layout-shifting hover transforms (scale on hover that reflows neighbors)
- ❌ Text under 4.5:1 contrast
- ❌ Instant (non-transitioned) state changes — use 150–300ms transitions
- ❌ Invisible focus states
- ❌ Touch targets under 44×44px anywhere on the kiosk
- ❌ Landing-page patterns (hero sections, marketing CTAs) — this is an internal tool

## Pre-delivery checklist

- [ ] No emoji icons — `tabler:*` via `@/components/icon` only
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover/focus transitions 150–300ms
- [ ] Light mode text ≥ 4.5:1 contrast
- [ ] Visible focus rings (keyboard nav)
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive at 375/768/1024/1440px (dashboard); kiosk targets iPad viewport specifically
- [ ] Status badges use the mapping above, consistently
- [ ] Serial numbers / ticket numbers / asset IDs render in `font-mono`
