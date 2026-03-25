"use client";

import { useAutomationCardsStore } from "@/store/useAutomationCardsStore";
import { useEffect, createContext, ReactNode } from "react";

const AutomationCardsContext = createContext(null);

export const AutomationCardsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const selectedDepartment = useAutomationCardsStore(
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
