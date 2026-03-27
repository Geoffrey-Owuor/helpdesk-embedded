"use client";

import { useAutomationCardsStore } from "@/store/useAutomationCardsStore";
import { useSearchStore } from "@/store/useSearchStore";
import { useEffect, createContext, ReactNode } from "react";

const AutomationCardsContext = createContext(null);

export const AutomationCardsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const selectedDepartment = useSearchStore(
    (state) => state.selectedDepartment,
  );
  const fetchAutomationCounts = useAutomationCardsStore(
    (state) => state.fetchAutomationCounts,
  );

  useEffect(() => {
    fetchAutomationCounts();
  }, [fetchAutomationCounts, selectedDepartment]);

  return (
    <AutomationCardsContext.Provider value={null}>
      {children}
    </AutomationCardsContext.Provider>
  );
};
