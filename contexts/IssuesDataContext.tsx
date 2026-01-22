"use client";

import {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
} from "react";
import apiClient from "@/lib/AxiosClient";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";

type issueValueTypes = string | number | null;

type IssuesDataValues = {
  issuesData: Record<string, issueValueTypes>[];
  loading: boolean;
  fetchIssues: () => Promise<void>;
  refetchIssues: () => void;
};

const IssuesDataContext = createContext<IssuesDataValues | null>(null);

export const IssuesDataProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [issuesData, setIssuesData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchIssues = useCallback(async () => {
    setLoading(true);

    try {
      const response = await apiClient.get("/get-issues");

      // set response to issuesData
      setIssuesData(response.data);
    } catch (error) {
      const errorMessage = getApiErrorMessage(error);
      console.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  //   UseEffect for initial fetch when provider mounts
  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  //   function for refetching the issues
  const refetchIssues = useCallback(() => {
    fetchIssues();
  }, [fetchIssues]);

  // Prepare the values
  const values = {
    issuesData,
    loading,
    fetchIssues,
    refetchIssues,
  };

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
