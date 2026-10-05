# ITOM — Claude Code Context

@AGENTS.md

## Claude-Specific Notes

- Default workflow depth: **Beta** (develop → check verify → test).
- Use the skills from `.claude/skills/` for all feature work.
- **Source of truth:** `docs/source/` — read the locked docs before any architectural decision.
- Before any load-bearing decision (schema, provider, RLS policy), route to `/architect`.
- Never commit without passing `npm run typecheck && npm run lint`.
- Never add a Supabase migration without RLS policies in the same file.
- When in doubt, read `docs/specs/` first. If no spec exists, ask before building.