import apiClient from "@/lib/AxiosClient";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import {
  AnalyticsFilterParams,
  AnalyticsIssuesResponse,
} from "@/components/Modules/IssuesAnalytics/types";

export const fetchAnalyticsIssues = async (
  filters: AnalyticsFilterParams | null,
  page: number,
  pageSize: number,
): Promise<AnalyticsIssuesResponse> => {
  try {
    const response = await apiClient.get("/analytics/issues", {
      params: { ...filters, page, pageSize },
    });
    return response.data;
  } catch (error) {
    const generatedError = getApiErrorMessage(error);
    console.error(generatedError);
    return { rows: [], total: 0, page, pageSize };
  }
};
