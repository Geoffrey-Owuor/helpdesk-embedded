"use server";

import { query } from "@/lib/Db";
import { unstable_cache } from "next/cache";

interface DropdownOption {
  option: string;
  value: string;
}

const getBaseDepartments = async (): Promise<DropdownOption[]> => {
  const result = await query(
    `SELECT id, department FROM group_emails ORDER BY id ASC`,
  );

  const departments = result.length === 0 ? [] : result;

  return departments.map((department) => ({
    option: department.department,
    value: department.department,
  }));
};

export const fetchedBaseDepartments = unstable_cache(
  getBaseDepartments,
  ["basedepartments_data"],
  { revalidate: 3600, tags: ["BaseDepartments_Data"] },
);
