import { create } from "zustand";
import apiClient from "@/lib/AxiosClient";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import { useSearchStore } from "./useSearchStore";

export interface DataCounts {
  totals: number;
  pending: number;
  inProgress: number;
  resolved: number;
  unfeasible: number;
}

export const defaultCounts: DataCounts = {
  totals: 0,
  pending: 0,
  inProgress: 0,
  resolved: 0,
  unfeasible: 0,
};

interface AutomationCardsStore {
  loading: boolean;
  automationCounts: DataCounts;

  fetchAutomationCounts: () => Promise<void>;
  resetAutomationCounts: () => void;
}

export const useAutomationCardsStore = create<AutomationCardsStore>()(
  (set) => ({
    loading: true,
    automationCounts: defaultCounts,

    // Reset function - usually called when component unmounts
    resetAutomationCounts: () =>
      set({
        loading: true,
        automationCounts: defaultCounts,
      }),

    fetchAutomationCounts: async () => {
      const currentDepartment = useSearchStore.getState().selectedDepartment;
      set({ loading: true });

      //create a url variable
      let apiUrl = `/automation-cards`;
      try {
        if (currentDepartment)
          apiUrl += `?department=${encodeURIComponent(currentDepartment)}`;
        const response = await apiClient.get(apiUrl);
        set({ automationCounts: response.data });
      } catch (error) {
        const errorMessage = getApiErrorMessage(error);
        console.error(errorMessage);
        set({ automationCounts: defaultCounts });
      } finally {
        set({ loading: false });
      }
    },
  }),
);
