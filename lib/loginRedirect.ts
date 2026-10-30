// Where to send a user after sign-in: the dashboard page they were trying to
// open (?next= on /login), carried through password login, Microsoft SSO and
// SSO registration. Paths are app paths, without the basePath.

export const NEXT_PARAM = "next";

const HOME_PATH = "/dashboard";

// Only same-app /dashboard paths are honoured, so ?next= can't be used as an
// open redirect ("//evil.com", "/\evil.com", "https://...").
export function safeNextPath(value: string | null | undefined): string | null {
  if (!value || !value.startsWith("/") || /^\/[/\\]/.test(value)) return null;

  let url: URL;
  try {
    url = new URL(value, "http://app.invalid");
  } catch {
    return null;
  }
  if (url.origin !== "http://app.invalid") return null;

  const isDashboard =
    url.pathname === HOME_PATH || url.pathname.startsWith(`${HOME_PATH}/`);
  if (!isDashboard) return null;

  // Serialised by URL, so quotes and angle brackets come out percent-encoded
  return `${url.pathname}${url.search}${url.hash}`;
}

// The path to land on after sign-in
export const afterLoginPath = (next: string | null | undefined) =>
  safeNextPath(next) ?? HOME_PATH;

// /login, remembering the page to come back to (the home page needs no ?next=)
export function loginPath(next: string | null | undefined) {
  const safe = safeNextPath(next);
  return safe && safe !== HOME_PATH
    ? `/login?${NEXT_PARAM}=${encodeURIComponent(safe)}`
    : "/login";
}

// The ?next= of the current page, read in the browser
export const nextFromLocation = () =>
  safeNextPath(new URLSearchParams(window.location.search).get(NEXT_PARAM));
