"use client";

import {
  createContext,
  useContext,
  useCallback,
  useState,
  useMemo,
  useEffect,
  ReactNode,
} from "react";
import apiClient from "@/lib/AxiosClient";
import { useAutomations } from "./AutomationCardsContext";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";

// Defining our default fetch options
const DEFAULT_FETCH_OPTIONS = {
  selectedFilter: "status",
  status: "",
};

export type automationsValueTypes = string | number;

interface Options {
  selectedFilter?: string;
  fromDate?: string;
  toDate?: string;
  status?: string;
  reference?: string;
  agent?: string;
  submitter?: string;
  agentAdminFilter?: string;
}

type AutomationsDataValues = {
  automationsData: Record<string, automationsValueTypes>[];
  loading: boolean;
  fetchAutomations: (val: Options) => Promise<void>;
  refetchAutomations: () => void;
};

const AutomationsDataContext = createContext<AutomationsDataValues | null>(
  null,
);

export const AutomationsDataProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { selectedDepartment } = useAutomations();

  const [automationsData, setAutomationsData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAutomations = useCallback(
    async (options: Options) => {
      // Use provided options or fall back to the default options
      const queryOptions = options || DEFAULT_FETCH_OPTIONS;

      setLoading(true);

      try {
        let apiUrl = `/get-automations/?selectedFilter=${queryOptions.selectedFilter || "status"}`;

        // first, check if we have a department selected
        if (selectedDepartment) {
          apiUrl += `&departmentFilter=${selectedDepartment}`;
        }

        if (queryOptions.selectedFilter === "status" && queryOptions.status) {
          apiUrl += `&status=${queryOptions.status}`;
        } else if (
          queryOptions.selectedFilter === "reference" &&
          queryOptions.reference
        ) {
          apiUrl += `&reference=${encodeURIComponent(queryOptions.reference.trim())}`;
        } else if (
          queryOptions.selectedFilter === "date" &&
          queryOptions.fromDate &&
          queryOptions.toDate
        ) {
          apiUrl += `&fromDate=${queryOptions.fromDate}&toDate=${queryOptions.toDate}`;
        } else if (
          queryOptions.selectedFilter === "agent" &&
          queryOptions.agent
        ) {
          apiUrl += `&agent=${encodeURIComponent(queryOptions.agent.trim())}`;
        } else if (
          queryOptions.selectedFilter === "submitter" &&
          queryOptions.submitter
        ) {
          apiUrl += `&submitter=${queryOptions.submitter}`;
        }

        // Fetch a response with the built url
        const response = await apiClient.get(apiUrl);

        // set response to issuesData
        setAutomationsData(response.data);
      } catch (error) {
        const errorMessage = getApiErrorMessage(error);
        console.error(errorMessage);
        setAutomationsData([]);
      } finally {
        setLoading(false);
      }
    },
    [selectedDepartment],
  );

  //   UseEffect for initial fetch when provider mounts with default fetch options
  useEffect(() => {
    fetchAutomations(DEFAULT_FETCH_OPTIONS);
  }, [fetchAutomations]);

  //   function for refetching the issues
  const refetchAutomations = useCallback(() => {
    fetchAutomations(DEFAULT_FETCH_OPTIONS);
  }, [fetchAutomations]);

  // Prepare the values
  const values = useMemo(
    () => ({
      automationsData,
      loading,
      fetchAutomations,
      refetchAutomations,
    }),
    [fetchAutomations, automationsData, loading, refetchAutomations],
  );

  return (
    <AutomationsDataContext.Provider value={values}>
      {children}
    </AutomationsDataContext.Provider>
  );
};

// Custom hook to use the issuesProvider
export const useAutomationsData = () => {
  const context = useContext(AutomationsDataContext);

  if (!context)
    throw new Error("IssuesData must be used within an IssuesData Provider");

  return context;
};
