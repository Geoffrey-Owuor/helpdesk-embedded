import apiClient from "@/lib/AxiosClient";
import { useSearchStore } from "@/store/useSearchStore";
import { IssueValueTypes } from "@/public/assets";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import { IssuesFilterParams } from "@/lib/issues/buildIssuesFilter";

export interface IssuesResponse {
  rows: Record<string, IssueValueTypes>[];
  total: number;
  page: number;
  pageSize: number;
}

const emptyResponse = (page: number, pageSize: number): IssuesResponse => ({
  rows: [],
  total: 0,
  page,
  pageSize,
});

export const fetchIssues = async (
  filters: IssuesFilterParams | null,
  page: number,
  pageSize: number,
): Promise<IssuesResponse> => {
  const agentAdminFilter = useSearchStore.getState().agentAdminFilter;
  const superAdminFilter = useSearchStore.getState().superAdminFilter;

  try {
    const response = await apiClient.get("/get-issues", {
      params: {
        ...filters,
        page,
        pageSize,
        ...(superAdminFilter ? { superAdminFilter: "superAdminFilter" } : {}),
        ...(agentAdminFilter === "agentAdminFilter" ? { agentAdminFilter } : {}),
      },
    });

    return response.data;
  } catch (error) {
    const generatedError = getApiErrorMessage(error);
    console.error(generatedError);
    return emptyResponse(page, pageSize);
  }
};
