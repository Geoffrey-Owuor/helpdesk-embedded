import apiClient from "@/lib/AxiosClient";
import { useSearchStore } from "@/store/useSearchStore";
import { IssueValueTypes } from "@/public/assets";

export type IssueDetail = Record<string, IssueValueTypes>;

export const fetchIssue = async (uuid: string): Promise<IssueDetail> => {
  const agentAdminFilter = useSearchStore.getState().agentAdminFilter;
  const superAdminFilter = useSearchStore.getState().superAdminFilter;

  const response = await apiClient.get("/get-issue", {
    params: {
      uuid,
      ...(superAdminFilter ? { superAdminFilter: "superAdminFilter" } : {}),
      ...(agentAdminFilter === "agentAdminFilter" ? { agentAdminFilter } : {}),
    },
  });

  return response.data;
};
