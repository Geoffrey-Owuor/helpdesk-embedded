"use client";

import { useAutomationCardsStore } from "@/store/useAutomationCardsStore";
import { useEffect, createContext, ReactNode } from "react";
import { useAutomationsStore } from "@/store/useAutomationsStore";

const AutomationsContext = createContext(null);

export const AutomationsProvider = ({ children }: { children: ReactNode }) => {
  const selectedDepartment = useAutomationCardsStore(
    (state) => state.selectedDepartment,
  );
  const refetchAutomations = useAutomationsStore(
    (state) => state.refetchAutomations,
  );

  useEffect(() => {
    refetchAutomations();
  }, [refetchAutomations, selectedDepartment]);

  return (
    <AutomationsContext.Provider value={null}>
      {children}
    </AutomationsContext.Provider>
  );
};
