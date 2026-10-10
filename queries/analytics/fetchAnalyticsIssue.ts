import apiClient from "@/lib/AxiosClient";
import { IssueDetail } from "@/queries/fetchIssue";

// The issue plus whether the viewer can open it on the issue page itself
export type AnalyticsIssueDetail = IssueDetail & { viewer_can_open: boolean };

export const fetchAnalyticsIssue = async (
  uuid: string,
): Promise<AnalyticsIssueDetail> => {
  const response = await apiClient.get("/analytics/issue", {
    params: { uuid },
  });

  return response.data;
};
