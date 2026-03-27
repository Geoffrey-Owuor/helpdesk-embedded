"use client";

import { useEffect, createContext, ReactNode } from "react";
import { useAutomationsStore } from "@/store/useAutomationsStore";
import { useSearchStore } from "@/store/useSearchStore";

const AutomationsContext = createContext(null);

export const AutomationsProvider = ({ children }: { children: ReactNode }) => {
  const selectedDepartment = useSearchStore(
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
