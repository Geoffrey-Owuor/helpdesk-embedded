"use server";
import { query } from "@/lib/Db";
import { unstable_cache } from "next/cache";

export interface IssueAgents {
  issue_type: string;
  agent_name: string;
  agent_email: string;
}

const getIssueAgents = async (department: string) => {
  //Creating our base query
  const baseQuery = `
      SELECT 
        agents.username AS agent_name,
        agents.email AS agent_email,
        -- If issue_type is NULL, display 'No Issues Assigned' instead
        COALESCE(m.issue_type, 'No Issues Assigned') AS issue_type
        FROM users as agents
        LEFT JOIN issues_mapping as m ON agents.user_id = m.agent_id
        WHERE agents.department = $1
    `;
  try {
    const result = await query<IssueAgents>(baseQuery, [department]);
    return result;
  } catch (error) {
    console.error("Error fetching issue agents:", error);
    return [];
  }
};

export const fetchedIssueAgents = unstable_cache(
  async (department: string): Promise<IssueAgents[]> => {
    if (!department) return [];
    const data = await getIssueAgents(department);

    //return the data
    return data;
  },
  ["get_issue_agents"],
  {
    revalidate: 3600,
    tags: ["GetIssueAgents"],
  },
);
