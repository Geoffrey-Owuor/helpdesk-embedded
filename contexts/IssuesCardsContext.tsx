"use client";

import {
  useContext,
  createContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
  useMemo,
} from "react";
import apiClient from "@/lib/AxiosClient";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";

interface issuesCounts {
  pending: number;
  inProgress: number;
  resolved: number;
  unfeasible: number;
}

const defaultCounts = {
  pending: 0,
  inProgress: 0,
  resolved: 0,
  unfeasible: 0,
};

type IssuesCardsProviderValues = {
  loading: boolean;
  issuesCounts: issuesCounts;
  refetchIssuesCounts: () => Promise<void>;
};

const IssuesCardsContext = createContext<IssuesCardsProviderValues | null>(
  null,
);

export const IssuesCardsProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [issuesCounts, setIssuesCounts] = useState<issuesCounts>(defaultCounts);

  const fetchIssuesCounts = useCallback(async () => {
    setLoading(true);

    try {
      const response = await apiClient.get("/issues-cards");
      setIssuesCounts(response.data);
    } catch (error) {
      const errorMessage = getApiErrorMessage(error);
      console.error(errorMessage);
      setIssuesCounts(defaultCounts);
    } finally {
      setLoading(false);
    }
  }, []);

  //   useEffect to perform a default fetch when the provider mounts
  useEffect(() => {
    fetchIssuesCounts();
  }, [fetchIssuesCounts]);

  //   Prepare our context values
  const values = useMemo(
    () => ({
      loading,
      issuesCounts,
      refetchIssuesCounts: fetchIssuesCounts,
    }),
    [loading, issuesCounts, fetchIssuesCounts],
  );

  return (
    <IssuesCardsContext.Provider value={values}>
      {children}
    </IssuesCardsContext.Provider>
  );
};

//Custom hook to use the context data
export const useIssuesCards = () => {
  const context = useContext(IssuesCardsContext);

  if (!context)
    throw new Error(
      "useIssuesCards must be used within an IssuesCardsProvider",
    );

  return context;
};
