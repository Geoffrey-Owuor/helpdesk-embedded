// Types and field styles shared by the Staff Records modal's parts

// A row of public.company_user_records (app/api/superadmin/company-records)
export interface StaffRecord {
  id: number;
  name: string;
  email: string;
  department: string;
  isActive: boolean;
  // The person already has a HelpDesk account under this email
  hasAccount: boolean;
  // False when the department isn't in the staff Departments list
  departmentKnown: boolean;
}

// An active account that has no staff record yet
export interface MissingAccount {
  userId: string;
  name: string;
  email: string;
  department: string;
  role: string;
  // A record can only take an active department
  departmentAvailable: boolean;
}

export interface StaffRecordsData {
  records: StaffRecord[];
  missingAccounts: MissingAccount[];
}

export interface RecordDetails {
  name: string;
  email: string;
  department: string;
}

export const recordsQueryKey = ["superadminCompanyRecords"];

export const inputStyles =
  "w-full rounded-xl border border-neutral-300 bg-white py-2.5 pr-3.5 pl-9 text-sm text-neutral-900 shadow-sm transition-all duration-150 placeholder:text-neutral-400 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-neutral-500 dark:focus:ring-neutral-700";

export const labelStyles =
  "flex items-center gap-1 text-sm font-medium text-neutral-700 dark:text-neutral-300";

export const cancelButtonStyles =
  "rounded-xl px-4 py-2.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 focus:ring-2 focus:ring-neutral-300 focus:outline-none sm:py-2 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:focus:ring-neutral-700";

export const primaryButtonStyles =
  "inline-flex items-center justify-center gap-1.5 rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-neutral-700 focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 focus:outline-none disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 dark:focus:ring-white dark:focus:ring-offset-neutral-950";

export const secondaryButtonStyles =
  "inline-flex items-center justify-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 focus:ring-2 focus:ring-neutral-300 focus:outline-none disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:focus:ring-neutral-700";

export const cardStyles =
  "rounded-xl border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900";

export const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? "" : "s"}`;
