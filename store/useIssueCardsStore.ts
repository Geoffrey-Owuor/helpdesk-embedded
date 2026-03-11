import { create } from "zustand";
import apiClient from "@/lib/AxiosClient";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import { useSearchStore } from "./useSearchStore";
import { DataCounts, defaultCounts } from "./useAutomationCardsStore";

interface IssueCardsStore {
  loading: boolean;
  issueCounts: DataCounts;
  fetchIssueCounts: () => Promise<void>;
}

export const useIssueCardsStore = create<IssueCardsStore>()((set) => ({
  loading: true,
  issueCounts: defaultCounts,
  fetchIssueCounts: async () => {
    const agentAdminFilter = useSearchStore.getState().agentAdminFilter;

    set({ loading: true });

    try {
      let apiUrl = `/issues-cards`;
      if (agentAdminFilter === "agentAdminFilter") {
        apiUrl += `?agentAdminFilter=${agentAdminFilter}`;
      }
      const response = await apiClient.get(apiUrl);
      set({ issueCounts: response.data });
    } catch (error) {
      const errorMessage = getApiErrorMessage(error);
      console.error(errorMessage);
      set({ issueCounts: defaultCounts });
    } finally {
      set({ loading: false });
    }
  },
}));
