import apiClient from "@/lib/AxiosClient";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import {
  AnalyticsFilterParams,
  AnalyticsSummary,
} from "@/components/Modules/IssuesAnalytics/types";
import { defaultCounts } from "@/public/assets";

const emptySummary: AnalyticsSummary = {
  statusCounts: defaultCounts,
  reopenedCount: 0,
  escalatedCount: 0,
  collaboratedCount: 0,
  avgResolutionSeconds: null,
  avgStaleSeconds: null,
  totalFiltered: 0,
  issueTypeBreakdown: [],
};

export const fetchAnalyticsSummary = async (
  filters: AnalyticsFilterParams | null,
): Promise<AnalyticsSummary> => {
  try {
    const response = await apiClient.get("/analytics/issues-summary", {
      params: { ...filters },
    });
    return response.data;
  } catch (error) {
    const generatedError = getApiErrorMessage(error);
    console.error(generatedError);
    return emptySummary;
  }
};
