# ITOM — Inventor/Investor Platform

You are a principal-level full-stack engineer and AI implementation agent building ITOM, a production-style verified platform connecting inventors, investors, and case study authors.

Your job is to understand the request, use the right project skills, write a clear implementation prompt, get approval, then implement. Coding is not the first step. Planning is.


## 1. What You Are Building

ITOM connects inventors, investors, and case study authors. Inventors submit ideas with proof and move them through a 10-step journey: **Idea → Fund → Build → Prove → Protect → Regulate → Manufacture → Market → Commercialise → Scale**.

**Core value:** Trust. Nothing goes live without admin approval. Every claim carries proof. A score decides ranking. Owner controls field-level visibility (public / members / locked).

**In scope:** Auth (email + Google), inventor/investor/author profiles, idea submission with proof, admin review engine, scoring engine, home page + listings, messaging, case studies, admin panel.

**Out of scope for V1:** Payments, deal rooms, video calls, mobile app, AI moderation, multi-language. Build nothing beyond the scope. Useful is not enough — it must be in scope.


## 2. How to Work

Follow this exact workflow. Do not skip steps.

1. Read `AGENTS.md` (this file).
2. Read the named skills in `.claude/skills/`.
3. Inspect existing code and config.
4. Ask one focused question only if the task is genuinely ambiguous.
5. Write an implementation prompt in `prompts/`.
6. Ask for approval.
7. Build only after approval.
8. Run checks (see Section 13).
9. Close with a short report: **What I did / Test / Needs your attention**.

The implementation prompt must include: goal, skills read, code inspected, decisions & assumptions, expected files, requirements, security considerations, acceptance criteria, checks to run, manual test steps. Do not code before writing this.

**If building would mean inventing a decision with no spec, stop and route to `/architect`.** Do not silently guess.


## 3. UI Rules

You do not design UI. Figma reference is source of truth. Match layout, spacing, typography, color, and states exactly.

- Use **shadcn/ui** components from `components/ui/`. Never invent a custom button, input, or modal if shadcn has one.
- Reuse existing Tailwind patterns before adding new ones.
- Every screen must be complete: brand, real copy, empty state, loading state, error state.
- Mobile: no mobile reference exists — make it responsive sensibly while keeping desktop exact.
- Accessibility: WCAG AA contrast in light and dark modes.
- Never hardcode colors — use CSS variables from `app/globals.css`.
- Design tokens are defined in `design.md` and in `app/globals.css`. Do not duplicate values.

**When there is a reference image, it is the source of truth.**


## 4. Skills and Docs to Use

| Skill | When to use it |
|---|---|
| **jsmastery-pro** (`/scope`, `/architect`, `/develop`, `/check`, `/test`, `/document`, `/sync`, `/debug`) | Every feature — this is the workflow engine |
| **supabase** | Any Supabase Auth, Storage, Realtime, or `supabase-js` integration work |
| **supabase-postgres-best-practices** | Any migration, RLS policy, index, or Postgres query — load this BEFORE writing SQL |
| **shadcn/ui** | Any UI component work — load before adding new components |

Before writing Next.js code, read local docs in `node_modules/next/dist/docs/` (if available). Framework conventions change; local docs beat memory.


## 5. App Responsibilities and Boundaries

| Component | Responsibility |
|---|---|
| Next.js app (`app/`) | Renders UI, serves public pages, runs server actions |
| Supabase Postgres | Stores all data with RLS enforced |
| Supabase Auth | Handles identity (`auth.users` is root) |
| Supabase Storage | Stores proof files, avatars, case study pictures |
| Browser | Shows UI, calls safe app routes only |

**The most important boundary — browser vs server:**

- The browser **must never** hold the Supabase service role key.
- The browser **must never** bypass RLS — always use the anon key for client-side calls.
- The browser **must never** write content or progress directly via service role.
- Private data access happens on the server only.

**Server-side only:** `SUPABASE_SERVICE_ROLE_KEY`, all admin actions, scoring calculations, email sending, file virus scanning.

**Client-safe:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.


## 6. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui (Base UI primitives + Tailwind) |
| Database | Supabase Postgres (local Docker dev, cloud prod) |
| Auth | Supabase Auth (email + Google) |
| Hosting | Vercel (app) + Cloudflare (DNS now, CDN later) |

**Do not use:** Prisma or Drizzle (use Supabase client directly), NextAuth or Clerk (Supabase Auth is the identity provider), any payment SDK (V2), any charting library beyond shadcn charts, any state manager (React state + Server Components suffice).


## 7. Decisions Already Made

Do not re-decide these. Build to them.

1. **Auth is Supabase.** `auth.users` is the root identity. `public.users` extends it with app fields.
2. **Visibility is field-level** — `public` / `members` / `locked` — controlled by `field_visibility`.
3. **Admin lock (Rule 1).** When reviewing, set `reviews.locked_by` and `reviews.locked_at`.
4. **One revision at a time.** A live entity has at most one `revisions` row with `status = waiting`.
5. **Old version stays live** during edit review.
6. **Scoring is server-side** from approved content only. Admin override requires mandatory reason.
7. **Soft delete everywhere** via `deleted_at`.
8. **RLS on every table** from the first migration.
9. **Emails via `email_log` + `email_templates`** — never send directly from code.


## 8. Data Model — 25 Tables in 6 Groups

**People / Access (5):** `users`, `user_roles`, `admin_permissions`, `audit_log`, `score_history`

**Profiles & Content (7):** `inventor_profiles`, `investor_profiles`, `case_studies`, `ideas`, `idea_steps`, `steps_master`, `master_lists`

**Proof & NDA (4):** `files`, `field_visibility`, `file_access_requests`, `nda_acceptances`

**Review & Edits (2):** `reviews`, `revisions`

**Messaging (4):** `threads`, `messages`, `thread_outcomes`, `reports_blocks`

**System / Lists (3):** `notifications`, `email_templates`, `views_likes`

Full ERD and column details in `docs/source/v1-inventor-investor-website-erd.md`.

**Auth root:** `auth.users` (Supabase) is the root identity. `public.users` extends it with `name`, `phone`, `country`, `status`.

**Never trust `auth.users` metadata for role checks.** Always read from `public.user_roles`.


## 9. Background / Offline Processes

These do NOT run during a request:

- **Email queue** — inserts into `email_log`, processed by a background worker or scheduled function.
- **Notification fan-out** — writes to `notifications`, emails sent asynchronously.
- **Score recalculation** — triggered on approval, not on page load.
- **File virus scan** — runs after upload, before `files.status` becomes `approved`.
- **Thread auto-close** — 45-day no-reply threads close via cron.

**Never fetch transcripts, recalculate scores, or send emails synchronously during a page render.**


## 10. Config and Tuning

These are admin-editable in the database — never hardcode:

| Table | What it tunes |
|---|---|
| `master_lists` | Field of work, kind of idea, investor type, country, badges |
| `steps_master` | 10-step names, required proof, points per step |
| `email_templates` | Subject + body of every system email |
| `score_history` override | Admin can override any score with a mandatory reason |

If a value can be changed by an admin, it belongs in a table, not in code.


## 11. Feature Behavior

**Visibility:** `public` (anyone, indexed), `members` (approved signed-in only), `locked` (owner + admin only). Phone and email are NEVER public.

**Scoring:** 100 points. Public sees badge only (Bronze <40, Silver 40–69, Gold 70+). Owner and admin see exact score + breakdown. Score cannot be bought.

**Admin Review:** Three buttons only — Approve (live), Changes Needed (reopens failing field, preserves original text, emails user), Reject (fake/stolen/abusive only, mandatory reason).

**Messaging:** Approved users only (`status = live`). Max 10 new conversations/day. Every thread has Report + Block. Outcomes: `talking` / `deal` / `no_deal` / `not_saying` (after 45 days). Platform does not sit in the middle of deals.

**Case Studies:** Public or off. No members-only setting. 5 boxes + main card + up to 5 pictures. Two tick boxes required (true + rights).


## 12. Common Traps

These will bite you. Watch for them.

1. **RLS without policies = locked table.** A table with RLS enabled and no policies returns zero rows. Always write policies in the same migration.
2. **Service role bypasses RLS.** Never use `SUPABASE_SERVICE_ROLE_KEY` in client components. Server-only.
3. **Field visibility is per-row, not per-column.** Filter in the query via `field_visibility`, not in the component.
4. **`revisions` race condition.** Enforce "one waiting revision per entity" via a unique partial index, not application code alone.
5. **`auth.users` metadata is user-editable.** Never store role in metadata. Always read `public.user_roles`.
6. **Supabase Auth email templates** are separate from `email_templates`. Auth emails go through Supabase dashboard.
7. **Scoring must be idempotent.** Re-approval should not double-award points. Use `score_history` as the source of truth.
8. **Soft delete + RLS.** Queries must include `WHERE deleted_at IS NULL`. RLS policies must respect this.
9. **Migration rollback.** Every migration must be reversible (`down` file). Never edit a merged migration.
10. **File visibility ≠ field visibility.** `files.visibility` controls the file; `field_visibility` controls the parent field. Both apply.


## 13. Checks to Run

Run these in order after every code change:

```bash
npm run lint          # ESLint
npm run typecheck     # TypeScript (add script: tsc --noEmit)
npm run build         # Production build — required if routes/server code changed
npm run dev           # Start dev server, manually test in browser
```

After every Supabase change:

```bash
npx supabase db reset              # Verify migrations apply cleanly
npx supabase gen types typescript --local > types/database.ts
```

**Manual tests required:**

- Happy path of the feature
- Empty state (no data)
- Error state (invalid input, network fail)
- RLS: log in as user A, try to access user B's locked data — must fail
- Phone/email: never appears in any public API response

**Report the real output. Never claim a check passed without running it.**


## 14. Don't Do

- Never bypass admin approval in any code path.
- Never expose phone or email in a public API response.
- Never edit a migration after it has been merged.
- Never add a table without RLS policies in the same migration.
- Never hard-delete data. Use `deleted_at`.
- Never allow more than one `waiting` revision per entity.
- Never send emails directly. Insert into `email_log` and use `email_templates`.
- Never trust `auth.users` metadata for role checks. Always read from `public.user_roles`.
- Never write scoring logic in the client.
- Never invent a decision that has no spec. Route to `/architect` instead.
- Never hardcode admin-editable values (see Section 10).
- Never use `SUPABASE_SERVICE_ROLE_KEY` in client components.


## 15. When in Doubt

When the task is unclear, return to these rules. Do not improvise.

- Keep it small. Match the scope.
- Use the relevant skill — do not guess.
- Preserve server/client boundaries.
- Keep private tokens private.
- Match the Figma reference exactly.
- Inspect setup and config before hardcoding.
- Write a prompt and get approval before coding.
- Run the checks.
- If a decision is missing, route to `/architect`.
- If a spec conflict arises, `docs/source/` wins — raise it before deviating.


## Plugins

- **frontend-design** — Use when implementing any UI screen from Figma reference. Load before building components.
- **context7** — Use when working with Next.js, Supabase, shadcn, or Tailwind APIs. Pulls live docs instead of relying on memory.


## Project Docs

| Path | Purpose |
|---|---|
| `docs/scope/` | What to build, in order |
| `docs/specs/` | One spec per load-bearing decision |
| `docs/reviews/` | Code review findings |
| `docs/source/` | Locked source documents (do not deviate) |
| `design.md` | Art direction (points at CSS tokens) |
| `types/database.ts` | Auto-generated schema types — never hand-edit |


## Workflow Depth

- **Project default:** Beta
- After `/develop` → `/check verify` → `/test`
- Higher-risk features (auth, admin, scoring) → also run `/check review`


## Original Specs (Source of Truth)

Locked design documents. Do not deviate. If conflict arises, these win.

| File | Covers |
|---|---|
| `docs/source/v1-inventor-investor-website.md` | 7 rules, forms, workflows, visibility, scoring |
| `docs/source/v1-inventor-investor-website-erd.md` | 25-table ERD + connections |
| `docs/source/working-flow-v1.md` | 12-week plan, feature scope |
| `docs/source/erd-tables.png` | Visual ERD reference |