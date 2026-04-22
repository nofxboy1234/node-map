# PSDIP MVP Plan Tracker

## MVP Implementation Groups

- [x] Group 1: Project setup (Workers + Hono)
- [x] Group 2: Database schema (Drizzle + D1)
- [x] Group 3: Civilian report submission endpoint + UI
- [x] Group 4: Internal triage endpoints + UI
- [x] Group 5: Incident creation + report linking on escalation
- [x] Group 6: Incident lifecycle state machine (backend-first)
- [x] Group 7: Sighting events + storage
- [ ] Group 8: Incident timeline system (audit log)
- [ ] Group 9: PixiJS tactical map (basic)
- [ ] Group 10: Map overlays (derived devil position + movement trail)

## Current Architecture + Constraints

- Frontend: static Vite React SPA.
- Routing/data: TanStack Router + TanStack Query, with Query owning freshness.
- Forms: Formisch.
- Backend: Hono directly on Cloudflare Workers.
- Auth: Better Auth (Google/GitHub OAuth), role model includes `civilian` and `internal_user`.
- Database: Cloudflare D1 with Drizzle ORM as source of truth.
- Validation: Valibot shared schemas.
- API access: thin typed helpers in `src/shared/api`.
- Import style: no `.js` import specifiers in source imports.
- Workers static assets + SPA fallback configured in `wrangler.jsonc`.
- Drizzle policy: project uses Drizzle v1 RC/beta line; prefer updated APIs (Relational Queries v2 style).

## Progress Update Rule

- As each future group is completed, update this file immediately:
  - switch `[ ]` to `[x]` for that group
  - add a short completion note under the group if needed
- Use this file as the single progress tracker for MVP status.
