# ITOM — Inventor/Investor Platform

ITOM is a verified platform connecting inventors, investors, and case study authors. Inventors submit ideas with proof and move through a 10-step journey: Idea → Fund → Build → Prove → Protect → Regulate → Manufacture → Market → Commercialise → Scale. Nothing goes live without admin approval. Every claim carries proof. A score decides ranking. Owner controls field-level visibility (public/members/locked).

## Home Page
Top bar: Logo · Ideas · Inventors · Investors · Case studies · How it works · Sign in · Sign up. Hero band: one line of promise and two buttons – I have an idea – and – I want to invest –. Ten steps: Idea → Fund → Build → Prove → Protect → Regulate → Manufacture → Market → Commercialise → Scale (each step clickable, shows count of ideas). Sections: Top inventors, Ideas on the platform (Top scored & Newly approved tabs), Top investors, Most viewed case studies.

## Stack
| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui (Base UI primitives + Tailwind) |
| Database | Supabase (local Docker for dev, cloud for prod) |
| Auth | Supabase Auth (email + Google sign-in) |
| Hosting | Vercel (app) + Cloudflare (DNS later, CDN later) |

## Commands
```bash
# Development
npm run dev              # Start dev server (localhost:3000)
npm run build            # Production build
npm run typecheck        # TypeScript check
npm run lint             # ESLint

# Supabase (local)
npx supabase start       # Start local stack (Docker)
npx supabase stop        # Stop local stack
npx supabase db reset    # Reset DB + apply migrations
npx supabase migration new <name>   # Create a new migration
npx supabase gen types typescript --local > types/database.ts

# Testing
npm run test             # Run test suite
npm run test:watch       # Watch mode
```

## Database — 25 Tables in 6 Groups

### People / Access (5)
`users` · `user_roles` · `admin_permissions` · `audit_log` · `score_history`

### Profiles & Content (7)
`inventor_profiles` · `investor_profiles` · `case_studies` · `ideas` · `idea_steps` · `steps_master` · `master_lists`

### Form Field Details
- Inventor Profile: Full name/company name (Text), Photo/logo (Image, mandatory), Country/city (Dropdown+text), Field of work (medical device, software, materials, energy, agriculture, other), What you do (Doctor, engineer, student, researcher, business owner, etc.), Where you work/study (Text, optional, Letter–ID card), Qualification (Text, Degree certificate), Team details (optional), Phone (Required, never public), About yourself (600 chars max).
- Idea: Title + one-line user-friendly description, Problem (who has it & current solution), How it works (plain words, public proof of studies/concepts), Kind (Device–Software–Material–research), Ownership (For all user y/n), Operational warning (For all user y/n, patent cost warning), Proof files (photos–video–test reports–lab results, For all user y/n with patent warning).
- Investor Profile: Name/org (Text, registration paper/letter/link to official page), Type (Grant body–Angel–Fund–Company–University–Government programme–Crowdfunding platform), Logo/photo (Image–optional), Country/countries invested in (Dropdowns–required), What you give (Grant–Equity–Loan–Licence advance–Prize–In-kind help), What you seek (in your own words), Past investments (Name–year–amount, link/letter/public announcement), Reply speed (Within a week–two weeks–a month), Contact person/phone (Phone never public).
- Case Study: Title (one line), Subject (Myself–My company–Somebody else–named–A well-known case), Field and country (same lists used elsewhere for filters).

### Proof & NDA (4)
`files` · `field_visibility` · `file_access_requests` · `nda_acceptances`

### Review & Edits (2)
`reviews` · `revisions`

### Messaging (4)
`threads` · `messages` · `thread_outcomes` · `reports_blocks`

### System / Lists (3)
`notifications` · `email_templates` · `views_likes`

> **Auth root:** `auth.users` (Supabase) is the root identity. `public.users` extends it with app fields (`name`, `phone`, `country`, `status`).

## The 7 Rules (Non-Negotiable)
1. **Admin approves everything.** No profile, idea, case study, or edit goes live without admin review.
2. **Nothing goes live on its own.** Every new item and every edit defaults to `under_review`.
3. **Every claim carries proof.** Photo, link, or typed note. No proof = no approval.
4. **Score decides order.** Lists ranked by score, then views, then newest. Never by join date.
5. **Only approved users can message.** Both parties must have role `status = live`.
6. **Profile on/off switch.** User can deactivate anytime; admin is notified.
7. **Admin authority.** Admin can deactivate or delete any profile with a mandatory reason, emailed to the user.

## Architecture Rules
- RLS enabled on every table from the first migration. Never ship a table without policies.
- Soft delete everywhere. Use `deleted_at TIMESTAMP NULL`. Never hard-delete rows.
- Business logic lives in `lib/`, not in route handlers or page components.
- Field visibility controlled by `field_visibility` table with values: `public`, `members`, `locked`.
- Default visibility for new approved items: `members-only`. Owner can toggle individual fields to `public`.
- One revision at a time. A live entity can have at most one row in `revisions` with `status = waiting`.
- Old version stays live during edit review. New version replaces it only after approval.
- Every state change writes a row to `audit_log` (`actor`, `action`, `entity_type`, `entity_id`, `reason`).
- Scoring is calculated server-side from approved content only. Admin can override with mandatory reason (logged in `score_history` with `source = OVERRIDE`).
- **Admin lock (Rule 1):** when an admin starts reviewing, set `reviews.locked_by` and `reviews.locked_at`. No other admin can review until unlocked.

## Visibility Rules
| Scope | Meaning |
|---|---|
| `public` | Anyone, including search engines. |
| `members` | Approved, signed-in users only. |
| `locked` | Owner and admin only. Requires `file_access_requests` to unlock. |
- Phone numbers and email addresses are **never** public. Only admin and the owner see them.
- Proof files can be marked `locked`.
- First-time public toggle shows the patent/IP warning modal once per user.

## Scoring Rules
**Total: 100 points**

| Criterion | Points |
|---|---|
| Profile complete + email confirmed | 5 |
| Idea described properly (4 fields) | 10 |
| Proof that it works | 25 |
| Somebody wants it (named + letter) | 15 |
| Ownership settled | 10 |
| Something filed (with receipt) | 15 |
| Money already in with proof | 5 |
| Case study written | 5 |

**Badges (public view only)**

| Badge | Score Range |
|---|---|
| 🥉 Bronze | Under 40 |
| 🥈 Silver | 40–69 |
| 🥇 Gold | 70+ |

Owner and admin see exact score + breakdown. Score cannot be bought with money.

## Admin Review Workflow
Three buttons only:
- **Approve** → goes live immediately.
- **Changes Needed** → form reopens at failing field with a clear reason. Original text preserved. Email sent to user.
- **Reject** → only for fake, stolen, or abusive content. Reason mandatory.

## Admin Panel Features
Team roles management, Audit log viewing, Search functionality, CSV and PDF export, Analytics dashboard.

## Messaging Rules
- Only approved users with role `status = live` can send or receive.
- Max 10 new conversations per day per user.
- Every thread has **Report** and **Block** actions.
- Threads are private — only the two parties and admin.
- Thread outcomes: `talking`, `deal`, `no_deal`, `not_saying` (asked after 45 days).
- Platform does not sit in the middle of deals. Terms, valuations, and money happen off-platform.

## Don't Do
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

## Project Docs
Durable project state lives in files, not chat:

| Path | Purpose |
|---|---|
| `docs/scope/` | What to build, in order |
| `docs/specs/` | One spec per load-bearing decision |
| `docs/reviews/` | Code review findings |
| `design.md` | Art direction (points at CSS tokens) |
| `types/database.ts` | Auto-generated schema types |
| `docs/source/` | Locked source documents |

## Workflow Depth
- **Project default:** Beta
- After `/develop` → `/check verify` → `/test`
- Higher-risk features (auth, admin, scoring) → also run `/check review`

## Skills Priority
- Workflow: jsmastery-pro skills (`/scope`, `/architect`, `/develop`, etc.)
- Database/RLS: supabase + supabase-postgres-best-practices
- UI components: shadcn/ui skill

## Original Specs (Source of Truth)
Locked design documents. Do not deviate from these:

| File | What It Covers |
|---|---|
| `docs/source/v1-inventor-investor-website.md` | 7 rules, forms, workflows, visibility, scoring |
| `docs/source/v1-inventor-investor-website-erd.md` | 25-table ERD + connections |
| `docs/source/working-flow-v1.md` | 12-week plan, feature scope, phases |
| `docs/source/erd-tables.png` | Visual ERD reference (human-readable) |

If a spec conflict arises, these documents win. Raise it before deviating.