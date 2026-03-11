import { create } from "zustand";
import apiClient from "@/lib/AxiosClient";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";

interface AutomationCounts {
  totals: number;
  pending: number;
  inProgress: number;
  resolved: number;
  unfeasible: number;
}

const defaultCounts: AutomationCounts = {
  totals: 0,
  pending: 0,
  inProgress: 0,
  resolved: 0,
  unfeasible: 0,
};

interface AutomationCardsStore {
  loading: boolean;
  automationCounts: AutomationCounts;
  selectedDepartment: string;

  setSelectedDepartment: (department: string) => void;
  fetchAutomationCounts: () => Promise<void>;
}

export const useAutomationCardsStore = create<AutomationCardsStore>()(
  (set, get) => ({
    loading: true,
    automationCounts: defaultCounts,
    selectedDepartment: "",

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
);
