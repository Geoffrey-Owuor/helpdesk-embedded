"use client";

import { useIssuesStore } from "@/store/useIssuesStore";
import { useSearchStore } from "@/store/useSearchStore";
import { useEffect, createContext, ReactNode } from "react";

const IssuesContext = createContext(null);

export const IssuesProvider = ({ children }: { children: ReactNode }) => {
  const agentAdminFilter = useSearchStore((state) => state.agentAdminFilter);
  const superAdminFilter = useSearchStore((state) => state.superAdminFilter);

  const refetchIssues = useIssuesStore((state) => state.refetchIssues);

  useEffect(() => {
    refetchIssues();
  }, [refetchIssues, agentAdminFilter, superAdminFilter]);

  return (
    <IssuesContext.Provider value={null}>{children}</IssuesContext.Provider>
  );
};
