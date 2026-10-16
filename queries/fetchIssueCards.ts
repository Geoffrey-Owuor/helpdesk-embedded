import { DataCounts, defaultCounts } from "@/public/assets";
import apiClient from "@/lib/AxiosClient";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import { IssuesFilterParams } from "@/lib/issues/buildIssuesFilter";
import { IssuesView } from "./fetchIssues";

export const fetchIssueCards = async (
  filters: IssuesFilterParams | null,
  { agentAdminFilter, superAdminFilter }: IssuesView,
): Promise<DataCounts> => {
  try {
    const response = await apiClient.get("/issues-cards", {
      params: {
        ...filters,
        ...(superAdminFilter ? { superAdminFilter: "superAdminFilter" } : {}),
        ...(agentAdminFilter === "agentAdminFilter" ? { agentAdminFilter } : {}),
      },
    });
    return response.data;
  } catch (error) {
    const errorMessage = getApiErrorMessage(error);
    console.error(errorMessage);
    return defaultCounts;
  }
};
