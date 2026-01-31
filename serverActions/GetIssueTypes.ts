"use server";

import { query } from "@/lib/Db";
import { unstable_cache } from "next/cache";

export interface IssueOption {
  option: string;
  value: string;
}

export interface IssueAgentMapping {
  agent_name: string;
  username: string;
}

const getIssueTypes = async (department: string) => {
  // Draft the query
  const baseQuery = `SELECT m.issue_type
     FROM issues_mapping AS m
     INNER JOIN users AS u
     ON m.admin_id = u.user_id
     WHERE u.department = $1`;
  const params = [department];

  try {
    const result = await query(baseQuery, params);
    return result;
  } catch (error) {
    console.error("Error fetching issue types", error);
    return [];
  }
};

const getIssueAgentsMapping = async (issueType: string) => {
  const baseQuery = `SELECT m.agent_name, u.username
                  FROM issues_mapping AS m
                  INNER JOIN users AS u
                  ON m.admin_id = u.user_id
                  WHERE m.issue_type = $1 LIMIT 1`;
  try {
    const result = await query(baseQuery, [issueType]);
    return result;
  } catch (error) {
    console.error("Error fetching agent name and admin name:", error);
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
    revalidate: 3600,
    tags: ["Issue_Types"],
  },
);

export const fetchedIssueAgentsMapping = unstable_cache(
  async (issueType: string): Promise<IssueAgentMapping | null> => {
    if (!issueType) return null;

    const data = (await getIssueAgentsMapping(
      issueType,
    )) as IssueAgentMapping[];

    return data.length > 0 ? data[0] : null;
  },
  ["issue_agents_mapping"],
  {
    revalidate: 3600,
    tags: ["Issue_Agents_Mapping"],
  },
);
