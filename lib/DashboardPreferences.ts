// Dashboard view preferences that change what the first render looks like or
// fetches. They live in cookies (not localStorage) so the dashboard layout can
// read them on the server and render the same UI the client will hydrate.

export const PREFERENCE_COOKIES = {
  showSidebar: "helpdesk_sidebar",
  isTableView: "helpdesk_table_view",
  agentAdminFilter: "helpdesk_agent_admin_filter",
  superAdminFilter: "helpdesk_super_admin_filter",
} as const;

export type DashboardPreferences = {
  showSidebar: boolean;
  isTableView: boolean;
  // "agentAdminFilter" = own submissions, "" = incoming/assigned issues
  agentAdminFilter: string;
  superAdminFilter: boolean;
};

export const defaultPreferences: DashboardPreferences = {
  showSidebar: true,
  isTableView: false,
  agentAdminFilter: "",
  superAdminFilter: false,
};

type CookieReader = { get: (name: string) => { value: string } | undefined };

// Missing or unexpected cookie values fall back to the defaults
export const readPreferences = (cookies: CookieReader): DashboardPreferences => {
  const flag = (name: string, fallback: boolean) => {
    const value = cookies.get(name)?.value;
    return value === "1" ? true : value === "0" ? false : fallback;
  };

  return {
    showSidebar: flag(PREFERENCE_COOKIES.showSidebar, defaultPreferences.showSidebar),
    isTableView: flag(PREFERENCE_COOKIES.isTableView, defaultPreferences.isTableView),
    agentAdminFilter:
      cookies.get(PREFERENCE_COOKIES.agentAdminFilter)?.value === "agentAdminFilter"
        ? "agentAdminFilter"
        : "",
    superAdminFilter: flag(
      PREFERENCE_COOKIES.superAdminFilter,
      defaultPreferences.superAdminFilter,
    ),
  };
};

const ONE_YEAR = 60 * 60 * 24 * 365;

// Client-only: remembers a preference for the next server render
export const writePreferenceCookie = (
  name: (typeof PREFERENCE_COOKIES)[keyof typeof PREFERENCE_COOKIES],
  value: boolean | string,
) => {
  const encoded =
    typeof value === "boolean" ? (value ? "1" : "0") : encodeURIComponent(value);
  const secure = window.location.protocol === "https:" ? "; secure" : "";
  document.cookie = `${name}=${encoded}; path=/; max-age=${ONE_YEAR}; samesite=lax${secure}`;
};
