import apiClient from "@/lib/AxiosClient";
import { useSearchStore } from "@/store/useSearchStore";
import { IssueValueTypes } from "@/public/assets";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import { DEFAULT_FETCH_OPTIONS } from "@/public/assets";
import { Options } from "@/public/assets";

export const fetchIssues = async (
  options: Options,
): Promise<Record<string, IssueValueTypes>[]> => {
  // Use provided options or fall back to the default options
  const queryOptions = options || DEFAULT_FETCH_OPTIONS;

  const agentAdminFilter = useSearchStore.getState().agentAdminFilter;
  const superAdminFilter = useSearchStore.getState().superAdminFilter;

  try {
    let url = `/get-issues/?selectedFilter=${queryOptions.selectedFilter || "status"}`;

    // Check if the super admin filter is enabled
    if (superAdminFilter) {
      const filterValue = "superAdminFilter";
      url += `&superAdminFilter=${filterValue}`;
    }
    // Check if we have the agent admin filter enabled
    if (agentAdminFilter === "agentAdminFilter") {
      url += `&agentAdminFilter=${agentAdminFilter}`;
    }

    // Extend the server-side query limit past the default cap when requested
    if (queryOptions.recordsLimit) {
      url += `&limit=${queryOptions.recordsLimit}`;
    }

    // Fetch a response with the built url
    const response = await apiClient.get(url);

    return response.data;
  } catch (error) {
    const generatedError = getApiErrorMessage(error);
    console.error(generatedError);
    return [];
  }
};
