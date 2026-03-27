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

    if (queryOptions.selectedFilter === "status" && queryOptions.status) {
      url += `&status=${encodeURIComponent(queryOptions.status)}`;
    } else if (
      queryOptions.selectedFilter === "reference" &&
      queryOptions.reference
    ) {
      url += `&reference=${encodeURIComponent(queryOptions.reference.trim())}`;
    } else if (
      queryOptions.selectedFilter === "date" &&
      queryOptions.fromDate &&
      queryOptions.toDate
    ) {
      url += `&fromDate=${queryOptions.fromDate}&toDate=${queryOptions.toDate}`;
    } else if (
      queryOptions.selectedFilter === "department" &&
      queryOptions.department
    ) {
      url += `&department=${encodeURIComponent(queryOptions.department)}`;
    } else if (queryOptions.selectedFilter === "agent" && queryOptions.agent) {
      url += `&agent=${encodeURIComponent(queryOptions.agent.trim())}`;
    } else if (
      queryOptions.selectedFilter === "type" &&
      queryOptions.issueType
    ) {
      url += `&type=${encodeURIComponent(queryOptions.issueType.trim())}`;
    } else if (
      queryOptions.selectedFilter === "priority" &&
      queryOptions.issuePriority
    ) {
      url += `&priority=${encodeURIComponent(queryOptions.issuePriority)}`;
    } else if (
      queryOptions.selectedFilter === "submitter" &&
      queryOptions.submitter
    ) {
      url += `&submitter=${encodeURIComponent(queryOptions.submitter.trim())}`;
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
