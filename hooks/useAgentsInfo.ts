import { useEffect, useCallback } from "react";
import { useAgentsStore } from "@/store/useAgentsStore";
import { useUser } from "@/contexts/UserContext";

export const useAgentsInfo = () => {
  // Get the department dependency
  const { department } = useUser();

  // State and actions from Zustand
  const loading = useAgentsStore((state) => state.loading);
  const agentsInfo = useAgentsStore((state) => state.agentsInfo);
  const fetchAction = useAgentsStore((state) => state.fetchAgentsInfo);

  //fetching the agents info data
  const fetchAgentsInfo = useCallback(async () => {
    if (department) await fetchAction(department);
  }, [department, fetchAction]);

  // react lifecycle - auto fetch when mounted or when fetchAgentsInfo changes
  useEffect(() => {
    fetchAgentsInfo();
  }, [fetchAgentsInfo]);

  //returning our data shape
  return {
    loading,
    agentsInfo,
    refetchAgentsInfo: fetchAgentsInfo,
  };
};
