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
import { useSearchLogic } from "./SearchLogicContext";

interface IssuesCounts {
  totals: number;
  pending: number;
  inProgress: number;
  resolved: number;
  unfeasible: number;
}

const defaultCounts: IssuesCounts = {
  totals: 0,
  pending: 0,
  inProgress: 0,
  resolved: 0,
  unfeasible: 0,
};

type IssuesCardsProviderValues = {
  loading: boolean;
  issuesCounts: IssuesCounts;
  refetchIssuesCounts: () => Promise<void>;
};

const IssuesCardsContext = createContext<IssuesCardsProviderValues | null>(
  null,
);

export const IssuesCardsProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [issuesCounts, setIssuesCounts] = useState<IssuesCounts>(defaultCounts);

  const { agentAdminFilter } = useSearchLogic();

  const fetchIssuesCounts = useCallback(async () => {
    setLoading(true);

    try {
      let apiUrl = `/issues-cards`;
      if (agentAdminFilter === "agentAdminFilter") {
        apiUrl += `?agentAdminFilter=${agentAdminFilter}`;
      }
      const response = await apiClient.get(apiUrl);
      setIssuesCounts(response.data);
    } catch (error) {
      const errorMessage = getApiErrorMessage(error);
      console.error(errorMessage);
      setIssuesCounts(defaultCounts);
    } finally {
      setLoading(false);
    }
  }, [agentAdminFilter]);

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
