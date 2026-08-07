import apiClient from "@/lib/AxiosClient";
import { AnalyticsIssueDetail } from "@/components/Modules/IssuesAnalytics/types";

export const fetchAnalyticsIssue = async (
  uuid: string,
): Promise<AnalyticsIssueDetail> => {
  const response = await apiClient.get("/analytics/issue", {
    params: { uuid },
  });

  return response.data;
};
