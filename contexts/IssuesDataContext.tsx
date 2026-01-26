"use client";

import {
  createContext,
  useContext,
  useCallback,
  useState,
  useMemo,
  useEffect,
} from "react";
import apiClient from "@/lib/AxiosClient";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import { useSearchLogic } from "./SearchLogicContext";

export type issueValueTypes = string | number;

interface Options {
  selectedFilter?: string;
  fromDate?: string;
  toDate?: string;
  status?: string;
  reference?: string;
  department?: string;
  agent?: string;
  issueType?: string;
  submitter?: string;
  agentAdminFilter?: string;
}

type IssuesDataValues = {
  issuesData: Record<string, issueValueTypes>[];
  loading: boolean;
  fetchIssues: (val: Options) => Promise<void>;
  refetchIssues: () => void;
};

const IssuesDataContext = createContext<IssuesDataValues | null>(null);

export const IssuesDataProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // Get the agent admin filter
  const { agentAdminFilter } = useSearchLogic();

  // Default fetch options
  const DEFAULT_FETCH_OPTIONS = useMemo(
    () => ({
      selectedFilter: "status",
      agentAdminFilter: agentAdminFilter,
      status: "",
    }),
    [agentAdminFilter],
  );

  const [issuesData, setIssuesData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchIssues = useCallback(
    async (options: Options) => {
      // Use provided options or fall back to the default options
      const queryOptions = options || DEFAULT_FETCH_OPTIONS;

      setLoading(true);

      try {
        let url = `/get-issues/?selectedFilter=${queryOptions.selectedFilter}`;

        // First we check if we have the agent admin filter enabled
        if (queryOptions.agentAdminFilter) {
          url += `&agentAdminFilter=${queryOptions.agentAdminFilter}`;
        }

        if (queryOptions.selectedFilter === "status" && queryOptions.status) {
          url += `&status=${queryOptions.status}`;
        } else if (
          queryOptions.selectedFilter === "reference" &&
          queryOptions.reference
        ) {
          url += `&reference=${encodeURIComponent(queryOptions.reference.trim())}`;
        } else if (
          queryOptions.selectedFilter === "date" &&
          queryOptions.fromDate &&
          queryOptions.toDate
        ) {
          url += `&fromDate=${queryOptions.fromDate}&toDate=${queryOptions.toDate}`;
        } else if (
          queryOptions.selectedFilter === "department" &&
          queryOptions.department
        ) {
          url += `&department=${encodeURIComponent(queryOptions.department)}`;
        } else if (
          queryOptions.selectedFilter === "agent" &&
          queryOptions.agent
        ) {
          url += `&agent=${encodeURIComponent(queryOptions.agent.trim())}`;
        } else if (
          queryOptions.selectedFilter === "type" &&
          queryOptions.issueType
        ) {
          url += `&type=${queryOptions.issueType}`;
        } else if (
          queryOptions.selectedFilter === "submitter" &&
          queryOptions.submitter
        ) {
          url += `&submitter=${queryOptions.submitter}`;
        }

        // Fetch a response with the built url
        const response = await apiClient.get(url);

        // set response to issuesData
        setIssuesData(response.data);
      } catch (error) {
        const errorMessage = getApiErrorMessage(error);
        console.error(errorMessage);
        setIssuesData([]);
      } finally {
        setLoading(false);
      }
    },
    [DEFAULT_FETCH_OPTIONS],
  );

  //   UseEffect for initial fetch when provider mounts with default fetch options
  useEffect(() => {
    fetchIssues(DEFAULT_FETCH_OPTIONS);
  }, [fetchIssues, DEFAULT_FETCH_OPTIONS]);

  //   function for refetching the issues
  const refetchIssues = useCallback(() => {
    fetchIssues(DEFAULT_FETCH_OPTIONS);
  }, [fetchIssues, DEFAULT_FETCH_OPTIONS]);

  // Prepare the values
  const values = useMemo(
    () => ({
      issuesData,
      loading,
      fetchIssues,
      refetchIssues,
    }),
    [fetchIssues, issuesData, loading, refetchIssues],
  );

  return (
    <IssuesDataContext.Provider value={values}>
      {children}
    </IssuesDataContext.Provider>
  );
};

// Custom hook to use the issuesProvider
export const useIssuesData = () => {
  const context = useContext(IssuesDataContext);

  if (!context)
    throw new Error("IssuesData must be used within an IssuesData Provider");

  return context;
};
