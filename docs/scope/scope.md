# Scope: ITOM — Inventor/Investor Platform

A platform that connects inventors, investors, and case study authors. Inventors submit ideas with proof and move them through a 10-step journey: Idea → Fund → Build → Prove → Protect → Regulate → Manufacture → Market → Commercialise → Scale. Core value: Trust. Nothing goes live without admin approval. Every claim carries proof. A score decides ranking.

**Build approach:** Tracer Bullet (vertical slices; each feature built end to end through every layer, working).
**Workflow:** Beta (After `/develop`, `/check verify` then `/test`. No fresh model review by default. Best for most real products.)

## At a glance

| # | Feature | Phase | Status |
|---|---------|-------|--------|
| 1 | Stack & architecture | Foundation | existing |
| 2 | Coding standards & tooling | Foundation | existing |
| 3 | Data model | Foundation | planned |
| 4 | Design system & UI foundation | Foundation | planned |
| 5 | Sign-up & authentication | Foundation | planned |
| 6 | Role selection & user status | Foundation | planned |
| 7 | Admin team & permissions | Foundation | planned |
| 8 | Audit log | Foundation | planned |
| 9 | Inventor profile | Profiles | planned |
| 10 | Investor profile | Profiles | planned |
| 11 | Case study author profile | Profiles | planned |
| 12 | Idea submission form | Profiles | planned |
| 13 | Idea form validation & checks | Profiles | planned |
| 14 | Admin review engine | Review Engine | planned |
| 15 | Review status flow & notifications | Review Engine | planned |
| 16 | Live edits & version control | Review Engine | planned |
| 17 | Side-by-side diff viewer | Review Engine | planned |
| 18 | Admin view modes (visitor/investor) | Review Engine | planned |
| 19 | Admin panel features (search, export) | Review Engine | planned |
| 20 | Scoring engine | Scoring/Home/Messaging | planned |
| 21 | Public badges (Bronze/Silver/Gold) | Scoring/Home/Messaging | planned |
| 22 | Home page | Scoring/Home/Messaging | planned |
| 23 | Listing pages with filters | Scoring/Home/Messaging | planned |
| 24 | Messaging system | Scoring/Home/Messaging | planned |
| 25 | Functional testing | Testing | planned |
| 26 | Security & privacy testing | Testing | planned |
| 27 | Mobile responsiveness | Testing | planned |
| 28 | Production deployment | Testing | planned |

## Foundations

### 1. Stack & architecture · existing
Decide the stack and scaffold a runnable project so every later slice builds on real structure.
**Done when:** the stack is recorded in a spec and the empty scaffold boots locally and passes build.
- [x] Decide the stack (spec): Next.js (App Router) + TypeScript, Tailwind CSS v4, shadcn/ui, Supabase Postgres, Supabase Auth
- [x] Scaffold from the decision: `/develop stack & architecture`
- [x] Smoke-check it runs: `/test`
Spec 0001 · code in `./`

### 2. Coding standards & tooling · existing
Capture conventions, then install lint, format, and pre-commit enforcement from the real scaffolded project.
**Done when:** root `AGENTS.md` reflects the real stack, and lint/format/pre-commit run clean.
- [x] Capture conventions + tooling choices: `/audit`
- [x] Install the tooling: `/develop tooling`
- [x] Check it runs clean: `/test`

### 3. Data model · planned
Core entities every feature builds on: users, user_roles, admin_permissions, audit_log, score_history, inventor_profiles, investor_profiles, case_studies, ideas, idea_steps, steps_master, master_lists, files, field_visibility, file_access_requests, nda_acceptances, reviews, revisions, threads, messages, thread_outcomes, reports_blocks, notifications, email_templates, views_likes.
**Done when:** entities and relationships support later slices without a breaking migration.
- [ ] Design it (spec): `/architect data model`
- [ ] Build it: `/develop data model`
  - [ ] Schema + constraints: tables, keys, unique/check, cascades
  - [ ] Row-level security: per-table policies + helpers
  - [ ] Apply migration, confirm live, generate types
- [ ] Verify it: `/check verify data model`
- [ ] Test it: `/test data model`
Spec 0002 · code (filled by /develop)

### 4. Design system & UI foundation · planned
Visual language, layout primitives, and base components so the flows feel cohesive and accessible.
**Done when:** `design.md` covers type/color/spacing/components, and base components handle focus and keyboard.
- [ ] Design it (spec): `/architect design system & UI foundation`
Spec 0003 · code in `design.md` and `app/globals.css`

## Profiles

### 5. Sign-up & authentication · planned
Email + Google sign-in with email verification, password reset, and phone/country collection.
**Done when:** user can sign up with email/password or Google, verify email, reset password, and provide profile details.
- [ ] Design it (spec): `/architect sign-up & authentication`

### 6. Role selection & user status · planned
Role selection (Inventor/Investor) with approval flow and user status (active/off/suspended).
**Done when:** user selects role during sign-up, admin approves role, and user can activate/deactivate account.
- [ ] Design it (spec): `/architect role selection & user status`

### 7. Admin team & permissions · planned
Admin team members with module permissions (view/edit/review/full) and audit logging.
**Done when:** admin can invite team members, assign permissions, and all admin actions are logged.
- [ ] Design it (spec): `/architect admin team & permissions`

### 8. Audit log · planned
Comprehensive audit logging of all platform activities for security and compliance.
**Done when:** every significant action is logged with user, timestamp, and details.
- [ ] Design it (spec): `/architect audit log`

### 9. Inventor profile · planned
Inventor profile with proof uploads, field-level visibility control, and 10-step journey tracking.
**Done when:** inventor can create profile, upload proof documents, set field visibility (public/members/locked), and track progress through idea lifecycle.
- [ ] Design it (spec): `/architect inventor profile`

### 10. Investor profile · planned
Investor profile with investment type, contribution capacity, past investments, and response time tracking.
**Done when:** investor can create profile, specify investment preferences, list past investments, and update response speed metrics.
- [ ] Design it (spec): `/architect investor profile`

### 11. Case study author profile · planned
Case study author profile with details, rights confirmation, and portfolio management.
**Done when:** author can create profile, confirm rights to case studies, and manage their case study portfolio.
- [ ] Design it (spec): `/architect case study author profile`

### 12. Idea submission form · planned
Structured idea submission form with problem description, solution explanation, idea categorization, and kind-specific proof requirements.
**Done when:** inventor can submit ideas with detailed problem/solution, categorize idea type (Device/Software/Method/Material), and provide required proof based on idea category.
- [ ] Design it (spec): `/architect idea submission form`

### 13. Idea form validation & checks · planned
Mandatory validation checks for idea submission: functionality verification, ownership confirmation, disclosure tracking, IP status, and funding details.
**Done when:** form validates all mandatory checks before submission and provides clear feedback on missing information.
- [ ] Design it (spec): `/architect idea form validation & checks`

## Review Engine

### 14. Admin review engine · planned
Three-button review system (Approve/Changes Needed/Reject) with mandatory reasoning for rejections and admin override capabilities.
**Done when:** admin can review submissions with clear action buttons, provide detailed feedback for changes needed, and require justification for rejections.
- [ ] Design it (spec): `/architect admin review engine`

### 15. Review status flow & notifications · planned
Status progression system (Under Review → Changes Needed → Live → Deactivated) with email notifications and portal alerts.
**Done when:** submissions automatically progress through status stages with appropriate notifications sent to users.
- [ ] Design it (spec): `/architect review status flow & notifications`

### 16. Live edits & version control · planned
System allowing edits to live content while preserving current version, with single pending revision limit and edit logging.
**Done when:** users can edit submitted content while original remains live, only one pending revision per entity, and all edits are logged.
- [ ] Design it (spec): `/architect live edits & version control`

### 17. Side-by-side diff viewer · planned
Visual comparison tool showing original vs proposed changes with highlighted differences for efficient review.
**Done when:** reviewers can view changes in side-by-side format with clear highlighting of modifications, additions, and deletions.
- [ ] Design it (spec): `/architect side-by-side diff viewer`

### 18. Admin view modes (visitor/investor) · planned
Viewing modes that allow admin to see content as different user types would see it for accurate review.
**Done when:** admin can toggle between viewing content as public visitor, registered member, or locked user to verify field visibility settings.
- [ ] Design it (spec): `/architect admin view modes`

### 19. Admin panel features (search, export) · planned
Administrative interface with global search capabilities and CSV/PDF export functions for reporting and analysis.
**Done when:** admin can search across all platform data and export results in CSV or PDF format for external analysis.
- [ ] Design it (spec): `/architect admin panel features`

## Scoring/Home/Messaging

### 20. Scoring engine · planned
Algorithm calculating scores out of 100 based on submitted proof, idea completeness, and admin override capability with score history tracking.
**Done when:** platform calculates scores based on predefined criteria, allows admin overrides with mandatory reasons, and maintains history of score changes.
- [ ] Design it (spec): `/architect scoring engine`

### 21. Public badges (Bronze/Silver/Gold) · planned
Visual badge system displaying achievement levels based on scores: Bronze (<40), Silver (40-69), Gold (70+).
**Done when:** user profiles display appropriate badges based on their score, and public listings order by score/views/newest.
- [ ] Design it (spec): `/architect public badges`

### 22. Home page · planned
Landing page featuring hero section, 10-step journey visualization, statistics, and featured content sections.
**Done when:** home page loads with hero banner, interactive 10-step journey, inventor/idea/investor/case study statistics, and featured content.
- [ ] Design it (spec): `/architect home page`

### 23. Listing pages with filters · planned
Browsable listings for ideas, investors, and case studies with filtering, sorting, and engagement tracking.
**Done when:** users can browse ideas/investors/case studies, apply filters/sort options, and track views/likes/shares on items.
- [ ] Design it (spec): `/architect listing pages with filters`

### 24. Messaging system · planned
Secure messaging between approved users with inbox, email notifications, file attachments, and conversation limits.
**Done when:** approved users can send/receive messages, receive email alerts for new messages, attach files to conversations, and are limited to 10 new conversations/day.
- [ ] Design it (spec): `/architect messaging system`

## Testing

### 25. Functional testing · planned
Comprehensive testing of all user flows and platform functionalities to ensure correct operation.
**Done when:** all core user flows (sign-up, submission, review, messaging) are tested and functioning correctly.
- [ ] Design it (spec): `/architect functional testing`

### 26. Security & privacy testing · planned
Focused testing on data protection, field-level visibility enforcement, and secure file access controls.
**Done when:** locked fields remain hidden from unauthorized users, file access follows permissions, and privacy controls function correctly.
- [ ] Design it (spec): `/architect security & privacy testing`

### 27. Mobile responsiveness · planned
Ensuring the platform functions correctly and maintains usability across mobile device screen sizes.
**Done when:** platform layout adapts to mobile screens, all interactive elements remain accessible, and core functions work on touch devices.
- [ ] Design it (spec): `/architect mobile responsiveness`

### 28. Production deployment · planned
Deployment of the platform to production environment with admin training and system monitoring setup.
**Done when:** platform is deployed to production, admins receive training on system operation, and monitoring tools are configured.
- [ ] Design it (spec): `/architect production deployment`

## Legend

**The decision box.** Every feature carries exactly one, the sub-task whose label ends with `(spec)`. Its wording varies (`Design it (spec)` normally, `Decide the stack (spec)` on Stack & architecture), so skills locate it by that `(spec)` suffix, never by an exact label. Every other box is an execution box and `/architect` never ticks one.

**Feature lifecycle**: the scope updates as a feature moves; each row is what it shows and who sets it:

| State | Set by | The feature shows |
|---|---|---|
| `planned` · needs a decision | `/scope` | one box: `Design it (spec): /architect <feature>` |
| `in-progress` (designed) | **`/architect` at spec capture** | `Design it` ticked; spec linked; `Build it: /develop <feature>` + **2 to 5 milestones**; the tier's closing boxes (`Verify it` Alpha+, `Test it` Beta+, `Review it` + `Document it` GA); any surfaced follow-up enrolled |
| `in-progress` (building) | `/develop` | milestone sub-boxes tick one by one; code pointer filled |
| `in-progress` (verified) | `/check verify` | `Build it` + milestones ticked; `Verify it` ticked |
| `done` | **you, when you decide it is** (any skill sets it when you say so); `/sync` reconciles | boxes you ran ticked, skipped ones marked skipped; the tier's last stage (`Prototype` → after `/develop`; `Alpha` → after `/check verify`; `Beta`/`GA` → after `/test`) is the suggested point to call it done; `/sync` captures conventions |

- **Next step** = the first unticked box (always a command or a tracked milestone).
- **needs a decision** = run `/architect` first; otherwise straight to `/develop` (or `/audit` for standards & tooling). The tag drops once the spec is captured.
- **Atomic build tasks live in the spec's `## Build plan`, not here**: the scope carries only the milestone rollup.
- **Status** `planned` → `in-progress` → `done`, plus `existing` (pre-workflow) and `dropped` (de-scoped, kept for history).
- **Approach tag** beside a heading (e.g. `· Facade`) overrides the project default for that feature; no tag = inherits it.
- **Workflow tier tag** beside a heading (e.g. `· GA`, `· Prototype`) sets that one feature's rigor above or below the project default; no tag inherits the default. It decides the feature's check boxes and each skill's next suggestion.
- **Workflow** (header line) is the project default, what runs after `/develop`: **Prototype** = nothing (trust develop's own build time self check); **Alpha** = `/check verify`; **Beta** = `/check verify` then `/test`; **GA** = adds a fresh model `/check review` then `/document`. A feature built on an unratified decision (an `Assumed` spec) stays flagged, but that never blocks `done`.
- **Pointer line** (`spec <n> · code in <path>`): the spec link added by `/architect`, the code path by `/develop`.

## /scope plan · ITOM — Inventor/Investor Platform

**28 features planned (2 already on the scope, 0 deferred), build approach Tracer Bullet, workflow Beta.**
Next: /clear, then /architect data model