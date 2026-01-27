"use client";
import { Dispatch, SetStateAction, useState } from "react";
import { useSearchLogic } from "@/contexts/SearchLogicContext";
import { useIssuesData } from "@/contexts/IssuesDataContext";
import { Building2, Send } from "lucide-react";

type AgentAdminFilterProps = {
  setCurrentPage: Dispatch<SetStateAction<number>>;
};

const ViewAgentAdminFilter = ({ setCurrentPage }: AgentAdminFilterProps) => {
  const [isFilterActive, setIsFilterActive] = useState(false);
  const { fetchIssues, refetchIssues } = useIssuesData();

  const {
    setSelectedFilter,
    setAgentAdminFilter,
    setStatus,
    setReference,
    setFromDate,
    setToDate,
    setDepartment,
    setAgent,
    setIssueType,
    setSubmitter,
  } = useSearchLogic();

  // --- 1. Handle "Default" View (Incoming/Assigned Issues) ---
  const handleDefaultIssues = () => {
    if (!isFilterActive) return; // Don't reload if already active

    setIsFilterActive(false);

    // Reset the agentAdmin filter and the default selected filter
    setAgentAdminFilter("");
    setSelectedFilter("status");

    // Refetch using the context's default behavior
    // Refetches using the default selected filter
    refetchIssues();
    setCurrentPage(1);
  };

  // --- 2. Handle "My Submissions" View (Agent/Admin Created) ---
  const fetchAgentAdminIssues = () => {
    if (isFilterActive) return; // Don't reload if already active

    setIsFilterActive(true);

    // 1. Update the UI Context state (so search bars clear visually)
    setAgentAdminFilter("agentAdminFilter");
    setSelectedFilter("status");
    setStatus("");
    setReference("");
    setFromDate("");
    setToDate("");
    setDepartment("");
    setAgent("");
    setIssueType("");
    setSubmitter("");

    // 2. Prepare explicit options for the API call
    // We cannot use the state variables here because setX() is async.
    // We must pass the intended values directly.
    const cleanOptions = {
      agentAdminFilter: "agentAdminFilter",
      selectedFilter: "status",
      status: "",
      reference: "",
      fromDate: "",
      toDate: "",
      department: "",
      agent: "",
      issueType: "",
      submitter: "",
    };

    // 3. Fetch immediately with clean data
    fetchIssues(cleanOptions);
    setCurrentPage(1);
  };

  return (
    <div className="flex items-center justify-center">
      <div className="flex rounded-xl border border-neutral-300 bg-neutral-100 p-1 dark:border-neutral-800 dark:bg-neutral-950">
        {/* Button 1: Default View */}
        <button
          onClick={handleDefaultIssues}
          disabled={!isFilterActive}
          className={`flex items-center justify-center gap-2 rounded-lg px-4 py-1.5 text-sm font-semibold transition-all ${
            !isFilterActive
              ? "bg-white text-neutral-900 shadow-sm dark:bg-neutral-900 dark:text-white"
              : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span className="custom:inline-flex hidden">Incoming</span>
        </button>

        {/* Button 2: Agent/Admin Submitted View */}
        <button
          onClick={fetchAgentAdminIssues}
          disabled={isFilterActive}
          className={`flex items-center justify-center gap-2 rounded-lg px-4 py-1.5 text-sm font-semibold transition-all ${
            isFilterActive
              ? "bg-neutral-900 text-white shadow-sm dark:bg-white dark:text-neutral-900"
              : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
          }`}
        >
          <Send className="h-4 w-4" />
          <span className="custom:inline-flex hidden">My Submissions</span>
        </button>
      </div>
    </div>
  );
};

export default ViewAgentAdminFilter;
