import apiClient from "@/lib/AxiosClient";
import {
  AnalyticsFilterParams,
  AnalyticsSla,
} from "@/components/Modules/IssuesAnalytics/types";

// Unlike the summary fetcher this throws on failure: zero counts would read
// as "0% within SLA", so the SLA section shows an error instead
export const fetchAnalyticsSla = async (
  filters: AnalyticsFilterParams | null,
): Promise<AnalyticsSla> => {
  const response = await apiClient.get("/analytics/sla", {
    params: { ...filters },
  });
  return response.data;
};
