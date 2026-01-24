"use server";

import { query } from "@/lib/Db";
import { unstable_cache } from "next/cache";

export interface IssueOption {
  option: string;
  value: string;
}

const getIssueTypes = async (department: string) => {
  // Draft the query
  const baseQuery = `SELECT issue_type FROM issues_mapping
    WHERE agent_department = $1`;
  const params = [department];

  try {
    const result = await query(baseQuery, params);
    return result;
  } catch (error) {
    console.error("Error fetching issue types", error);
    return [];
  }
};

export const fetchedIssueTypes = unstable_cache(
  async (department: string): Promise<IssueOption[]> => {
    // Return empty immediately if no department to save DB calls
    if (!department) return [];
    const data = await getIssueTypes(department);

    // Transform the data into our desired format
    return data.map((item) => ({
      option: item.issue_type,
      value: item.issue_type,
    }));
  },
  ["issue_types_by_dept"],
  {
    revalidate: 10800,
    tags: ["Issue_Types"],
  },
);
