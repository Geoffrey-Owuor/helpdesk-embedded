import { create } from "zustand";

// Define the shape of our column visibility state
type ColumnVisibilityState = {
  ref: boolean;
  status: boolean;
  type: boolean;
  priority: boolean;
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
  priority: true,
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
  priority: "Issue Priority",
  submitter: "Submitter Name",
  date: "Date Submitted",
  subDept: "Submitter Dept",
  targetDept: "Target Dept",
  agent: "Assigned Agent",
  title: "Title",
  desc: "Description",
};

interface ColumnStore {
  // state
  visibleColumns: ColumnVisibilityState;

  //actions
  toggleColumn: (column: keyof ColumnVisibilityState) => void;
  resetColumns: () => void;
}

export const useColumnStore = create<ColumnStore>()((set) => ({
  visibleColumns: defaultVisibility,

  toggleColumn: (column) =>
    set((state) => ({
      visibleColumns: {
        ...state.visibleColumns,
        [column]: !state.visibleColumns[column],
      },
    })),

  resetColumns: () => set({ visibleColumns: defaultVisibility }),
}));
