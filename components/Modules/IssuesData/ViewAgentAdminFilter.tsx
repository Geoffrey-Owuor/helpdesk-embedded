"use client";
import { useSearchLogic } from "@/contexts/SearchLogicContext";
import { Building2, Send } from "lucide-react";

const ViewAgentAdminFilter = () => {
  const {
    agentAdminFilter,
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

  // Check is filter has been applied
  const filterApplied = agentAdminFilter === "agentAdminFilter";

  // function for clearing default filters and sets current page to one
  const clearDefaultFilters = () => {
    setSelectedFilter("status");
    setStatus("");
    setReference("");
    setFromDate("");
    setToDate("");
    setDepartment("");
    setAgent("");
    setIssueType("");
    setSubmitter("");
  };

  // Incoming Issues
  const handleDefaultIssues = () => {
    if (!filterApplied) return; // Don't reload if agent admin filter is already blank

    // Reset agentAdminFilter
    setAgentAdminFilter("");

    // Call the default resetter
    clearDefaultFilters();
  };

  // Personal submissions
  const fetchAgentAdminIssues = () => {
    if (filterApplied) return; // Don't reload if agent admin filter is already set

    // Set agentAdminFilter
    setAgentAdminFilter("agentAdminFilter");

    //Call the default resetter
    clearDefaultFilters();
  };

  return (
    <div className="flex items-center justify-center">
      <div className="flex rounded-xl border border-neutral-300 bg-neutral-100 p-1 dark:border-neutral-800 dark:bg-neutral-950">
        {/* Button 1: Default View */}
        <button
          onClick={handleDefaultIssues}
          disabled={!filterApplied}
          className={`flex items-center justify-center gap-2 rounded-lg px-4 py-1.5 text-sm font-semibold ${
            !filterApplied
              ? "bg-neutral-900 text-white shadow-sm dark:bg-white dark:text-neutral-900"
              : "text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span className="custom:inline-flex hidden">Incoming</span>
        </button>

        {/* Button 2: Agent/Admin Submitted View */}
        <button
          onClick={fetchAgentAdminIssues}
          disabled={filterApplied}
          className={`flex items-center justify-center gap-2 rounded-lg px-4 py-1.5 text-sm font-semibold ${
            filterApplied
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
