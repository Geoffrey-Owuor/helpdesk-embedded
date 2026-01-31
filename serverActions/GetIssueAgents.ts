"use server";
import { query } from "@/lib/Db";
import { unstable_cache } from "next/cache";

export interface IssueAgents {
  issue_type: string;
  agent_name: string;
  agent_email: string;
}

const getIssueAgents = async (adminId: string) => {
  //Creating our base query
  const baseQuery = `
      SELECT 
        agents.username AS agent_name,
        agents.email AS agent_email,
        m.issue_type
        FROM issues_mapping as m
        JOIN users as agents ON m.agent_id = agents.user_id
        WHERE m.admin_id = $1
    `;
  try {
    const result = await query<IssueAgents>(baseQuery, [adminId]);
    return result;
  } catch (error) {
    console.error("Error fetching issue agents:", error);
    return [];
  }
};

export const fetchedIssueAgents = unstable_cache(
  async (adminId: string): Promise<IssueAgents[]> => {
    if (!adminId) return [];
    const data = await getIssueAgents(adminId);

    //return the data
    return data;
  },
  ["get_issue_agents"],
  {
    revalidate: 3600,
    tags: ["GetIssueAgents"],
  },
);
