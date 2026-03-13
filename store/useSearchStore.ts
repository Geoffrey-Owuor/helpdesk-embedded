import { create } from "zustand";
import { persist } from "zustand/middleware";

// Defining the state interface
interface SearchState {
  selectedFilter: string;
  fromDate: string;
  toDate: string;
  status: string;
  reference: string;
  department: string;
  agent: string;
  issueType: string;
  issuePriority: string;
  submitter: string;
  superAdminFilter: boolean;
  agentAdminFilter: string;
  isTableView: boolean;
}

// Defining the actions interface
interface SearchActions {
  setSelectedFilter: (value: string) => void;
  setFromDate: (value: string) => void;
  setToDate: (value: string) => void;
  setStatus: (value: string) => void;
  setReference: (value: string) => void;
  setDepartment: (value: string) => void;
  setAgent: (value: string) => void;
  setIssueType: (value: string) => void;
  setIssuePriority: (value: string) => void;
  setSubmitter: (value: string) => void;
  setSuperAdminFilter: (value: boolean) => void;
  setAgentAdminFilter: (value: string) => void;
  setIsTableView: (value: boolean) => void;

  // The reset filters function
  resetFilters: () => void;
}

// Creating the store
export const useSearchStore = create<SearchState & SearchActions>()(
  persist(
    (set) => ({
      // Initial State
      selectedFilter: "status",
      fromDate: "",
      toDate: "",
      status: "",
      reference: "",
      department: "",
      agent: "",
      issueType: "",
      issuePriority: "",
      submitter: "",
      superAdminFilter: false,
      agentAdminFilter: "",
      isTableView: false,

      // Actions (setters)
      setSelectedFilter: (selectedFilter) => set({ selectedFilter }),
      setFromDate: (fromDate) => set({ fromDate }),
      setToDate: (toDate) => set({ toDate }),
      setStatus: (status) => set({ status }),
      setReference: (reference) => set({ reference }),
      setDepartment: (department) => set({ department }),
      setAgent: (agent) => set({ agent }),
      setIssueType: (issueType) => set({ issueType }),
      setIssuePriority: (issuePriority) => set({ issuePriority }),
      setSubmitter: (submitter) => set({ submitter }),
      setAgentAdminFilter: (agentAdminFilter) => set({ agentAdminFilter }),
      setSuperAdminFilter: (superAdminFilter) => set({ superAdminFilter }),
      setIsTableView: (isTableView) => set({ isTableView }),

      resetFilters: () =>
        set({
          selectedFilter: "status",
          fromDate: "",
          toDate: "",
          status: "",
          reference: "",
          department: "",
          agent: "",
          issueType: "",
          issuePriority: "",
          submitter: "",
          //  We do not reset agentAdminFilter, superAdminFilter, and isTableView for UX reasons
        }),
    }),
    {
      name: "search-logic-storage", // Unique name for the local storage key
      // Only saving the agent admin filter
      partialize: (state) => ({
        agentAdminFilter: state.agentAdminFilter,
        isTableView: state.isTableView,
        superAdminFilter: state.superAdminFilter,
      }),
    },
  ),
);
