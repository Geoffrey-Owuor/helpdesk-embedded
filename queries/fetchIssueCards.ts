import { DataCounts, defaultCounts } from "@/public/assets";
import apiClient from "@/lib/AxiosClient";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import { useSearchStore } from "@/store/useSearchStore";

export const fetchIssueCards = async (): Promise<DataCounts> => {
  const agentAdminFilter = useSearchStore.getState().agentAdminFilter;
  const superAdminFilter = useSearchStore.getState().superAdminFilter;

  try {
    let apiUrl = `/issues-cards`;

    const filters = [];

    if (superAdminFilter) {
      filters.push("superAdminFilter=superAdminFilter");
    }

    if (agentAdminFilter === "agentAdminFilter") {
      filters.push(`agentAdminFilter=${agentAdminFilter}`);
    }

    if (filters.length) {
      apiUrl += `?${filters.join("&")}`;
    }
    const response = await apiClient.get(apiUrl);
    return response.data;
  } catch (error) {
    const errorMessage = getApiErrorMessage(error);
    console.error(errorMessage);
    return defaultCounts;
  }
};
