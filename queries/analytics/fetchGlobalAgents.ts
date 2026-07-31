import apiClient from "@/lib/AxiosClient";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import { GlobalAgentOption } from "@/components/Modules/IssuesAnalytics/types";

export const fetchGlobalAgents = async (): Promise<GlobalAgentOption[]> => {
  try {
    const response = await apiClient.get("/analytics/agents");
    return response.data;
  } catch (error) {
    const generatedError = getApiErrorMessage(error);
    console.error(generatedError);
    return [];
  }
};
