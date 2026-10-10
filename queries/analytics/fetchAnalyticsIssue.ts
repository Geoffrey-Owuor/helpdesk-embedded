import apiClient from "@/lib/AxiosClient";
import { IssueDetail } from "@/queries/fetchIssue";

export const fetchAnalyticsIssue = async (
  uuid: string,
): Promise<IssueDetail> => {
  const response = await apiClient.get("/analytics/issue", {
    params: { uuid },
  });

  return response.data;
};
