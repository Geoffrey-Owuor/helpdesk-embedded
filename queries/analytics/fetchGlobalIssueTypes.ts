import apiClient from "@/lib/AxiosClient";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";

export const fetchGlobalIssueTypes = async (): Promise<string[]> => {
  try {
    const response = await apiClient.get("/analytics/issue-types");
    return response.data;
  } catch (error) {
    const generatedError = getApiErrorMessage(error);
    console.error(generatedError);
    return [];
  }
};
