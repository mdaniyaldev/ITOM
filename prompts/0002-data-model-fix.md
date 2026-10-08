# ITOM Data Model Fix Implementation Prompt

## Goal
Fix the ITOM data model specification to match the ERD source of truth by correcting 7 deviations and adding missing columns/tables, then create the initial Supabase migration file.

## Skills Read
- /develop (current skill)
- AGENTS.md project instructions
- docs/source/v1-inventor-investor-website-erd.md (ERD source of truth)

## Code Inspected
- docs/specs/data-model.md (current spec)
- docs/source/v1-inventor-investor-website-erd.md (ERD source of truth)
- Supabase migration patterns in existing codebase (if any)
- AGENTS.md for project conventions and rules

## Decisions & Assumptions
1. The ERD (docs/source/v1-inventor-investor-website-erd.md) is the source of truth for table structure per AGENTS.md
2. The current spec (docs/specs/data-model.md) needs to be updated to match the ERD
3. No existing Supabase migrations exist (clean slate for initial schema)
4. All tables must include RLS policies from the first migration
5. Helper functions is_approved_member and is_admin must be included
6. Timestamp columns (created_at, updated_at, deleted_at) follow existing patterns
7. UUID primary keys are used throughout
8. Soft delete via deleted_at column on all tables
9. Field-level visibility control via separate field_visibility table
10. Auth.users as root identity with public.users extension

## Expected Files
1. Updated spec: docs/specs/data-model.md (fixed to match ERD)
2. Migration file: supabase/migrations/<timestamp>_initial_schema.sql
3. Generated types: types/database.ts (after migration application)

## Requirements
### Deviations to Fix (per ERD/source of truth):
1. **admin_permissions table**: Replace can_manage_* boolean columns with `module` (text) and `level` (text: view/edit/review/full)
2. **score_history table**: Replace old_score/new_score with points model: `rule` (text), `points` (integer), `source` (text: AUTO/OVERRIDE), `override_by` (uuid FK -> users), `reason` (text), `created_at` (timestamptz)
3. **idea_steps table**: Change status enum from `not_started/in_progress/completed/verified` to `empty / under_review / changes_needed / approved / rejected`
4. **revisions table**: Replace JSONB revised_data with per-field rows: `field_name` (text), `old_value` (text), `new_value` (text), `status` (text: waiting/approved/rejected)
5. **messages table**: Replace attachment_ids UUID[] with single `file_id` (uuid FK -> files)
6. **reports_blocks table**: Simplify to: `thread_id` (uuid FK -> threads), `reporter_id` (uuid FK -> users), `kind` (text: report/block), `reason` (text), `status` (text). Remove block_status, block_reason, blocked_by, blocked_at, block_expires_at columns.
7. **views_likes table**: Change from aggregated counts to per-user events: `entity_type` (text), `entity_id` (uuid), `user_id` (uuid FK -> users), `kind` (text: view/like/share), `created_at` (timestamptz)

### Missing Columns to Add:
- **ideas table**: Add score (integer), badge (text), views (integer), likes (integer), ownership (text), told_whom (text), filing_status (text), money_in_usd (decimal), money_needed_usd (decimal), status (text)
- **case_studies table**: Add status (text), views (integer), likes (integer), shares (integer), source_link (text)
- **inventor_profiles table**: Add score (integer), badge (text), status (text)
- **investor_profiles table**: Add score (integer), badge (text), status (text), verified_at (timestamptz)
- **reviews table**: Add locked_by (uuid FK -> users), locked_at (timestamptz)
- **threads table**: Add idea_id (uuid FK -> ideas) to link threads to specific ideas

### Missing Table to Add:
- **email_log table**: 
  - id (uuid primary key)
  - user_id (uuid FK -> users)
  - template_key (text FK -> email_templates.template_name)
  - to_email (text)
  - subject (text)
  - status (text: sent/failed/bounced)
  - error_message (text)
  - sent_at (timestamptz)

## Security Considerations
- RLS policies must be defined for every table from the first migration
- Service role key bypass for admin operations only (never in client-side code)
- Field-level visibility controls must be respected in all queries
- Soft delete pattern (deleted_at) must be consistently applied
- No hardcoded admin-editable values - all configurable via database tables
- Scoring must be server-side only with idempotency guarantees
- Email sending must go through email_log table, never direct from code

## Acceptance Criteria
- [ ] Spec updated to match ERD source of truth
- [ ] All 7 deviations fixed in spec
- [ ] All missing columns added to spec
- [ ] Missing email_log table added to spec
- [ ] Initial migration file created with all 25 tables
- [ ] Migration includes enums, indexes, constraints
- [ ] Migration includes RLS policies for every table
- [ ] Migration includes helper functions: is_approved_member, is_admin
- [ ] Migration is reversible (has corresponding down statements)
- [ ] After migration application, npx supabase gen types produces correct types/database.ts

## Checks to Run
1. After spec update: Verify spec matches ERD structure
2. After migration creation: 
   - npx supabase db reset (to verify migrations apply cleanly)
   - npx supabase gen types typescript --local > types/database.ts
   - npm run lint
   - npm run typecheck
   - npm run build
3. Manual tests:
   - Verify RLS policies work correctly (public/members/locked access)
   - Test soft delete functionality
   - Verify field-level visibility controls
   - Test helper functions is_approved_member and is_admin
   - Confirm email_log table captures email sends

## Manual Test Steps
1. Apply migrations: npx supabase db reset
2. Generate types: npx supabase gen types typescript --local > types/database.ts
3. Start dev server: npm run dev
4. Test basic CRUD operations on key tables respecting RLS
5. Verify field-level visibility restrictions work
6. Test soft delete and restore functionality
7. Verify scoring system works correctly
8. Test email logging functionality
9. Test helper functions is_approved_member and is_admin

## Notes
- Follow AGENTS.md workflow: read specs -> inspect code -> ask focused question if ambiguous -> write implementation prompt -> get approval -> build -> run checks -> report
- This implementation prompt serves as the "ask for approval" step
- Do not proceed with building (creating migration file) until this plan is approved