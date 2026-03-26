import { create } from "zustand";
import { IssueValueTypes } from "./useIssuesStore";
import apiClient from "@/lib/AxiosClient";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import { useAutomationCardsStore } from "./useAutomationCardsStore";
import { DEFAULT_FETCH_OPTIONS } from "./useIssuesStore";
import { Options } from "./useIssuesStore";

interface AutomationsDataStore {
  automationsData: Record<string, IssueValueTypes>[];
  loading: boolean;
  fetchAutomations: (options: Options) => Promise<void>;
  resetAutomations: () => void;
  refetchAutomations: () => Promise<void>;
}

export const useAutomationsStore = create<AutomationsDataStore>()(
  (set, get) => ({
    // states
    loading: true,
    automationsData: [],

    // Reset function - Called when component unmounts
    resetAutomations: () => set({ loading: true, automationsData: [] }),

    // Actions
    fetchAutomations: async (options) => {
      // Use provided options or fall back to the default options
      const queryOptions = options || DEFAULT_FETCH_OPTIONS;

      const selectedDepartment =
        useAutomationCardsStore.getState().selectedDepartment;

      set({ loading: true });

      try {
        let apiUrl = `/get-automations/?selectedFilter=${queryOptions.selectedFilter || "status"}`;

        // first, check if we have a department selected
        if (selectedDepartment) {
          apiUrl += `&departmentFilter=${encodeURIComponent(selectedDepartment)}`;
        }

        if (queryOptions.selectedFilter === "status" && queryOptions.status) {
          apiUrl += `&status=${encodeURIComponent(queryOptions.status)}`;
        } else if (
          queryOptions.selectedFilter === "reference" &&
          queryOptions.reference
        ) {
          apiUrl += `&reference=${encodeURIComponent(queryOptions.reference.trim())}`;
        } else if (
          queryOptions.selectedFilter === "date" &&
          queryOptions.fromDate &&
          queryOptions.toDate
        ) {
          apiUrl += `&fromDate=${queryOptions.fromDate}&toDate=${queryOptions.toDate}`;
        } else if (
          queryOptions.selectedFilter === "agent" &&
          queryOptions.agent
        ) {
          apiUrl += `&agent=${encodeURIComponent(queryOptions.agent.trim())}`;
        } else if (
          queryOptions.selectedFilter === "priority" &&
          queryOptions.issuePriority
        ) {
          apiUrl += `&priority=${encodeURIComponent(queryOptions.issuePriority)}`;
        } else if (
          queryOptions.selectedFilter === "submitter" &&
          queryOptions.submitter
        ) {
          apiUrl += `&submitter=${encodeURIComponent(queryOptions.submitter.trim())}`;
        }

        // Fetch a response with the built url
        const response = await apiClient.get(apiUrl);

        // set response to issuesData
        set({ automationsData: response.data });
      } catch (error) {
        const errorMessage = getApiErrorMessage(error);
        console.error(errorMessage);
        set({ automationsData: [] });
      } finally {
        set({ loading: false });
      }
    },
    refetchAutomations: async () => {
      const fetchAutomations = get().fetchAutomations;
      await fetchAutomations(DEFAULT_FETCH_OPTIONS);
    },
  }),
);
