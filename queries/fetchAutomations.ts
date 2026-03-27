import apiClient from "@/lib/AxiosClient";
import { useSearchStore } from "@/store/useSearchStore";
import { IssueValueTypes } from "@/public/assets";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import { DEFAULT_FETCH_OPTIONS } from "@/public/assets";
import { Options } from "@/public/assets";

export const fetchAutomations = async (
  options: Options,
): Promise<Record<string, IssueValueTypes>[]> => {
  // Use provided options or fall back to the default options
  const queryOptions = options || DEFAULT_FETCH_OPTIONS;

  const selectedDepartment = useSearchStore.getState().selectedDepartment;

  try {
    let apiUrl = `/get-automations/?selectedFilter=${queryOptions.selectedFilter || "status"}`;

    // first, check if we have a department selected
    if (selectedDepartment) {
      apiUrl += `&departmentFilter=${encodeURIComponent(selectedDepartment)}`;
    }

    if (queryOptions.selectedFilter === "status" && queryOptions.status) {
      apiUrl += `&status=${encodeURIComponent(queryOptions.status)}`;
    } else if (
      queryOptions.selectedFilter === "reference" &&
      queryOptions.reference
    ) {
      apiUrl += `&reference=${encodeURIComponent(queryOptions.reference.trim())}`;
    } else if (
      queryOptions.selectedFilter === "date" &&
      queryOptions.fromDate &&
      queryOptions.toDate
    ) {
      apiUrl += `&fromDate=${queryOptions.fromDate}&toDate=${queryOptions.toDate}`;
    } else if (queryOptions.selectedFilter === "agent" && queryOptions.agent) {
      apiUrl += `&agent=${encodeURIComponent(queryOptions.agent.trim())}`;
    } else if (
      queryOptions.selectedFilter === "priority" &&
      queryOptions.issuePriority
    ) {
      apiUrl += `&priority=${encodeURIComponent(queryOptions.issuePriority)}`;
    } else if (
      queryOptions.selectedFilter === "submitter" &&
      queryOptions.submitter
    ) {
      apiUrl += `&submitter=${encodeURIComponent(queryOptions.submitter.trim())}`;
    }

    // Fetch a response with the built url
    const response = await apiClient.get(apiUrl);

    return response.data;
  } catch (error) {
    const errorMessage = getApiErrorMessage(error);
    console.error(errorMessage);
    return [];
  }
};
