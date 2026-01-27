"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  ReactNode,
} from "react";
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

type AutomationCardsProviderValues = {
  loading: boolean;
  automationCounts: AutomationCounts;
  refetchAutomationCounts: (val?: string) => Promise<void>;
};

const AutomationCardsContext =
  createContext<AutomationCardsProviderValues | null>(null);

export const AutomationCardsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [loading, setLoading] = useState(true);
  const [automationCounts, setAutomationCounts] =
    useState<AutomationCounts>(defaultCounts);

  const fetchAutomationCounts = useCallback(async (department?: string) => {
    setLoading(true);
    //create a url variable
    let apiUrl = `/automation-cards`;
    try {
      if (department && typeof department === "string")
        apiUrl += `?department=${encodeURIComponent(department)}`;
      const response = await apiClient.get(apiUrl);
      setAutomationCounts(response.data);
    } catch (error) {
      const errorMessage = getApiErrorMessage(error);
      console.error(errorMessage);
      setAutomationCounts(defaultCounts);
    } finally {
      setLoading(false);
    }
  }, []);

  // useEffect to fetch counts when the provider mounts
  useEffect(() => {
    fetchAutomationCounts();
  }, [fetchAutomationCounts]);

  // Our shared values
  const values = useMemo(
    () => ({
      loading,
      automationCounts,
      refetchAutomationCounts: fetchAutomationCounts,
    }),
    [loading, automationCounts, fetchAutomationCounts],
  );

  return (
    <AutomationCardsContext.Provider value={values}>
      {children}
    </AutomationCardsContext.Provider>
  );
};

// The custom hook
export const useAutomations = () => {
  const context = useContext(AutomationCardsContext);

  if (!context)
    throw new Error(
      "useAutomations must be used within an AutomationCardsProvider",
    );

  return context;
};
