"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  Dispatch,
  SetStateAction,
} from "react";

import HydrationGuard from "@/components/Modules/HydrationGuard";

type SearchLogicContextTypes = {
  selectedFilter: string;
  fromDate: string;
  toDate: string;
  status: string;
  reference: string;
  department: string;
  agent: string;
  issueType: string;
  submitter: string;
  agentAdminFilter: string;
  isTableView: boolean;
  setSelectedFilter: Dispatch<SetStateAction<string>>;
  setFromDate: Dispatch<SetStateAction<string>>;
  setToDate: Dispatch<SetStateAction<string>>;
  setStatus: Dispatch<SetStateAction<string>>;
  setReference: Dispatch<SetStateAction<string>>;
  setDepartment: Dispatch<SetStateAction<string>>;
  setAgent: Dispatch<SetStateAction<string>>;
  setIssueType: Dispatch<SetStateAction<string>>;
  setSubmitter: Dispatch<SetStateAction<string>>;
  setAgentAdminFilter: Dispatch<SetStateAction<string>>;
  setIsTableView: Dispatch<SetStateAction<boolean>>;
};

const SearchLogicContext = createContext<SearchLogicContextTypes | null>(null);

export const SearchLogicProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // Selected filter options and input values
  const [selectedFilter, setSelectedFilter] = useState("status");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [status, setStatus] = useState("");
  const [reference, setReference] = useState("");
  const [department, setDepartment] = useState("");
  const [agent, setAgent] = useState("");
  const [issueType, setIssueType] = useState("");
  const [submitter, setSubmitter] = useState("");

  const [agentAdminFilter, setAgentAdminFilter] = useState("");

  // This effect runs immediately after mount, grabbing the value before the Guard releases the UI.
  useEffect(() => {
    const savedFilter = localStorage.getItem("agentAdminFilter");
    if (savedFilter) {
      Promise.resolve().then(() => setAgentAdminFilter(savedFilter));
    }
  }, []);

  // Sync changes back to local storage
  useEffect(() => {
    // Only save if we actually have a value or if we want to allow saving empty strings
    if (typeof window !== "undefined") {
      localStorage.setItem("agentAdminFilter", agentAdminFilter);
    }
  }, [agentAdminFilter]);

  // State for switching between table and card view
  const [isTableView, setIsTableView] = useState(true);

  const values = useMemo(
    () => ({
      selectedFilter,
      fromDate,
      toDate,
      status,
      reference,
      department,
      agent,
      issueType,
      submitter,
      agentAdminFilter,
      isTableView,
      setSelectedFilter,
      setFromDate,
      setToDate,
      setStatus,
      setReference,
      setDepartment,
      setAgent,
      setIssueType,
      setSubmitter,
      setAgentAdminFilter,
      setIsTableView,
    }),
    [
      selectedFilter,
      fromDate,
      toDate,
      status,
      reference,
      department,
      agentAdminFilter,
      isTableView,
      agent,
      issueType,
      submitter,
    ],
  );

  return (
    // Wrap in a client portal to prevent hydration issues
    <HydrationGuard>
      <SearchLogicContext.Provider value={values}>
        {children}
      </SearchLogicContext.Provider>
    </HydrationGuard>
  );
};

export const useSearchLogic = () => {
  const context = useContext(SearchLogicContext);

  if (!context)
    throw new Error("useSearchLogic must be used within a SearchLogicProvider");

  return context;
};
