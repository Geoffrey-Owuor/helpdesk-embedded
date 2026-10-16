import apiClient from "@/lib/AxiosClient";
import { IssueValueTypes } from "@/public/assets";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import { IssuesFilterParams } from "@/lib/issues/buildIssuesFilter";

export interface IssuesResponse {
  rows: Record<string, IssueValueTypes>[];
  total: number;
  page: number;
  pageSize: number;
}

// Which slice of issues to show - passed in by the caller, which already has
// these values in its query key, so the request always matches the key
export interface IssuesView {
  agentAdminFilter: string;
  superAdminFilter: boolean;
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
  { agentAdminFilter, superAdminFilter }: IssuesView,
): Promise<IssuesResponse> => {
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
