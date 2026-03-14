import { create } from "zustand";
import apiClient from "@/lib/AxiosClient";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import { useSearchStore } from "./useSearchStore";

export const DEFAULT_FETCH_OPTIONS = { selectedFilter: "status", status: "" };

export type IssueValueTypes<T extends string | number = string | number> = T;

export interface Options {
  selectedFilter?: string;
  fromDate?: string;
  toDate?: string;
  status?: string;
  reference?: string;
  department?: string;
  agent?: string;
  issueType?: string;
  issuePriority?: string;
  submitter?: string;
  agentAdminFilter?: string;
}

interface IssuesDataStore {
  issuesData: Record<string, IssueValueTypes>[];
  loading: boolean;
  fetchIssues: (options: Options) => Promise<void>;
  refetchIssues: () => Promise<void>;
}

export const useIssuesStore = create<IssuesDataStore>()((set, get) => ({
  // states
  loading: true,
  issuesData: [],

  // Actions
  fetchIssues: async (options) => {
    // Use provided options or fall back to the default options
    const queryOptions = options || DEFAULT_FETCH_OPTIONS;

    const agentAdminFilter = useSearchStore.getState().agentAdminFilter;
    const superAdminFilter = useSearchStore.getState().superAdminFilter;

    set({ loading: true });

    try {
      let url = `/get-issues/?selectedFilter=${queryOptions.selectedFilter || "status"}`;

      // Check if the super admin filter is enabled
      if (superAdminFilter) {
        const filterValue = "superAdminFilter";
        url += `&superAdminFilter=${filterValue}`;
      }
      // Check if we have the agent admin filter enabled
      if (agentAdminFilter === "agentAdminFilter") {
        url += `&agentAdminFilter=${agentAdminFilter}`;
      }

      if (queryOptions.selectedFilter === "status" && queryOptions.status) {
        url += `&status=${encodeURIComponent(queryOptions.status)}`;
      } else if (
        queryOptions.selectedFilter === "reference" &&
        queryOptions.reference
      ) {
        url += `&reference=${encodeURIComponent(queryOptions.reference.trim())}`;
      } else if (
        queryOptions.selectedFilter === "date" &&
        queryOptions.fromDate &&
        queryOptions.toDate
      ) {
        url += `&fromDate=${queryOptions.fromDate}&toDate=${queryOptions.toDate}`;
      } else if (
        queryOptions.selectedFilter === "department" &&
        queryOptions.department
      ) {
        url += `&department=${encodeURIComponent(queryOptions.department)}`;
      } else if (
        queryOptions.selectedFilter === "agent" &&
        queryOptions.agent
      ) {
        url += `&agent=${encodeURIComponent(queryOptions.agent.trim())}`;
      } else if (
        queryOptions.selectedFilter === "type" &&
        queryOptions.issueType
      ) {
        url += `&type=${encodeURIComponent(queryOptions.issueType.trim())}`;
      } else if (
        queryOptions.selectedFilter === "priority" &&
        queryOptions.issuePriority
      ) {
        url += `&priority=${encodeURIComponent(queryOptions.issuePriority)}`;
      } else if (
        queryOptions.selectedFilter === "submitter" &&
        queryOptions.submitter
      ) {
        url += `&submitter=${encodeURIComponent(queryOptions.submitter.trim())}`;
      }

      // Fetch a response with the built url
      const response = await apiClient.get(url);

      // set response to issuesData
      set({ issuesData: response.data });
    } catch (error) {
      const errorMessage = getApiErrorMessage(error);
      console.error(errorMessage);
      set({ issuesData: [] });
    } finally {
      set({ loading: false });
    }
  },
  refetchIssues: async () => {
    const fetchIssues = get().fetchIssues;

    await fetchIssues(DEFAULT_FETCH_OPTIONS);
  },
}));
