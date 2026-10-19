// Staff departments and their issue reference prefixes
// (migrations/006_departments.sql) - the departments users belong to, not
// the ones issues are raised to (those stay in group_emails). Server side
// only: the forms load them through serverActions/GetDepartments.ts.
import { unstable_cache } from "next/cache";
import { query } from "@/lib/Db";

export interface Department {
  name: string;
  prefix: string;
  isActive: boolean;
}

// Every department, inactive ones included, in their original order. Throws
// if the database can't be read (nothing is cached then), so a route never
// validates against an empty list.
export const loadDepartments = unstable_cache(
  async (): Promise<Department[]> =>
    query<Department>(
      `SELECT department_name AS name, issue_prefix AS prefix,
       is_active AS "isActive"
       FROM public.departments ORDER BY id ASC`,
    ),
  ["departments_data"],
  { revalidate: 3600, tags: ["Departments_Data"] },
);

export const INVALID_DEPARTMENT_MESSAGE =
  "The selected department is not available, please select another department";

const findDepartment = (departments: Department[], name: unknown) =>
  typeof name === "string"
    ? departments.find(
        (department) =>
          department.name.toLowerCase() === name.trim().toLowerCase(),
      )
    : undefined;

// The department's stored spelling when a user may be given it: an active
// department, or the one they already have (editing a user may keep a
// department made inactive since). Null otherwise.
export async function resolveDepartmentName(
  name: unknown,
  currentDepartment: string | null = null,
): Promise<string | null> {
  const department = findDepartment(await loadDepartments(), name);
  if (!department) return null;
  if (!department.isActive && department.name !== currentDepartment) {
    return null;
  }
  return department.name;
}

// The stored spelling of a department name from another source (the HR
// records in company_user_records spell some differently, e.g.
// "Hr & Admin"), or the name unchanged when it isn't a known department
export async function canonicalDepartmentName(name: string): Promise<string> {
  return findDepartment(await loadDepartments(), name)?.name ?? name;
}

// "RTL" for Retail - the start of an issue reference. "UNK" for a
// department missing from the table.
export async function issuePrefixFor(name: string): Promise<string> {
  return findDepartment(await loadDepartments(), name)?.prefix ?? "UNK";
}
