"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { ChevronDown, Filter } from "lucide-react";
import { useSearchStore } from "@/store/useSearchStore";
import { useUser } from "@/contexts/UserContext";

// Define options outside component to keep it clean
const filterOptions = [
  { label: "Status", value: "status" },
  { label: "Reference", value: "reference" },
  { label: "Date", value: "date" },
  { label: "Department", value: "department" },
  { label: "Agent", value: "agent" },
  { label: "Issue Type", value: "type" },
  { label: "Issue Priority", value: "priority" },
  { label: "Submitter", value: "submitter" },
];

const SearchFilterLogic = ({ recordType }: { recordType: string }) => {
  // State for the filter dropdown
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Store state
  const selectedFilter = useSearchStore((state) => state.selectedFilter);
  const agentAdminFilter = useSearchStore((state) => state.agentAdminFilter);
  const setSelectedFilter = useSearchStore((state) => state.setSelectedFilter);

  // Filter values
  const status = useSearchStore((state) => state.status);
  const reference = useSearchStore((state) => state.reference);
  const fromDate = useSearchStore((state) => state.fromDate);
  const toDate = useSearchStore((state) => state.toDate);
  const department = useSearchStore((state) => state.department);
  const agent = useSearchStore((state) => state.agent);
  const issueType = useSearchStore((state) => state.issueType);
  const issuePriority = useSearchStore((state) => state.issuePriority);
  const submitter = useSearchStore((state) => state.submitter);

  const hasValue: Record<string, boolean> = {
    status: !!status,
    reference: !!reference,
    date: !!fromDate && !!toDate,
    department: !!department,
    agent: !!agent,
    type: !!issueType,
    priority: !!issuePriority,
    submitter: !!submitter,
  };

  const filterRef = useRef<HTMLDivElement>(null);

  // Get the user's role
  const { role } = useUser();

  const visibleOptions = useMemo(() => {
    return filterOptions.filter((option) => {
      // Hide agent filter if user is an agent and the agentAdminFilter is not enabled
      if (
        recordType !== "automations" &&
        role === "agent" &&
        agentAdminFilter !== "agentAdminFilter" &&
        option.value === "agent"
      )
        return false;

      // Hide the submitter filter if user is a standard user
      if (
        recordType !== "automations" &&
        role === "user" &&
        option.value === "submitter"
      )
        return false;

      // Hide department and Issue Type when recordType is automations
      if (recordType === "automations" && option.value === "department")
        return false;

      // Otherwise return true for the remaining ones
      return true;
    });
  }, [role, agentAdminFilter, recordType]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectFilter = (value: string) => {
    setSelectedFilter(value);
    setIsFilterOpen(false);
    // Add your filter logic here
  };
  return (
    <div className="relative w-fit" ref={filterRef}>
      <button
        onClick={() => setIsFilterOpen(!isFilterOpen)}
        className={`flex h-9.5 w-full min-w-55 items-center justify-between rounded-xl border bg-white px-3 text-sm transition-all sm:w-auto dark:bg-neutral-950 ${
          isFilterOpen
            ? "border-blue-500 ring-2 ring-blue-500/20"
            : "border-neutral-300 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
        }`}
      >
        <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300">
          <Filter className="h-4 w-4" />
          <span>Filter by:</span>
          <span className="text-neutral-500">
            {filterOptions.find((f) => f.value === selectedFilter)?.label ||
              "none selected"}
          </span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-neutral-400 transition-transform ${isFilterOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isFilterOpen && (
        <div className="default-scrollbar absolute top-full left-0 z-20 mt-2 max-h-80 w-full origin-top-left overflow-y-auto rounded-xl border border-neutral-300 bg-white p-1 shadow-xl shadow-neutral-200/50 dark:border-neutral-700 dark:bg-neutral-950 dark:shadow-none">
          <div className="px-2 py-2 text-xs font-semibold text-neutral-500 uppercase">
            Filter Options
          </div>
          {visibleOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelectFilter(option.value)}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${
                selectedFilter === option.value
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200"
                  : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-900"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                  hasValue[option.value] ? "bg-blue-600" : "bg-transparent"
                }`}
              />
              <span className="truncate">{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchFilterLogic;
