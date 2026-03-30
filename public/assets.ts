import issue_desk_logo from "./web-app-manifest-512x512.png";
import issue_desk_image from "./issue_desk_light.png";

export const assets = {
  issue_desk_logo,
  issue_desk_image,
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

// Date formatter to format date for the ui
export const dateFormatter = (dateString: IssueValueTypes) => {
  if (!dateString) return "dd/mm/yy";
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

export interface PriorityBreakdown {
  total: number;
  low: number;
  medium: number;
  high: number;
  critical: number;
}

export interface DataCounts {
  totals: number;
  pending: PriorityBreakdown;
  inProgress: PriorityBreakdown;
  resolved: PriorityBreakdown;
  unfeasible: PriorityBreakdown;
}

const defaultBreakdown: PriorityBreakdown = {
  total: 0,
  low: 0,
  medium: 0,
  high: 0,
  critical: 0,
};

export const defaultCounts: DataCounts = {
  totals: 0,
  pending: { ...defaultBreakdown },
  inProgress: { ...defaultBreakdown },
  resolved: { ...defaultBreakdown },
  unfeasible: { ...defaultBreakdown },
};

export interface UserCounts {
  totals: number;
  agents: number;
  admins: number;
  normalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
}
export const DefaultUserCounts: UserCounts = {
  totals: 0,
  agents: 0,
  admins: 0,
  normalUsers: 0,
  activeUsers: 0,
  inactiveUsers: 0,
};
