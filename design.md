# ITOM Design System

## Brand
Professional, trustworthy, calm. Inspired by Linear, Stripe, academic journals. Not startup-y.

## Design Sources
- **Figma file:** "Design System for Platform"
- **Screenshots:** `docs/design/` — reference for `/develop` when building UI
- **Live tokens:** `app/globals.css` — CSS variables are the source of truth
- **Tailwind:** `tailwind.config.ts` maps tokens to utility classes

## Colors (CSS variables in `app/globals.css`)
| Token | Value | Use |
|---|---|---|
| `--primary` | #3B82F6 | Primary actions, links |
| `--foreground` | #172033 | Body text |
| `--muted-foreground` | #64748B | Captions, hints |
| `--background` | #F8FAFC | Page background |
| `--card` | #FFFFFF | Cards, modals |
| `--border` | #E2E8F0 | Dividers, input borders |
| `--success` | #22A06B | Approved states |
| `--warning` | #D99A2B | Under review, changes needed |
| `--destructive` | #E05252 | Rejected, errors |

## Typography
- Font: Inter (loaded via `next/font`)
- Mono: IBM Plex Mono (IDs, scores)
- Scale: Display 36/44 · H1 30/38 · H2 24/32 · H3 18/26 · Body 16/24 · Small 14/22 · Caption 12/18

## Spacing
Page: 24px · Section: 28px · Card: 16px

## Layout
Max content: 1160px · Sidebar: 240px · Modal: 480px · Form: 560px

## Components
All from **shadcn/ui** — styled via CSS variables:
- Buttons: Primary, Secondary, Ghost, Danger (Small, Large, Loading)
- Inputs: Default, Error, Disabled
- Badges: Neutral, Primary, Approved, Under Review, Changes Needed
- Score badges: Bronze (<40), Silver (40–69), Gold (70+)
- Navbar (public pages), Sidebar (admin pages)

## Rules
- Every button, input, modal from shadcn/ui — no custom components unless shadcn lacks it
- Same navbar on all public pages
- Same sidebar on all admin pages
- Every screen must have empty, loading, error states
- WCAG AA contrast in light and dark modes
- Never hardcode colors — use CSS variables
- Match Figma screenshots exactly when provided
- Reference screenshots at `docs/design/` for pixel-accurate builds