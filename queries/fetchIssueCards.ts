import { DataCounts, defaultCounts } from "@/public/assets";
import apiClient from "@/lib/AxiosClient";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import { useSearchStore } from "@/store/useSearchStore";
import { IssuesFilterParams } from "@/lib/issues/buildIssuesFilter";

export const fetchIssueCards = async (
  filters: IssuesFilterParams | null,
): Promise<DataCounts> => {
  const agentAdminFilter = useSearchStore.getState().agentAdminFilter;
  const superAdminFilter = useSearchStore.getState().superAdminFilter;

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
