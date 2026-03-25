import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import apiClient from "@/lib/AxiosClient";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";

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
  selectedDepartment: string;

  setSelectedDepartment: (department: string) => void;
  fetchAutomationCounts: () => Promise<void>;
  resetAutomationCounts: () => void;
}

export const useAutomationCardsStore = create<AutomationCardsStore>()(
  persist(
    (set, get) => ({
      loading: true,
      automationCounts: defaultCounts,
      selectedDepartment: "",

      // Reset function - usually called when component unmounts
      resetAutomationCounts: () =>
        set({
          loading: true,
          automationCounts: defaultCounts,
          selectedDepartment: "",
        }),

      setSelectedDepartment: (department) =>
        set({ selectedDepartment: department }),

      fetchAutomationCounts: async () => {
        const currentDepartment = get().selectedDepartment;
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
    {
      name: "automations-cards-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ selectedDepartment: state.selectedDepartment }),
    },
  ),
);
