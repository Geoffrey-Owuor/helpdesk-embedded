# Issue Desk

Issue Desk is a lightweight, centralized issue-tracking application for teams to collect, assign, and track user-reported issues. It uses the Next.js App Router, Tailwind CSS for styling, and Postgres for persistence.

## Key Features

- Centralized dashboard for user-reported issues
- Assign issues to team members and track ownership
- Issue status workflow (Open, In Progress, Resolved)
- Modern React UI with Tailwind CSS and `lucide-react` icons
- Server routes (API) for issues, comments, authentication, and automations

## Tech Stack

- Next.js (App Router)
- React
- Tailwind CSS
- PostgreSQL
- Axios for client HTTP
- nodemailer for email notifications

## Quick Start (local development)

Prerequisites:

- Node.js 18+ installed
- A running PostgreSQL instance and a database available for the app

Setup:

1. Install dependencies

```bash
npm install
```

2. Create a `.env.local` in the project root and set required environment variables (example below).

3. Start the development server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### Example environment variables

```env
# Postgres connection
DATABASE_URL=postgres://user:password@localhost:5432/issue_desk_db

# App configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Optional: email for notifications
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_user
SMTP_PASS=your_password

# Optional: application secret for signing tokens
APP_SECRET=replace_with_secure_random_value
```

Note: The repository does not include a migration tool by default—create the database and tables required by your environment. Check `lib/Db.ts` for the connection logic used by the app.

## Available NPM scripts

- `npm run dev` — Run Next.js in development mode
- `npm run build` — Build the production application
- `npm run start` — Start the production server after build
- `npm run lint` — Run ESLint

## Project structure (high level)

- `app/` — Next.js App Router pages and route handlers; contains the UI and API route folders
- `components/` — Reusable React components used by pages
- `api/` — Server route handlers (API endpoints) under `app/api` and `app/api/*/route.ts`
- `lib/` — Utilities and shared helpers (DB connection, auth, API client)
- `services/` — Background services such as email templates and helpers
- `contexts/` and `hooks/` — React contexts and custom hooks used in the app
- `styles/` or `css/` — Global styles and Tailwind configuration

Notable server routes are implemented under `app/api` and include endpoints for issues, comments, authentication, automations, and status updates (for example: `get-issues`, `post-issue`, `post-comment`, `login`, `register`, `update-status`).

## Development notes

- This project uses the Next.js App Router and server actions for API logic. Review files under `app/` and `api/` to locate route handlers.
- The frontend uses `axios` via a shared client in `lib/AxiosClient.ts` — adjust base URLs or middleware as needed.
- Email notifications use `nodemailer` and templates located in `templates/`.

## Contributing

1. Fork the repository and create a feature branch
2. Open a pull request describing your changes
3. Keep changes focused and add documentation where helpful

## Troubleshooting

- If the app cannot connect to the database, confirm `DATABASE_URL` and that Postgres is running and reachable.
- Check server console output for route-specific errors. Look at `app/api/*/route.ts` handlers for server-side logic.

## License

No license is specified in this repository. Add a `LICENSE` file if you intend to make the project public under a specific license.
