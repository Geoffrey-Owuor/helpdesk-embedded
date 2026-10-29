"use client";
import { useState, useRef, useEffect } from "react";
import { useAllDepartmentOptions } from "@/hooks/useDepartmentOptions";
import { Search, X, RotateCcw, ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAnalyticsFilterStore } from "@/store/useAnalyticsFilterStore";
import { statusOptions, priorityOptions } from "@/lib/assets";
import { DatePicker } from "../DatePicker";
import CustomDropdown from "../CustomDropdown";
import { fetchGlobalAgents } from "@/queries/analytics/fetchGlobalAgents";
import { fetchGlobalIssueTypes } from "@/queries/analytics/fetchGlobalIssueTypes";
import { fetchedBaseDepartments } from "@/serverActions/GetBaseDepartments";
import {
  DATE_PRESETS,
  DatePreset,
  datePresetRange,
  matchingDatePreset,
} from "@/lib/analytics/datePresets";
import ActiveAnalyticsFilterPills from "./ActiveAnalyticsFilterPills";
import StickyFilterPanel from "../StickyFilterPanel";
import MobileFilterBar, { countActiveFilters } from "../MobileFilterBar";

type FilterFieldKey =
  | "department"
  | "targetDepartment"
  | "agent"
  | "issueType"
  | "status"
  | "priority"
  | "submitter"
  | "reference"
  | "dateRange";

const filterFieldOptions: { key: FilterFieldKey; label: string }[] = [
  { key: "department", label: "Submitter Dept." },
  { key: "targetDepartment", label: "Target Dept." },
  { key: "agent", label: "Agent" },
  { key: "issueType", label: "Issue Type" },
  { key: "status", label: "Status" },
  { key: "priority", label: "Priority" },
  { key: "submitter", label: "Submitter" },
  { key: "reference", label: "Reference Number" },
  { key: "dateRange", label: "Date Range" },
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
      className="h-10 w-full rounded-xl border border-neutral-300 bg-white pr-10 pl-9 text-sm transition-all outline-none placeholder:text-neutral-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 sm:pr-8 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-blue-500"
    />
    {value && (
      <button
        type="button"
        onClick={() => onChange("")}
        aria-label="Clear"
        className="absolute top-1/2 right-1.5 -translate-y-1/2 rounded-full p-2 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-600 sm:right-2 sm:p-1 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
      >
        <X className="h-3 w-3" />
      </button>
    )}
  </div>
);

const ToggleChip = ({
  label,
  active,
  onToggle,
}: {
  label: string;
  active: boolean;
  onToggle: () => void;
}) => (
  <button
    type="button"
    onClick={onToggle}
    className={`h-10 shrink-0 rounded-xl border px-4 text-sm font-medium transition-colors ${
      active
        ? "border-blue-700 bg-blue-700 text-white hover:bg-blue-800"
        : "border-neutral-300 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:bg-neutral-900"
    }`}
  >
    {label}
  </button>
);

// Lets the user pick which filter field the panel's single filter slot
// currently controls. Dot indicators flag fields that already hold a draft
// value, since only one field's control is visible at a time.
const FilterFieldSelector = ({
  activeKey,
  onChange,
  hasValue,
}: {
  activeKey: FilterFieldKey;
  onChange: (key: FilterFieldKey) => void;
  hasValue: Record<FilterFieldKey, boolean>;
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
          {filterFieldOptions.map((option) => (
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

const FilterPanel = () => {
  // Every staff department, inactive ones included, so older issues stay filterable
  const { departments: baseDepartments } = useAllDepartmentOptions();

  const [activeField, setActiveField] = useState<FilterFieldKey>("department");

  const {
    department,
    targetDepartment,
    agent,
    issueType,
    status,
    priority,
    fromDate,
    toDate,
    reopened,
    escalated,
    collaborated,
    submitter,
    reference,
    setDepartment,
    setTargetDepartment,
    setDateRange,
    setAgent,
    setIssueType,
    setStatus,
    setPriority,
    setFromDate,
    setToDate,
    setReopened,
    setEscalated,
    setCollaborated,
    setSubmitter,
    setReference,
    applyFilters,
    resetFilters,
    committedFilters,
  } = useAnalyticsFilterStore();

  const { data: globalAgents = [] } = useQuery({
    queryKey: ["analyticsGlobalAgents"],
    queryFn: fetchGlobalAgents,
  });

  // The departments issues are raised to (group_emails), shared with the new-issue form
  const { data: targetDepartments = [] } = useQuery({
    queryKey: ["BaseDepartmentsData"],
    queryFn: fetchedBaseDepartments,
  });

  const { data: globalIssueTypes = [] } = useQuery({
    queryKey: ["analyticsGlobalIssueTypes"],
    queryFn: fetchGlobalIssueTypes,
  });

  const departmentOptions = baseDepartments.map((dept) => ({
    label: dept.option,
    value: dept.value,
  }));

  const targetDepartmentOptions = targetDepartments.map((dept) => ({
    label: dept.option,
    value: dept.value,
  }));

  const datePresetOptions = DATE_PRESETS.map(({ value, label }) => ({
    label,
    value,
  }));

  const agentOptions = globalAgents.map((a) => ({
    label: `${a.agent_name} - ${a.department}`,
    value: a.agent_email,
  }));

  const issueTypeOptions = globalIssueTypes.map((type) => ({
    label: type,
    value: type,
  }));

  const hasValue: Record<FilterFieldKey, boolean> = {
    department: !!department,
    targetDepartment: !!targetDepartment,
    agent: !!agent,
    issueType: !!issueType,
    status: !!status,
    priority: !!priority,
    submitter: !!submitter,
    reference: !!reference,
    dateRange: !!fromDate || !!toDate,
  };

  const renderControl = (field: FilterFieldKey) => {
    switch (field) {
      case "department":
        return (
          <CustomDropdown
            label="Submitter Department"
            hideLabel
            options={departmentOptions}
            value={department}
            onChange={setDepartment}
            placeholder="All submitter departments"
          />
        );
      case "targetDepartment":
        return (
          <CustomDropdown
            label="Target Department"
            hideLabel
            options={targetDepartmentOptions}
            value={targetDepartment}
            onChange={setTargetDepartment}
            placeholder="All target departments"
          />
        );
      case "agent":
        return (
          <CustomDropdown
            label="Agent"
            hideLabel
            options={agentOptions}
            value={agent}
            onChange={setAgent}
            placeholder="All agents"
          />
        );
      case "issueType":
        return (
          <CustomDropdown
            label="Issue Type"
            hideLabel
            options={issueTypeOptions}
            value={issueType}
            onChange={setIssueType}
            placeholder="All issue types"
          />
        );
      case "status":
        return (
          <CustomDropdown
            label="Status"
            hideLabel
            options={statusOptions}
            value={status}
            onChange={setStatus}
            placeholder="All statuses"
          />
        );
      case "priority":
        return (
          <CustomDropdown
            label="Priority"
            hideLabel
            options={priorityOptions}
            value={priority}
            onChange={setPriority}
            placeholder="All priorities"
          />
        );
      case "submitter":
        return (
          <TextInput
            value={submitter}
            onChange={setSubmitter}
            placeholder="Search submitter name..."
          />
        );
      case "reference":
        return (
          <TextInput
            value={reference}
            onChange={setReference}
            placeholder="Search reference id..."
          />
        );
      case "dateRange":
        return (
          <div className="grid grid-cols-2 items-center gap-2 sm:flex">
            <div className="col-span-2 sm:w-40 sm:shrink-0">
              <CustomDropdown
                label="Quick range"
                hideLabel
                options={datePresetOptions}
                value={matchingDatePreset(fromDate, toDate)}
                onChange={(preset) => {
                  // Clearing the quick range clears the dates it filled in
                  if (!preset) return setDateRange("", "");
                  const range = datePresetRange(preset as DatePreset);
                  setDateRange(range.fromDate, range.toDate);
                }}
                placeholder="Quick range"
              />
            </div>
            {/* Side by side on phones; on wider screens each is wide enough for
                "01 Aug 2026" plus the clear and calendar icons */}
            <div className="min-w-0 sm:min-w-38 sm:flex-1">
              <DatePicker
                value={fromDate}
                onChange={setFromDate}
                placeholder="From"
              />
            </div>
            <span className="hidden shrink-0 text-sm text-neutral-400 sm:inline">
              to
            </span>
            <div className="min-w-0 sm:min-w-38 sm:flex-1">
              <DatePicker
                value={toDate}
                onChange={setToDate}
                placeholder="To"
              />
            </div>
          </div>
        );
    }
  };

  const toggleChips = (
    <>
      <ToggleChip
        label="Reopened"
        active={reopened}
        onToggle={() => setReopened(!reopened)}
      />
      <ToggleChip
        label="Escalated"
        active={escalated}
        onToggle={() => setEscalated(!escalated)}
      />
      <ToggleChip
        label="Collaborated"
        active={collaborated}
        onToggle={() => setCollaborated(!collaborated)}
      />
    </>
  );

  return (
    <>
      <MobileFilterBar
        title="Filter analytics"
        activeCount={countActiveFilters(committedFilters)}
        fields={filterFieldOptions.map((option) => ({
          ...option,
          control: renderControl(option.key),
        }))}
        extra={<div className="flex flex-wrap gap-2">{toggleChips}</div>}
        pills={<ActiveAnalyticsFilterPills />}
        onApply={applyFilters}
        onReset={resetFilters}
      />

      <StickyFilterPanel>
        <div className="flex flex-wrap items-center gap-3">
          <FilterFieldSelector
            activeKey={activeField}
            onChange={setActiveField}
            hasValue={hasValue}
          />

          {/* The date range needs room for the quick range and both pickers;
              the chips wrap below it when the row runs out */}
          <div
            className={`flex-1 ${activeField === "dateRange" ? "min-w-128" : "min-w-55"}`}
          >
            {renderControl(activeField)}
          </div>

          <div className="flex flex-wrap items-center gap-2">{toggleChips}</div>

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
        <ActiveAnalyticsFilterPills />
      </StickyFilterPanel>
    </>
  );
};

export default FilterPanel;
