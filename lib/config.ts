// Deployment-specific values, read from environment variables in one place so
// none of them is hard-coded in the (public) repo. See .env.example for the list.
//
// NEXT_PUBLIC_* values are inlined into the browser bundle by `next build`, so
// they must be set when the app is built, not only when it starts. Each one is
// read as a literal `process.env.NEXT_PUBLIC_...` for that inlining to work.
// next.config.ts imports this file too, so keep it free of app imports.

// The sub-path the app is served under (e.g. "/helpdesk"), "" at the root.
// Use lib/basePath.ts for it and the URL helpers built on it.
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

// Public origin of the app (e.g. "https://apps.example.com")
export const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

// The Apps Hub that HelpDesk is launched from; the hub link is hidden when this isn't set
export const hubUrl = process.env.NEXT_PUBLIC_HUB_URL || "";

// The email domain accounts must belong to (e.g. "example.com"). Checked in the
// browser and again on the server. When it isn't set, no email passes the check.
export const companyEmailDomain = (
  process.env.NEXT_PUBLIC_COMPANY_EMAIL_DOMAIN || ""
)
  .trim()
  .replace(/^@/, "")
  .toLowerCase();

// Placeholder text for email inputs: emailPlaceholder("you") -> "you@example.com"
export const emailPlaceholder = (localPart = "you") =>
  `${localPart}@${companyEmailDomain || "company.com"}`;

// The support address behind the "Email IT" links; they're hidden when this isn't set
export const helpdeskEmail = process.env.NEXT_PUBLIC_HELPDESK_EMAIL || "";

// Extra hosts that may load the dev server (e.g. a phone on the LAN), comma-separated.
// Server-side only: read by next.config.ts, never needed in the browser.
export const devAllowedOrigins = (process.env.DEV_ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
