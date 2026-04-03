"use client";
import { useSearchStore } from "@/store/useSearchStore";
import { Building2, Send } from "lucide-react";

const ViewAgentAdminFilter = () => {
  const agentAdminFilter = useSearchStore((state) => state.agentAdminFilter);
  const superAdminFilter = useSearchStore((state) => state.superAdminFilter);
  const setAgentAdminFilter = useSearchStore(
    (state) => state.setAgentAdminFilter,
  );
  const resetFilters = useSearchStore((state) => state.resetFilters);

  // Check is filter has been applied
  const filterApplied = agentAdminFilter === "agentAdminFilter";

  // Incoming Issues
  const handleDefaultIssues = () => {
    if (!filterApplied) return; // Don't reload if agent admin filter is already blank

    // Reset agentAdminFilter
    setAgentAdminFilter("");

    // reset Filters
    resetFilters();
  };

  // Personal submissions
  const fetchAgentAdminIssues = () => {
    if (filterApplied) return; // Don't reload if agent admin filter is already set

    // Set agentAdminFilter
    setAgentAdminFilter("agentAdminFilter");

    // reset filters
    resetFilters();
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`relative flex rounded-2xl transition-opacity duration-200 ${
          superAdminFilter ? "pointer-events-none opacity-40" : ""
        } border border-neutral-200 bg-neutral-100 p-1 shadow-inner dark:border-neutral-800 dark:bg-neutral-900`}
      >
        {/* Sliding background pill */}
        <div
          className={`absolute top-1 bottom-1 w-[calc(50%-2px)] rounded-xl bg-white shadow-sm ring-1 ring-black/5 transition-all duration-200 ease-in-out dark:bg-neutral-700 dark:ring-white/10 ${
            filterApplied ? "translate-x-[calc(100%-4px)]" : "translate-x-0"
          }`}
        />

        {/* Button 1: Incoming */}
        <button
          onClick={handleDefaultIssues}
          disabled={!filterApplied || superAdminFilter}
          className={`relative z-10 flex items-center justify-center gap-2 rounded-xl px-5 py-2 text-sm font-medium tracking-tight transition-colors duration-200 ${
            !filterApplied
              ? "text-neutral-900 dark:text-white"
              : "text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"
          }`}
        >
          <Building2
            className={`h-4 w-4 transition-transform duration-200 ${!filterApplied ? "scale-110" : "scale-100"}`}
          />
          <span className="custom:inline-flex hidden">Incoming</span>
        </button>

        {/* Button 2: Submissions */}
        <button
          onClick={fetchAgentAdminIssues}
          disabled={filterApplied || superAdminFilter}
          className={`relative z-10 flex items-center justify-center gap-2 rounded-xl px-5 py-2 text-sm font-medium tracking-tight transition-colors duration-200 ${
            filterApplied
              ? "text-neutral-900 dark:text-white"
              : "text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"
          }`}
        >
          <Send
            className={`h-4 w-4 transition-transform duration-200 ${filterApplied ? "scale-110" : "scale-100"}`}
          />
          <span className="custom:inline-flex hidden">Submissions</span>
        </button>
      </div>
    </div>
  );
};

export default ViewAgentAdminFilter;
