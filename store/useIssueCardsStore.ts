import { create } from "zustand";
import apiClient from "@/lib/AxiosClient";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import { useSearchStore } from "./useSearchStore";
import { DataCounts, defaultCounts } from "@/public/assets";

interface IssueCardsStore {
  loading: boolean;
  issueCounts: DataCounts;
  fetchIssueCounts: () => Promise<void>;
  resetIssueCounts: () => void;
}

export const useIssueCardsStore = create<IssueCardsStore>()((set) => ({
  loading: true,
  issueCounts: defaultCounts,

  // Reset function - Called when component unmounts
  resetIssueCounts: () => set({ loading: true, issueCounts: defaultCounts }),

  fetchIssueCounts: async () => {
    const agentAdminFilter = useSearchStore.getState().agentAdminFilter;
    const superAdminFilter = useSearchStore.getState().superAdminFilter;

    set({ loading: true });

    try {
      let apiUrl = `/issues-cards`;

      const filters = [];

      if (superAdminFilter) {
        filters.push("superAdminFilter=superAdminFilter");
      }

      if (agentAdminFilter === "agentAdminFilter") {
        filters.push(`agentAdminFilter=${agentAdminFilter}`);
      }

      if (filters.length) {
        apiUrl += `?${filters.join("&")}`;
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
