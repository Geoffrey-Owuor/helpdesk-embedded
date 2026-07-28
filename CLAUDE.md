# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

HelpDesk is a centralized issue-tracking and internal knowledge-base app built with Next.js 16 (App Router) and React 19. Users submit issues, which are routed by department/issue-type to an agent, tracked through a status workflow (pending → in-progress → resolved/escalated → closed → reopened), and backed by a searchable article/FAQ library, in-app notifications, and email alerts. It supports local email/password login, Microsoft Entra ID (Azure AD) SSO, and a signed-link SSO for embedding the app inside another portal (hence "issue-desk-embedded").

The extended reference doc is `docs/README-full.md` — read it for a fuller feature/role breakdown before making structural changes.

## Commands

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — run the production build (after `npm run build`)
- `npm run lint` — ESLint (flat config in `eslint.config.mjs`, extends `eslint-config-next`)

There is no test suite/framework configured in this project (no `test` script, no Jest/Vitest). Don't assume one exists.

Local dev requires a `.env.local` with Postgres connection vars (`DATABASE_HOST`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME`, `DATABASE_PORT`), JWT secrets (`ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`), and a running PostgreSQL instance. `.env*` files are excluded from Claude's read/edit permissions in `.claude/settings.json` — don't try to read or write them.

## Architecture

### Data layer — raw SQL, no ORM

`lib/Db.ts` exposes a singleton `pg` `Pool` (reused via `global.postgresPool` in dev to survive HMR) and a `query<T>(text, params)` helper that checks out a client, runs the query, and always releases it. All DB access in the codebase goes through this helper with parameterized queries — there is no ORM/query builder. `issues_schema.sql` has the full table DDL (`users`, `issues_table`, `issue_escalation`, `issue_reopening`, `verification_codes`, `super_admins`, `company_user_records`, etc.) — check it before writing new queries so column names match.

### Auth — JWT cookies + route middleware

- `lib/Auth.ts` handles password hashing (bcrypt), and signs/verifies short-lived access tokens (1h) and longer-lived refresh tokens (7d) with `jose`, stored as httpOnly cookies (`accessToken`, `refreshToken`). `requireSession` (refresh-token based) and `requireTemporarySession` (SSO pending-registration token) are `React.cache`-memoized per request.
- `proxy.ts` is the Next.js middleware: it redirects unauthenticated users away from `/dashboard/*` and authenticated users away from auth pages (`/login`, `/register`, `/forgot-password`, `/reset-password`). It respects `NEXT_PUBLIC_BASE_PATH` when building redirect URLs.
- `lib/api-middleware/ApiMiddleware.ts` exports `withAuth(handler)`, a wrapper for `app/api/*/route.ts` handlers that runs a DB health check (503 if unhealthy), verifies the access token (401 if missing/invalid), resolves route params, and injects `{ request, params, user }` into the handler. Use this wrapper for any new authenticated API route rather than re-implementing auth checks inline.
- The `AuthJWTPayload` shape (`userId`, `email`, `username`, `role`, `department`, `isSuper`) is the canonical "current user" object threaded through the app via `contexts/UserContext.tsx` (`useUser()` hook).
- Cross-tab/embedded-iframe session sync uses a `BroadcastChannel("embed_auth_session_sync")`: `UserProvider` posts `EMBEDLOGIN` on mount, `hooks/useAuthSync.ts` listens for `EMBEDLOGIN` (different user → reload) and `EMBEDLOGOUT` (→ redirect to login). `hooks/useIsEmbedd.ts` detects iframe embedding via `window.self !== window.top`.
- Signed-link SSO for embedding (`app/api/sso/external`, `app/(auth)/sso/page.tsx`) and Microsoft Entra ID SSO (`app/api/sso/microsoft/*`, `@azure/msal-node`) are the two SSO paths, in addition to local email/password login.

### Roles & permissions

Three roles on `users.role`: `user` (submit/view own issues, read articles), `agent` (works assigned issues), `admin` (manages issues/agents/issue-type mappings for their department; access to Automations and IT Team pages). A separate `isSuper` boolean (backed by `super_admins`) grants full Super Admin panel access (users, issue types, department→agent mappings, group emails) independent of `role`. When adding UI or API routes, gate on both `role` and `isSuper` as appropriate — they are orthogonal.

### App Router structure

- `app/(auth)/` — login/register/password-reset/SSO pages (route group, no `/auth` in the URL)
- `app/(DashBoardRoutes)/dashboard/` — authenticated dashboard: issues, articles, automations, superadmin panel
- `app/api/*/route.ts` — REST-style route handlers (most wrapped in `withAuth`); this is where server-side mutation/query logic for client components lives
- `app/articles/`, `app/it-team/`, `app/manual/`, `app/changelog/` — public/semi-public informational pages
- Server actions in `serverActions/` are used instead of API routes when a server component needs to fetch/mutate data directly (e.g. `GetIssueTypes`, `QuickCreate`, `CheckBehalfUser`). Prefer server actions for server-component data needs and `app/api` routes for client-triggered fetches/mutations that go through `AxiosClient`/TanStack Query.

### Client state

Two separate state systems are used for different purposes — don't blur them:

- **TanStack Query** (`queries/`, wired up via `components/Navigation/QueryProvider.tsx`) — server data fetching/caching/invalidation (issues, automations, attachments, cards).
- **Zustand** (`store/`) — client-only UI state: alerts, overlays/modals, confirm dialogs, sidebar toggle, active tab, table column visibility, search, and DB connectivity status (`useDbStore`, consumed by `components/Modules/DbStatus/DbStatusPill.tsx` / `DbRecoveryManager.tsx`).

Client HTTP calls go through the shared `lib/AxiosClient.ts` instance; `utils/AxiosErrorHelper.ts` normalizes error handling.

### Email

`services/EmailSender.ts` / `services/CustomEmailSender.ts` send mail via Nodemailer using HTML built from `templates/*.ts` (verification code, password reset, first-login, bug report, issue notifications). `services/SendBugReport.ts` powers the in-app bug-report form. The Super Admin "PostMail" feature (`components/Modules/ArticlesPage/PostMail/PostMail.tsx`) lets admins compose and send ad-hoc HTML emails with retry logic.

### Scheduled automation

`app/api/triggers/issues-reminder` and `app/api/triggers/autoclose-issues` are meant to be hit by an external scheduler (cron/task scheduler) and are protected by a shared `CRON_SECRET`, not by user auth — don't wrap these in `withAuth`.

### Path alias

`@/*` maps to the project root (see `tsconfig.json`), e.g. `@/lib/Auth`, `@/components/...`.
