import { create } from "zustand";
import { AnalyticsFilterParams } from "@/lib/analytics/buildAnalyticsIssuesFilter";

// Draft filter values, keyed the same as AnalyticsFilterParams so building
// committedFilters from the draft is a straight field-by-field copy.
interface DraftFilters {
  department: string;
  agent: string;
  issueType: string;
  status: string;
  priority: string;
  fromDate: string;
  toDate: string;
  reopened: boolean;
  escalated: boolean;
  collaborated: boolean;
  submitter: string;
  reference: string;
}

const defaultDraft: DraftFilters = {
  department: "",
  agent: "",
  issueType: "",
  status: "",
  priority: "",
  fromDate: "",
  toDate: "",
  reopened: false,
  escalated: false,
  collaborated: false,
  submitter: "",
  reference: "",
};

// Strips falsy draft values so committedFilters (and the query string built
// from it) only ever carries the filters that are actually active.
const toFilterParams = (draft: DraftFilters): AnalyticsFilterParams => {
  const params: AnalyticsFilterParams = {};
  if (draft.department) params.department = draft.department;
  if (draft.agent) params.agent = draft.agent;
  if (draft.issueType) params.issueType = draft.issueType;
  if (draft.status) params.status = draft.status;
  if (draft.priority) params.priority = draft.priority;
  if (draft.fromDate) params.fromDate = draft.fromDate;
  if (draft.toDate) params.toDate = draft.toDate;
  if (draft.reopened) params.reopened = true;
  if (draft.escalated) params.escalated = true;
  if (draft.collaborated) params.collaborated = true;
  if (draft.submitter) params.submitter = draft.submitter;
  if (draft.reference) params.reference = draft.reference;

  return Object.keys(params).length > 0 ? params : ({} as AnalyticsFilterParams);
};

interface AnalyticsFilterState extends DraftFilters {
  committedFilters: AnalyticsFilterParams | null;
  page: number;
  pageSize: number;

  setDepartment: (value: string) => void;
  setAgent: (value: string) => void;
  setIssueType: (value: string) => void;
  setStatus: (value: string) => void;
  setPriority: (value: string) => void;
  setFromDate: (value: string) => void;
  setToDate: (value: string) => void;
  setReopened: (value: boolean) => void;
  setEscalated: (value: boolean) => void;
  setCollaborated: (value: boolean) => void;
  setSubmitter: (value: string) => void;
  setReference: (value: string) => void;
  setPage: (value: number) => void;
  setPageSize: (value: number) => void;

  applyFilters: () => void;
  removeFilter: (key: keyof DraftFilters) => void;
  resetFilters: () => void;
}

export const useAnalyticsFilterStore = create<AnalyticsFilterState>()(
  (set, get) => ({
    ...defaultDraft,
    committedFilters: null,
    page: 1,
    pageSize: 25,

    setDepartment: (department) => set({ department }),
    setAgent: (agent) => set({ agent }),
    setIssueType: (issueType) => set({ issueType }),
    setStatus: (status) => set({ status }),
    setPriority: (priority) => set({ priority }),
    setFromDate: (fromDate) => set({ fromDate }),
    setToDate: (toDate) => set({ toDate }),
    setReopened: (reopened) => set({ reopened }),
    setEscalated: (escalated) => set({ escalated }),
    setCollaborated: (collaborated) => set({ collaborated }),
    setSubmitter: (submitter) => set({ submitter }),
    setReference: (reference) => set({ reference }),
    setPage: (page) => set({ page }),
    setPageSize: (pageSize) => set({ pageSize }),

    applyFilters: () => {
      const draft = get();
      const filterParams = toFilterParams(draft);
      set({
        committedFilters:
          Object.keys(filterParams).length > 0 ? filterParams : null,
        page: 1,
      });
    },

    removeFilter: (key) => {
      const clearedValue = typeof defaultDraft[key] === "boolean" ? false : "";
      set({ [key]: clearedValue } as Partial<AnalyticsFilterState>);

      const updatedDraft = { ...get(), [key]: clearedValue } as DraftFilters;
      const filterParams = toFilterParams(updatedDraft);
      set({
        committedFilters:
          Object.keys(filterParams).length > 0 ? filterParams : null,
        page: 1,
      });
    },

    resetFilters: () =>
      set({ ...defaultDraft, committedFilters: null, page: 1 }),
  }),
);
