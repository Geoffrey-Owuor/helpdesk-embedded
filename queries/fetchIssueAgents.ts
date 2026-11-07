import apiClient from "@/lib/AxiosClient";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import type { IssueAgentOption } from "@/app/api/issue-agents/route";
import { IssuesView } from "./fetchIssues";

export type { IssueAgentOption };

// The agents and collaborators on the issues in this view - see /issue-agents
export const fetchIssueAgents = async ({
  agentAdminFilter,
  superAdminFilter,
}: IssuesView): Promise<IssueAgentOption[]> => {
  try {
    const response = await apiClient.get("/issue-agents", {
      params: {
        ...(superAdminFilter ? { superAdminFilter: "superAdminFilter" } : {}),
        ...(agentAdminFilter === "agentAdminFilter" ? { agentAdminFilter } : {}),
      },
    });
    return response.data;
  } catch (error) {
    console.error(getApiErrorMessage(error));
    return [];
  }
};
