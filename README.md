# HelpDesk

A centralized issue-tracking and knowledge-base portal built with Next.js (App Router). Users submit issues, which are routed by department/issue-type to the right agent, tracked through a status workflow (pending → in-progress → resolved/escalated → closed → reopened), and backed by a searchable article/FAQ library, in-app notifications, and email alerts. It supports local email/password login, Microsoft Entra ID (Azure AD) SSO, and signed-link SSO for embedding the app inside another portal.

Tech

- Next.js 16 (App Router), React 19, Tailwind CSS 4, PostgreSQL (`pg`), TanStack Query, Zustand, jose (JWT), Nodemailer, Microsoft Entra ID / MSAL, ExcelJS

Scripts

- `npm run dev`, `npm run build`, `npm run start`, `npm run lint`

See the `app/`, `components/`, `serverActions/`, `lib/`, and `services/` folders for implementation details.

The extended `README.md` file can be found in the `docs/` folder.
