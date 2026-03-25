"use client";

import { useIssueCardsStore } from "@/store/useIssueCardsStore";
import { useSearchStore } from "@/store/useSearchStore";
import { useEffect, createContext, ReactNode } from "react";

const IssueCardsContext = createContext(null);

export const IssueCardsProvider = ({ children }: { children: ReactNode }) => {
  const agentAdminFilter = useSearchStore((state) => state.agentAdminFilter);
  const superAdminFilter = useSearchStore((state) => state.superAdminFilter);
  const fetchIssueCounts = useIssueCardsStore(
    (state) => state.fetchIssueCounts,
  );

  useEffect(() => {
    fetchIssueCounts();
  }, [fetchIssueCounts, agentAdminFilter, superAdminFilter]);

  return (
    <IssueCardsContext.Provider value={null}>
      {children}
    </IssueCardsContext.Provider>
  );
};
