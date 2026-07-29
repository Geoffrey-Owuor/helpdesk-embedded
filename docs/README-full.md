# HelpDesk

HelpDesk is a centralized issue-tracking and internal knowledge-base application. Users submit issues, which are routed to the right team by department and issue type, assigned to agents, tracked through a status/escalation workflow, and resolved with a full audit trail (comments, attachments, escalation history, reopen history). It also ships a searchable article/FAQ library, in-app notifications, a changelog feed, and email notifications — and is designed to be embeddable inside another portal via signed-link SSO, in addition to local login and Microsoft Entra ID (Azure AD) SSO.

## Key Features

- **Issue lifecycle** — submit, assign/reassign, escalate, resolve, close, and reopen issues, each with an audit trail (`issue_escalation`, `issue_reopening` tables) and threaded comments
- **Department & issue-type routing** — issues are mapped to the correct department and agent via an issue-type → agent/admin mapping, configurable from the Super Admin panel (`IssuesMapping`)
- **Role-based access** — three roles (`user`, `agent`, `admin`) plus a separate super-admin flag (`isSuper`) for full system administration; a dedicated IT Team page and an Automations page are gated to non-`user` roles
- **Knowledge base / Articles** — markdown-based articles with a code/markdown editor, table of contents, search/filter, and preview
- **Notifications & changelog** — in-app notification feed and a changelog/news page
- **Bug reporting** — in-app bug report form that emails the dev/admin team
- **Custom email composer (PostMail)** — send ad-hoc HTML emails from within the app, with syntax-highlighted template editing and retry logic
- **Excel export** — export issues and user lists to `.xlsx` via ExcelJS
- **File attachments** — upload and view files attached to issues, stored under a configurable upload directory
- **Authentication** — local email/password (bcrypt + JWT access/refresh tokens), Microsoft Entra ID SSO (`@azure/msal-node`), and a signed, time-limited SSO link for embedding the app in another site/portal
- **Scheduled automation** — cron-triggered routes for issue reminders and auto-closing stale issues, protected by a shared secret
- **DB health monitoring** — a status pill/recovery manager in the UI that reflects live database connectivity

## Tech Stack

- Next.js 16 (App Router), React 19
- Tailwind CSS 4 (`lucide-react` icons, `next-themes` for dark mode)
- PostgreSQL via `pg` (raw SQL, no ORM)
- TanStack Query (client data fetching/caching) and Zustand (client UI state)
- Axios (client HTTP)
- `jose` (JWT signing/verification) + `bcryptjs` (password hashing)
- Nodemailer & Microsoft Graph (SMTP/Gmail) for transactional email; templates in `templates/`
- `@azure/msal-node` and `arctic` for Microsoft Entra ID / OAuth SSO
- `exceljs` for spreadsheet export
- `react-markdown` + `remark-gfm` and `@uiw/react-textarea-code-editor` for the article editor

## Quick Start (local development)

Prerequisites:

- Node.js 18+ installed
- A running PostgreSQL instance and a database available for the app.

Setup:

1. Install dependencies

```bash
npm install
```

2. Create a `.env.local` in the project root and set the required environment variables

3. Start the development server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Available NPM scripts

- `npm run dev` — Run Next.js in development mode
- `npm run build` — Build the production application
- `npm run start` — Start the production server after build
- `npm run lint` — Run ESLint

## Project structure (high level)

- `app/` — Next.js App Router pages and route handlers
  - `app/(auth)/` — login, register, forgot/reset password, SSO completion
  - `app/(DashBoardRoutes)/dashboard/` — the authenticated dashboard: issues, articles, automations, superadmin panel
  - `app/api/` — REST-style route handlers for issues, comments, users, articles, automations, notifications, SSO, cron triggers, etc.
  - `app/articles/`, `app/it-team/`, `app/manual/`, `app/changelog/` — public/semi-public informational pages
- `components/` — React components, grouped by area (`Modules/IssuePage`, `Modules/ArticlesPage`, `Modules/SuperAdmin`, `Navigation`, `Home`, `AuthPages`, `Skeletons`, `Themes`)
- `serverActions/` — Next.js server actions used for data fetching/mutations from server components
- `lib/` — core server-side utilities: `Db.ts` (Postgres pool), `Auth.ts` (JWT/session/password helpers), `api-middleware/` (route protection), `AxiosClient.ts`
- `services/` — email sending and templating helpers (`EmailSender`, `CustomEmailSender`, `SendBugReport`)
- `templates/` — HTML email templates (verification code, password reset, first-login, bug report, issue notifications)
- `queries/` — client-side data-fetching functions used with TanStack Query
- `store/` — Zustand stores for client UI state (alerts, overlays, sidebar, active tab, search, DB status, etc.)
- `contexts/` — `UserContext` for the current authenticated user
- `hooks/` — shared React hooks (auth sync, focus trapping, iframe/embed detection, scroll, row count)
- `utils/` — small shared helpers (validators, slug generation, API error handling)
- `css/` — global styles and Tailwind configuration
- `proxy.ts` — auth-aware routing (redirects unauthenticated users away from `/dashboard`, redirects authenticated users away from auth pages)

Notable API routes under `app/api` include: `get-issues`, `post-issue`, `update-status`, `reassign-issue`, `escalate-issue`, `reopen-issue`, `post-comment`, `get-comments`, `login`, `register`, `first-login`, `reset-password`, `sso/microsoft/*`, `sso/external`, `superadmin/*` (user, issue-type, and group-email management), `excel-export`, `export-users`, `attachments/[uuid]`, `triggers/issues-reminder`, `triggers/autoclose-issues`, and `healthcheck`.

## Roles & permissions

- **user** — submits and views their own issues, reads articles
- **agent** — works issues assigned to them within their department/issue type
- **admin** — manages issues, agents, and issue-type mappings for their department; can access the Automations and IT Team pages
- **super admin** (`isSuper`, backed by the `super_admins` table) — full access via the Super Admin panel: manage users, issue types, department-to-agent mappings, and group emails

## Development notes

- This project uses the Next.js App Router with a mix of server actions (`serverActions/`) and REST route handlers (`app/api/*/route.ts`) for server logic.
- The frontend uses `axios` via a shared client in `lib/AxiosClient.ts` for API calls, and TanStack Query for caching/invalidation.
- Email notifications use `nodemailer` with templates in `templates/`; see `services/EmailSender.ts` and `services/CustomEmailSender.ts`.
- Authentication issues short-lived access tokens and longer-lived refresh tokens (`lib/Auth.ts`), both stored as httpOnly cookies; `proxy.ts` enforces route-level auth.
- Scheduled/automated routes (`app/api/triggers/*`) are protected by `CRON_SECRET` and intended to be called by an external scheduler (e.g. a cron job or task scheduler hitting the endpoint with the secret).
