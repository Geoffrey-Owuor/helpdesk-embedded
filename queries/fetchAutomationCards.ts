import { DataCounts, defaultCounts } from "@/public/assets";
import apiClient from "@/lib/AxiosClient";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import { useSearchStore } from "@/store/useSearchStore";

export const fetchAutomationCards = async (): Promise<DataCounts> => {
  const currentDepartment = useSearchStore.getState().selectedDepartment;

  let apiUrl = `/automation-cards`;
  try {
    if (currentDepartment)
      apiUrl += `?department=${encodeURIComponent(currentDepartment)}`;
    const response = await apiClient.get(apiUrl);

    return response.data;
  } catch (error) {
    const errorMessage = getApiErrorMessage(error);
    console.error(errorMessage);
    return defaultCounts;
  }
};
