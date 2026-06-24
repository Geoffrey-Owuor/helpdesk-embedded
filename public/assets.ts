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

// Issue type names object mapping
const ISSUE_TYPE_MAPPING: Record<string, string> = {
  Other: "Other Issue",
  Orion: "Orion",
  "Software Issue": "App or Software Help",
  "Hardware Issue": "Computer & Device Repair",
  "Delivery DMS": "Delivery Management System",
  POS: "Retail POS",
  "Network Issue": "Wi-Fi & Internet Connectivity",
  WMS: "Warehouse Management System",
  FSM: "Field Service Management",
  "Email Access": "Email & Calendar Issues",
  "Printer Access": "Printing & Scanning",
  "Active Directory": "Password Reset / Account Login",
  Qlik: "Qlik",
  RPA: "Robotic Process Automation",
  "Document DMS": "Document Management System",
  "Staff Purchase": "Staff Product Purchase",
  "Requisition Hub": "Requisition Hub",
};

// Handling cases where issue type is other and later other issue types that require formatting
export const generateValueType = (value: string) => {
  const generatedValue = ISSUE_TYPE_MAPPING[value] || value;

  return generatedValue;
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

// Automation type filters
export const AUTOMATION_TYPE_FILTERS = [
  "RPA",
  "Staff Purchase",
  "Requisition Hub",
];

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
  { option: "Service Center", value: "Service Center" },
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

export const AppVersion = "v1.0";

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

export const footerQuickLinks = [
  { label: "Changelog", href: "/changelog" },
  { label: "Manual", href: "/manual" },
  { label: "Knowledge Base", href: "/articles" },
];
