import { create } from "zustand";
import { IssuesFilterParams } from "@/lib/issues/buildIssuesFilter";
import { DEFAULT_PAGE_SIZE } from "@/public/assets";

// Draft filter values, keyed the same as IssuesFilterParams so building
// committedFilters from the draft is a straight field-by-field copy.
interface DraftFilters {
  status: string;
  reference: string;
  department: string;
  agent: string;
  issueType: string;
  issuePriority: string;
  submitter: string;
  fromDate: string;
  toDate: string;
}

const defaultDraft: DraftFilters = {
  status: "",
  reference: "",
  department: "",
  agent: "",
  issueType: "",
  issuePriority: "",
  submitter: "",
  fromDate: "",
  toDate: "",
};

// Strips falsy draft values so committedFilters (and the query string built
// from it) only ever carries the filters that are actually active.
const toFilterParams = (draft: DraftFilters): IssuesFilterParams => {
  const params: IssuesFilterParams = {};
  if (draft.status) params.status = draft.status;
  if (draft.reference) params.reference = draft.reference;
  if (draft.department) params.department = draft.department;
  if (draft.agent) params.agent = draft.agent;
  if (draft.issueType) params.issueType = draft.issueType;
  if (draft.issuePriority) params.issuePriority = draft.issuePriority;
  if (draft.submitter) params.submitter = draft.submitter;
  if (draft.fromDate) params.fromDate = draft.fromDate;
  if (draft.toDate) params.toDate = draft.toDate;

  return params;
};

interface IssuesFilterState extends DraftFilters {
  selectedFilter: string;
  committedFilters: IssuesFilterParams | null;
  page: number;
  pageSize: number;

  setSelectedFilter: (value: string) => void;
  setStatus: (value: string) => void;
  setReference: (value: string) => void;
  setDepartment: (value: string) => void;
  setAgent: (value: string) => void;
  setIssueType: (value: string) => void;
  setIssuePriority: (value: string) => void;
  setSubmitter: (value: string) => void;
  setFromDate: (value: string) => void;
  setToDate: (value: string) => void;
  setPage: (value: number) => void;
  setPageSize: (value: number) => void;

  applyFilters: () => void;
  removeFilter: (key: keyof DraftFilters) => void;
  resetFilters: () => void;
}

export const useIssuesFilterStore = create<IssuesFilterState>()((set, get) => ({
  ...defaultDraft,
  selectedFilter: "status",
  committedFilters: null,
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,

  setSelectedFilter: (selectedFilter) => set({ selectedFilter }),
  setStatus: (status) => set({ status }),
  setReference: (reference) => set({ reference }),
  setDepartment: (department) => set({ department }),
  setAgent: (agent) => set({ agent }),
  setIssueType: (issueType) => set({ issueType }),
  setIssuePriority: (issuePriority) => set({ issuePriority }),
  setSubmitter: (submitter) => set({ submitter }),
  setFromDate: (fromDate) => set({ fromDate }),
  setToDate: (toDate) => set({ toDate }),
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
    set({ [key]: "" } as Partial<IssuesFilterState>);

    const updatedDraft = { ...get(), [key]: "" } as DraftFilters;
    const filterParams = toFilterParams(updatedDraft);
    set({
      committedFilters:
        Object.keys(filterParams).length > 0 ? filterParams : null,
      page: 1,
    });
  },

  resetFilters: () =>
    set({ ...defaultDraft, committedFilters: null, page: 1 }),
}));
