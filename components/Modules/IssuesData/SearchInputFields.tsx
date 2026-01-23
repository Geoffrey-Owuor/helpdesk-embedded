"use client";
import { useState, useRef, useEffect } from "react";
import { Search, ChevronDown, Check, X } from "lucide-react";
import { useSearchLogic } from "@/contexts/SearchLogicContext";

// --- Mock Data Options ---
const statusOptions = [
  { label: "Pending", value: "pending" },
  { label: "In Progress", value: "in progress" },
  { label: "Resolved", value: "resolved" },
];

const departmentOptions = [
  { label: "Finance", value: "Finance" },
  { label: "IT & Projects", value: "IT & Projects" },
  { label: "Marketing", value: "Marketing" },
];

const issueTypeOptions = [
  { label: "Automation", value: "Automation" },
  { label: "Petty Cash", value: "Petty Cash" },
  { label: "Wi-Fi", value: "Wi-Fi" },
  { label: "Reports", value: "Reports" },
];

// --- Reusable Custom Dropdown Component ---
interface DropdownOption {
  label: string;
  value: string;
}

const CustomDropdown = ({
  options,
  value,
  onChange,
  placeholder,
}: {
  options: DropdownOption[];
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close
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

  const selectedLabel = options.find((opt) => opt.value === value)?.label;

  return (
    <div className="relative w-full sm:w-64" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-10 w-full items-center justify-between rounded-xl border px-3 text-sm transition-all ${
          isOpen
            ? "border-blue-500 ring-2 ring-blue-500/20 dark:bg-neutral-800"
            : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700 dark:hover:bg-neutral-800"
        }`}
      >
        <span
          className={
            selectedLabel
              ? "text-neutral-900 dark:text-white"
              : "text-neutral-400"
          }
        >
          {selectedLabel || placeholder}
        </span>
        <div className="flex items-center gap-2">
          {value && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              className="cursor-pointer rounded-full p-0.5 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            >
              <X className="h-3 w-3 text-neutral-500" />
            </div>
          )}
          <ChevronDown
            className={`h-4 w-4 text-neutral-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-20 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-neutral-200 bg-white p-1 shadow-xl shadow-neutral-200/50 dark:border-neutral-800 dark:bg-neutral-900 dark:shadow-none">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              {option.label}
              {value === option.value && (
                <Check className="h-4 w-4 text-blue-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Reusable Text Input Component ---
const SearchInput = ({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
}) => (
  <div className="relative w-full sm:w-64">
    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-10 w-full rounded-xl border border-neutral-200 bg-white pr-3 pl-9 text-sm transition-all outline-none placeholder:text-neutral-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:focus:border-blue-500"
    />
    {value && (
      <button
        onClick={() => onChange("")}
        className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
      >
        <X className="h-3 w-3" />
      </button>
    )}
  </div>
);

// --- Main Component ---
const SearchInputFields = () => {
  const {
    selectedFilter,
    // Getters
    status,
    reference,
    fromDate,
    toDate,
    department,
    agent,
    issueType,
    submitter,
    // Setters
    setStatus,
    setReference,
    setFromDate,
    setToDate,
    setDepartment,
    setAgent,
    setIssueType,
    setSubmitter,
  } = useSearchLogic();

  // Render logic based on selectedFilter
  const renderInput = () => {
    switch (selectedFilter) {
      case "status":
        return (
          <CustomDropdown
            options={statusOptions}
            value={status}
            onChange={setStatus}
            placeholder="Select Status..."
          />
        );

      case "reference":
        return (
          <SearchInput
            value={reference}
            onChange={setReference}
            placeholder="Search Reference ID..."
          />
        );

      case "date":
        return (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="dark:color-scheme-dark h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-600 transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
            />

            <span className="self-center text-sm text-neutral-400">to</span>

            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="dark:color-scheme-dark h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-600 transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
            />
          </div>
        );

      case "department":
        return (
          <CustomDropdown
            options={departmentOptions}
            value={department}
            onChange={setDepartment}
            placeholder="Select Department..."
          />
        );

      case "agent":
        return (
          <SearchInput
            value={agent}
            onChange={setAgent}
            placeholder="Search Agent Name..."
          />
        );

      case "type":
        return (
          <CustomDropdown
            options={issueTypeOptions}
            value={issueType}
            onChange={setIssueType}
            placeholder="Select Issue Type..."
          />
        );

      case "submitter":
        return (
          <SearchInput
            value={submitter}
            onChange={setSubmitter}
            placeholder="Search Submitter..."
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-left-2 duration-300">
      {renderInput()}
    </div>
  );
};

export default SearchInputFields;
