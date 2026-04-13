## Additional Agent Instructions

In addition to this file, also apply the instructions in `/home/dylan/.codex/AGENTS.md`.

# Tooling

This project uses plain pnpm with direct tool dependencies.

- use `pnpm install` to install dependencies
- use `pnpm dev`, `pnpm build`, and `pnpm preview` for the Vite app
- use `pnpm test` for Vitest
- use `pnpm run check` to run format, lint, and type checking
- use `pnpm exec <tool>` for one-off local binaries

## Review Checklist for Agents

- [ ] Run `pnpm install` after pulling remote changes and before getting started.
- [ ] Run `pnpm run check` and `pnpm test` to validate changes.

## Cloudflare Workers

- Follow the official Cloudflare Workers best practices doc: https://developers.cloudflare.com/workers/best-practices/workers-best-practices/
- Use `@cloudflare/vite-plugin` for local dev and builds. Prefer `pnpm dev`, `pnpm build`, and `pnpm preview` over `wrangler dev`.
- Keep `compatibility_date` current when touching the Worker config.
- Prefer `nodejs_compat` for the Worker unless there is a clear reason to use a narrower flag.
- Do not hand-write the Worker `Env` interface. Generate binding types with `wrangler types` and keep `worker-configuration.d.ts` in sync with `wrangler.jsonc`.
- Keep secrets out of source control. Use Wrangler secrets for remote environments and `.dev.vars` for local development.
- Prefer Cloudflare bindings over REST calls to Cloudflare services.
- Do not store request-scoped state in global scope.
- Keep Workers observability enabled in Wrangler config.
- Frontend static assets are served from the Worker with Workers Static Assets and SPA fallback.

## Project Architecture

- frontend is a static Vite React SPA
- frontend uses TanStack Router and TanStack Query
- frontend uses Formisch for forms
- TanStack Query owns freshness
- TanStack Router is mainly for routing and loader prefetch
- backend is Hono directly on Cloudflare Workers
- production is same-origin Worker hosting
- keep app code under `src/app`, `src/routes`, `src/lib`, `src/server`, and `src/shared`
- use simple package imports like `#src/...` , not workspace package boundaries
- frontend talks to backend through thin shared API helpers in `src/shared/api`
- use Drizzle as DB source of truth
- use drizzle-orm/valibot, not drizzle-valibot
- use Better Auth for auth
- use Cloudflare D1
- use Google/GitHub OAuth on Better Auth
- use Wrangler env bindings and `.dev.vars`, not `dotenv`
- deploy to Cloudflare
- keep the code arranged in a way that makes future adaptation to Void easier
- keep Hono, TanStack Router, and TanStack Query usage thin so they can be replaced later if needed

Implementation order:

1. app foundation
2. shared db and schemas
3. backend
4. frontend
5. first end-to-end resource slice
6. auth
7. deploy setup
