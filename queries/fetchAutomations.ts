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

    // Fetch a response with the built url
    const response = await apiClient.get(apiUrl);

    return response.data;
  } catch (error) {
    const errorMessage = getApiErrorMessage(error);
    console.error(errorMessage);
    return [];
  }
};
