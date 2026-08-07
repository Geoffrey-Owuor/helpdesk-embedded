import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Defining the state interface
interface SearchState {
  superAdminFilter: boolean;
  agentAdminFilter: string;
  isTableView: boolean;
}

// Defining the actions interface
interface SearchActions {
  setSuperAdminFilter: (value: boolean) => void;
  setAgentAdminFilter: (value: string) => void;
  setIsTableView: (value: boolean) => void;
}

// Creating the store
export const useSearchStore = create<SearchState & SearchActions>()(
  persist(
    (set) => ({
      // Initial State
      superAdminFilter: false,
      agentAdminFilter: "",
      isTableView: false,

      // Actions (setters)
      setAgentAdminFilter: (agentAdminFilter) => set({ agentAdminFilter }),
      setSuperAdminFilter: (superAdminFilter) => set({ superAdminFilter }),
      setIsTableView: (isTableView) => set({ isTableView }),
    }),
    {
      name: "HelpDesk-search-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isTableView: state.isTableView,
        superAdminFilter: state.superAdminFilter,
        agentAdminFilter: state.agentAdminFilter,
      }),
    },
  ),
);
