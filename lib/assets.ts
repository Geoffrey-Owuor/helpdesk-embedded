import issue_desk_image from "@/public/issue_desk_light.png";
import hotpoint_black_logo from "@/public/hotpoint_black_logo.png";

export const assets = {
  issue_desk_image,
  hotpoint_black_logo,
};

// get current year value and export it
const currentYear = new Date().getFullYear();

export { currentYear };

// Function that receives username
// And generates a capitalized abbreviation from it
// Using a simple regex version
export const abbreviateUserName = (username: string | undefined) => {
  if (!username) return;
  return username.replace(/[^A-Z]/g, "");
};

// Title helper for converting values to string
export const titleHelper = (value: IssueValueTypes | null | undefined) => {
  if (!value) return "";

  return value.toString();
};

// Handling cases where issue type is other and later other issue types that require formatting
// The short-code -> long-name mapping now lives in the database (issues_mapping.long_name),
// fetched via serverActions/GetIssueTypes.ts. Callers build a { shortCode: longName } map from
// that data (IssueOption[]) and pass it in here instead of relying on a static lookup.
export const generateValueType = (
  value: string,
  issueTypeMap?: Record<string, string>,
) => {
  if (!value) return "";

  return issueTypeMap?.[value] || value;
};

// Date formatter to format date for the ui
export const dateFormatter = (
  dateString: IssueValueTypes | null | undefined,
) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Default page size for server-side paginated issue queries
export const DEFAULT_PAGE_SIZE = 25;

export type IssueValueTypes = string | number;

// Issue Cards Count Types
export interface PriorityBreakdown {
  total: number;
  low: number;
  medium: number;
  high: number;
  critical: number;
}

export interface DataCounts {
  inProgress: PriorityBreakdown;
  open: PriorityBreakdown;
  resolved: PriorityBreakdown;
  closed: PriorityBreakdown;
}

const defaultBreakdown: PriorityBreakdown = {
  total: 0,
  low: 0,
  medium: 0,
  high: 0,
  critical: 0,
};

export const defaultCounts: DataCounts = {
  inProgress: { ...defaultBreakdown },
  open: { ...defaultBreakdown },
  resolved: { ...defaultBreakdown },
  closed: { ...defaultBreakdown },
};

// User Count Types
export interface UserCountBreakdown {
  total: number;
  active: number;
  inactive: number;
  // Active accounts locked after too many failed sign-ins
  locked: number;
}
export const defaultUserCountBreakdown: UserCountBreakdown = {
  total: 0,
  active: 0,
  inactive: 0,
  locked: 0,
};

export interface UserCounts {
  totals: UserCountBreakdown;
  agents: UserCountBreakdown;
  admins: UserCountBreakdown;
  normalUsers: UserCountBreakdown;
}
export const DefaultUserCounts: UserCounts = {
  totals: { ...defaultUserCountBreakdown },
  agents: { ...defaultUserCountBreakdown },
  admins: { ...defaultUserCountBreakdown },
  normalUsers: { ...defaultUserCountBreakdown },
};

// Issues Count Types
export interface IssuesMappingCounts {
  low: number;
  medium: number;
  high: number;
  critical: number;
}

export const DefaultIssuesMappingCounts: IssuesMappingCounts = {
  low: 0,
  medium: 0,
  high: 0,
  critical: 0,
};

export const AppVersion = "v2.0";

// Status Options
export const statusOptions = [
  { label: "Open", value: "open" },
  { label: "In Progress", value: "in progress" },
  { label: "Resolved", value: "resolved" },
  { label: "Closed", value: "closed" },
];

// Priority Options
export const priorityOptions = [
  { label: "Critical", value: "Critical" },
  { label: "High", value: "High" },
  { label: "Medium", value: "Medium" },
  { label: "Low", value: "Low" },
];

// Public support address shown in the home page footer and CTA
export const HELPDESK_EMAIL = "helpdesk@hotpoint.co.ke";

export const footerQuickLinks = [
  { label: "Changelog", href: "/changelog" },
  { label: "Manual", href: "/manual" },
  { label: "Knowledge Base", href: "/articles" },
];
