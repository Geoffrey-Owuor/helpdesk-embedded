import apiClient from "@/lib/AxiosClient";
import { AnalyticsIssueDetail } from "@/components/Modules/IssuesAnalytics/types";

export const fetchAnalyticsIssueDetail = async (
  uuid: string,
): Promise<AnalyticsIssueDetail> => {
  const response = await apiClient.get("/analytics/issue-detail", {
    params: { uuid },
  });
  return response.data;
};
