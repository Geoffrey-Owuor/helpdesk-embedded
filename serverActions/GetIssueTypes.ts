"use server";

import { query } from "@/lib/Db";
import { unstable_cache } from "next/cache";

export interface IssueOption {
  option: string;
  value: string;
}

export interface IssueAgentMapping {
  agent_name: string;
  admin_name: string;
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

const getIssueAgentsMapping = async (issueType: string, department: string) => {
  const baseQuery = `SELECT
                     agents.username AS agent_name,
                     admins.username AS admin_name
                     FROM issues_mapping AS m
                     JOIN users AS agents ON m.agent_id = agents.user_id
                     JOIN users AS admins ON m.admin_id = admins.user_id
                     WHERE m.issue_type = $1 AND admins.department = $2 AND agents.department = $2 LIMIT 1`;
  try {
    const result = await query(baseQuery, [issueType, department]);
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
  async (
    issueType: string,
    department: string,
  ): Promise<IssueAgentMapping | null> => {
    if (!issueType || !department) return null;

    const data = (await getIssueAgentsMapping(
      issueType,
      department,
    )) as IssueAgentMapping[];

    return data.length > 0 ? data[0] : null;
  },
  ["issue_agents_mapping"],
  {
    revalidate: 3600,
    tags: ["Issue_Agents_Mapping"],
  },
);
