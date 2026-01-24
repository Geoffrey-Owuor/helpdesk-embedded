"use client";

import { createContext, useContext, useState, ReactNode, useMemo } from "react";

// Define the shape of our column visibility state
type ColumnVisibilityState = {
  ref: boolean;
  status: boolean;
  type: boolean;
  submitter: boolean;
  date: boolean;
  subDept: boolean; // Submitter Department
  targetDept: boolean; // Target Department
  agent: boolean;
  title: boolean;
  desc: boolean;
};

// Initial state: All columns visible by default
const defaultVisibility: ColumnVisibilityState = {
  ref: true,
  status: true,
  type: true,
  submitter: true,
  date: true,
  subDept: true,
  targetDept: true,
  agent: true,
  title: true,
  desc: true,
};

// Labels for the UI dropdown
export const columnLabels: Record<keyof ColumnVisibilityState, string> = {
  ref: "Reference ID",
  status: "Status",
  type: "Issue Type",
  submitter: "Submitter Name",
  date: "Date Submitted",
  subDept: "Submitter Dept",
  targetDept: "Target Dept",
  agent: "Assigned Agent",
  title: "Title",
  desc: "Description",
};

interface ColumnVisibilityContextType {
  visibleColumns: ColumnVisibilityState;
  toggleColumn: (column: keyof ColumnVisibilityState) => void;
  resetColumns: () => void;
}

const ColumnVisibilityContext =
  createContext<ColumnVisibilityContextType | null>(null);

export const ColumnVisibilityProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [visibleColumns, setVisibleColumns] =
    useState<ColumnVisibilityState>(defaultVisibility);

  const toggleColumn = (column: keyof ColumnVisibilityState) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  const resetColumns = () => setVisibleColumns(defaultVisibility);

  const value = useMemo(
    () => ({
      visibleColumns,
      toggleColumn,
      resetColumns,
    }),
    [visibleColumns],
  );

  return (
    <ColumnVisibilityContext.Provider value={value}>
      {children}
    </ColumnVisibilityContext.Provider>
  );
};

export const useColumnVisibility = () => {
  const context = useContext(ColumnVisibilityContext);
  if (!context) {
    throw new Error(
      "useColumnVisibility must be used within a ColumnVisibilityProvider",
    );
  }
  return context;
};
