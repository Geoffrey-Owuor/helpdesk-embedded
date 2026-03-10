import { create } from "zustand";
import {
  IssueAgents,
  fetchedIssueAgents,
} from "@/serverActions/GetIssueAgents";

interface AgentsStore {
  loading: boolean;
  agentsInfo: IssueAgents[];

  // The action takes department as an argument
  fetchAgentsInfo: (department: string) => Promise<void>;
}

export const useAgentsStore = create<AgentsStore>()((set) => ({
  loading: false,
  agentsInfo: [],

  // Action - Zustand natively handles async actions
  fetchAgentsInfo: async (department: string) => {
    if (!department) return;

    set({ loading: true });

    try {
      const agentsData = await fetchedIssueAgents(department);

      // Update the state with the fetched data and set loading to false
      set({ agentsInfo: agentsData, loading: false });
    } catch (error) {
      console.error("Error while fetching agents information:", error);

      // reset on error
      set({ agentsInfo: [], loading: false });
    }
  },
}));
