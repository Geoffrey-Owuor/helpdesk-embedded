"use client";
import { Search, X, RotateCcw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAnalyticsFilterStore } from "@/store/useAnalyticsFilterStore";
import {
  baseDepartments,
  statusOptions,
  priorityOptions,
} from "@/public/assets";
import { DatePicker } from "../DatePicker";
import AnalyticsDropdown from "./AnalyticsDropdown";
import { fetchGlobalAgents } from "@/queries/analytics/fetchGlobalAgents";
import { fetchGlobalIssueTypes } from "@/queries/analytics/fetchGlobalIssueTypes";

const TextInput = ({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
}) => (
  <div className="flex flex-col gap-1.5">
    <span className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
      {label}
    </span>
    <div className="relative">
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
    className={`h-10 rounded-xl border px-4 text-sm font-medium transition-colors ${
      active
        ? "border-blue-600 bg-blue-600 text-white hover:bg-blue-700"
        : "border-neutral-300 bg-white text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:bg-neutral-900"
    }`}
  >
    {label}
  </button>
);

const FilterPanel = () => {
  const {
    department,
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
  } = useAnalyticsFilterStore();

  const { data: globalAgents = [] } = useQuery({
    queryKey: ["analyticsGlobalAgents"],
    queryFn: fetchGlobalAgents,
  });

  const { data: globalIssueTypes = [] } = useQuery({
    queryKey: ["analyticsGlobalIssueTypes"],
    queryFn: fetchGlobalIssueTypes,
  });

  const departmentOptions = baseDepartments.map((dept) => ({
    label: dept.option,
    value: dept.value,
  }));

  const agentOptions = globalAgents.map((a) => ({
    label: `${a.agent_name} - ${a.department}`,
    value: a.agent_email,
  }));

  const issueTypeOptions = globalIssueTypes.map((type) => ({
    label: type,
    value: type,
  }));

  return (
    <div className="mb-6 rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnalyticsDropdown
          label="Department"
          options={departmentOptions}
          value={department}
          onChange={setDepartment}
          placeholder="All departments"
        />
        <AnalyticsDropdown
          label="Agent"
          options={agentOptions}
          value={agent}
          onChange={setAgent}
          placeholder="All agents"
        />
        <AnalyticsDropdown
          label="Issue Type"
          options={issueTypeOptions}
          value={issueType}
          onChange={setIssueType}
          placeholder="All issue types"
        />
        <AnalyticsDropdown
          label="Status"
          options={statusOptions}
          value={status}
          onChange={setStatus}
          placeholder="All statuses"
        />
        <AnalyticsDropdown
          label="Priority"
          options={priorityOptions}
          value={priority}
          onChange={setPriority}
          placeholder="All priorities"
        />
        <TextInput
          label="Submitter"
          value={submitter}
          onChange={setSubmitter}
          placeholder="Search submitter name..."
        />
        <TextInput
          label="Reference Number"
          value={reference}
          onChange={setReference}
          placeholder="Search reference id..."
        />
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
            Date Range
          </span>
          <div className="flex items-center gap-2">
            <DatePicker
              value={fromDate}
              onChange={setFromDate}
              placeholder="From"
            />
            <span className="text-sm text-neutral-400">to</span>
            <DatePicker value={toDate} onChange={setToDate} placeholder="To" />
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-neutral-100 pt-4 dark:border-neutral-800">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
            Activity
          </span>
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
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={resetFilters}
            className="flex h-9.5 items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-3 text-sm text-neutral-600 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:bg-neutral-900"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
          <button
            type="button"
            onClick={applyFilters}
            className="flex h-9.5 items-center gap-1.5 rounded-xl bg-neutral-900 px-4 text-sm text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          >
            <Search className="h-4 w-4" />
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
