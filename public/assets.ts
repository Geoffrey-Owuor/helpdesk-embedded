import issue_desk_image from "./issue_desk_light.png";
import hotpoint_black_logo from "./hotpoint_black_logo.png";

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
export const titleHelper = (value: IssueValueTypes) => {
  if (!value) return "";

  return value.toString();
};

// Handling cases where issue type is other and later other issue types that require formatting
export const generateValueType = (value: string) => {
  if (value.includes("Other")) return "Other Issue";
  else return value;
};

// Date formatter to format date for the ui
export const dateFormatter = (dateString: IssueValueTypes) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// export our departments
export const baseDepartments = [
  { option: "IT & Projects", value: "IT & Projects" },
  { option: "Finance", value: "Finance" },
  { option: "Marketing", value: "Marketing" },
  { option: "Operations", value: "Operations" },
  { option: "Commercial", value: "Commercial" },
  { option: "HR & Admin", value: "HR & Admin" },
  { option: "Modern Trade", value: "Modern Trade" },
  { option: "Retail", value: "Retail" },
  { option: "B2B", value: "B2B" },
  { option: "Internal Audit", value: "Internal Audit" },
  { option: "Engineering & HVAC", value: "Engineering & HVAC" },
  { option: "Security", value: "Security" },
  { option: "Directorate", value: "Directorate" },
];

export const DEFAULT_FETCH_OPTIONS = { selectedFilter: "status", status: "" };

export type IssueValueTypes = string | number;

export interface Options {
  selectedFilter?: string;
  fromDate?: string;
  toDate?: string;
  status?: string;
  reference?: string;
  department?: string;
  agent?: string;
  issueType?: string;
  issuePriority?: string;
  submitter?: string;
}

// Issue Cards Count Types
export interface PriorityBreakdown {
  total: number;
  low: number;
  medium: number;
  high: number;
  critical: number;
}

export interface DataCounts {
  totals: PriorityBreakdown;
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
  totals: { ...defaultBreakdown },
  open: { ...defaultBreakdown },
  resolved: { ...defaultBreakdown },
  closed: { ...defaultBreakdown },
};

// User Count Types
export interface UserCountBreakdown {
  total: number;
  active: number;
  inactive: number;
}
export const defaultUserCountBreakdown: UserCountBreakdown = {
  total: 0,
  active: 0,
  inactive: 0,
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
