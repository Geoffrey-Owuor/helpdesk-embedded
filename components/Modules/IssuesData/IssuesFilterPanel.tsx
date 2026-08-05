"use client";
import { useMemo, useState, useRef, useEffect } from "react";
import { Search, X, RotateCcw, ChevronDown } from "lucide-react";
import { useIssuesFilterStore } from "@/store/useIssuesFilterStore";
import { useUser } from "@/contexts/UserContext";
import { useSearchStore } from "@/store/useSearchStore";
import { baseDepartments, statusOptions, priorityOptions } from "@/public/assets";
import { DatePicker } from "../DatePicker";
import CustomDropdown from "../CustomDropdown";

type FilterFieldKey =
  | "status"
  | "reference"
  | "dateRange"
  | "department"
  | "agent"
  | "issueType"
  | "issuePriority"
  | "submitter";

const filterFieldOptions: { key: FilterFieldKey; label: string }[] = [
  { key: "status", label: "Status" },
  { key: "reference", label: "Reference" },
  { key: "dateRange", label: "Date Range" },
  { key: "department", label: "Department" },
  { key: "agent", label: "Agent" },
  { key: "issueType", label: "Issue Type" },
  { key: "issuePriority", label: "Issue Priority" },
  { key: "submitter", label: "Submitter" },
];

const TextInput = ({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
}) => (
  <div className="relative w-full">
    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-10 w-full rounded-xl border border-neutral-300 bg-white pr-8 pl-9 text-sm transition-all outline-none placeholder:text-neutral-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-blue-500"
    />
    {value && (
      <button
        type="button"
        onClick={() => onChange("")}
        className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-1 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
      >
        <X className="h-3 w-3" />
      </button>
    )}
  </div>
);

// Lets the user pick which filter field the panel's single filter slot
// currently controls. Dot indicators flag fields that already hold a draft
// value, since only one field's control is visible at a time.
const FilterFieldSelector = ({
  activeKey,
  onChange,
  hasValue,
  visibleOptions,
}: {
  activeKey: FilterFieldKey;
  onChange: (key: FilterFieldKey) => void;
  hasValue: Record<FilterFieldKey, boolean>;
  visibleOptions: { key: FilterFieldKey; label: string }[];
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeLabel = filterFieldOptions.find(
    (opt) => opt.key === activeKey,
  )?.label;

  return (
    <div className="relative w-44 shrink-0" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-10 w-full items-center justify-between rounded-xl border bg-white px-3 text-sm font-medium transition-all dark:bg-neutral-950 ${
          isOpen
            ? "border-blue-500 ring-2 ring-blue-500/20"
            : "border-neutral-300 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
        }`}
      >
        <span className="truncate text-neutral-900 dark:text-white">
          {activeLabel}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-20 mt-2 w-full rounded-xl border border-neutral-300 bg-white p-1 shadow-xl shadow-neutral-200/50 dark:border-neutral-700 dark:bg-neutral-950 dark:shadow-none">
          {visibleOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => {
                onChange(option.key);
                setIsOpen(false);
              }}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${
                activeKey === option.key
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200"
                  : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-900"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                  hasValue[option.key] ? "bg-blue-600" : "bg-transparent"
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

const IssuesFilterPanel = () => {
  const { role } = useUser();
  const agentAdminFilter = useSearchStore((state) => state.agentAdminFilter);

  const {
    status,
    reference,
    department,
    agent,
    issueType,
    issuePriority,
    submitter,
    fromDate,
    toDate,
    setStatus,
    setReference,
    setDepartment,
    setAgent,
    setIssueType,
    setIssuePriority,
    setSubmitter,
    setFromDate,
    setToDate,
    applyFilters,
    resetFilters,
  } = useIssuesFilterStore();

  const [activeField, setActiveField] = useState<FilterFieldKey>("status");

  // Hide "agent" for agents not viewing their own submissions, and "submitter"
  // for plain users - mirrors the previous SearchFilterLogic.tsx visibility rules.
  const visibleOptions = useMemo(() => {
    return filterFieldOptions.filter((option) => {
      if (
        role === "agent" &&
        agentAdminFilter !== "agentAdminFilter" &&
        option.key === "agent"
      )
        return false;

      if (role === "user" && option.key === "submitter") return false;

      return true;
    });
  }, [role, agentAdminFilter]);

  // Derived rather than synced via effect - falls back to the first visible
  // option whenever the currently active field becomes hidden by role rules.
  const effectiveActiveField = visibleOptions.some(
    (option) => option.key === activeField,
  )
    ? activeField
    : (visibleOptions[0]?.key ?? "status");

  const departmentOptions = baseDepartments.map((dept) => ({
    label: dept.option,
    value: dept.value,
  }));

  const hasValue: Record<FilterFieldKey, boolean> = {
    status: !!status,
    reference: !!reference,
    dateRange: !!fromDate || !!toDate,
    department: !!department,
    agent: !!agent,
    issueType: !!issueType,
    issuePriority: !!issuePriority,
    submitter: !!submitter,
  };

  const renderActiveControl = () => {
    switch (effectiveActiveField) {
      case "status":
        return (
          <CustomDropdown
            label="Status"
            hideLabel
            options={statusOptions}
            value={status}
            onChange={setStatus}
            placeholder="Select status..."
          />
        );
      case "reference":
        return (
          <TextInput
            value={reference}
            onChange={setReference}
            placeholder="Search reference ID..."
          />
        );
      case "dateRange":
        return (
          <div className="flex items-center gap-2">
            <DatePicker
              value={fromDate}
              onChange={setFromDate}
              placeholder="From"
            />
            <span className="shrink-0 text-sm text-neutral-400">to</span>
            <DatePicker value={toDate} onChange={setToDate} placeholder="To" />
          </div>
        );
      case "department":
        return (
          <CustomDropdown
            label="Department"
            hideLabel
            options={departmentOptions}
            value={department}
            onChange={setDepartment}
            placeholder="Select department..."
          />
        );
      case "agent":
        return (
          <TextInput
            value={agent}
            onChange={setAgent}
            placeholder="Search agent name..."
          />
        );
      case "issueType":
        return (
          <TextInput
            value={issueType}
            onChange={setIssueType}
            placeholder="Search issue type..."
          />
        );
      case "issuePriority":
        return (
          <CustomDropdown
            label="Issue Priority"
            hideLabel
            options={priorityOptions}
            value={issuePriority}
            onChange={setIssuePriority}
            placeholder="Select priority..."
          />
        );
      case "submitter":
        return (
          <TextInput
            value={submitter}
            onChange={setSubmitter}
            placeholder="Search submitter..."
          />
        );
    }
  };

  return (
    <div className="sticky top-0 z-50 mb-4 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="flex flex-wrap items-center gap-3">
        <FilterFieldSelector
          activeKey={effectiveActiveField}
          onChange={setActiveField}
          hasValue={hasValue}
          visibleOptions={visibleOptions}
        />

        <div className="min-w-55 flex-1">{renderActiveControl()}</div>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={resetFilters}
            className="flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:bg-neutral-900"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
          <button
            type="button"
            onClick={applyFilters}
            className="flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-neutral-900 px-4 text-sm text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          >
            <Search className="h-4 w-4" />
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default IssuesFilterPanel;
