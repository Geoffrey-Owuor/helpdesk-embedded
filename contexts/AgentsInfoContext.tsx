"use client";

import {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import { useUser } from "./UserContext";
import {
  IssueAgents,
  fetchedIssueAgents,
} from "@/serverActions/GetIssueAgents";

type AgentsInfoProviderValues = {
  loading: boolean;
  agentsInfo: IssueAgents[];
  refetchAgentsInfo: () => Promise<void>;
};

const AgentsInfoContext = createContext<AgentsInfoProviderValues | null>(null);

export const AgentsInfoProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(false);
  const { department } = useUser();
  const [agentsInfo, setAgentsInfo] = useState<IssueAgents[]>([]);

  // Our fetch function
  const fetchAgentsInfo = useCallback(async () => {
    if (!department) return;

    setLoading(true);

    try {
      const agentsData = await fetchedIssueAgents(department);

      setAgentsInfo(agentsData);
    } catch (error) {
      console.error("Error while fetching agents information:", error);
      setAgentsInfo([]);
    } finally {
      setLoading(false);
    }
  }, [department]);

  // useEffect for fetching data on first mount
  useEffect(() => {
    fetchAgentsInfo();
  }, [fetchAgentsInfo]);

  // Our values
  const values = useMemo(
    () => ({
      loading,
      agentsInfo,
      refetchAgentsInfo: fetchAgentsInfo,
    }),
    [loading, agentsInfo, fetchAgentsInfo],
  );

  return (
    <AgentsInfoContext.Provider value={values}>
      {children}
    </AgentsInfoContext.Provider>
  );
};

// Using the context
export const useAgentsInfo = () => {
  const context = useContext(AgentsInfoContext);

  if (!context)
    throw new Error("useAgentsInfo must be used within an AgentsInfoProvider");

  return context;
};
