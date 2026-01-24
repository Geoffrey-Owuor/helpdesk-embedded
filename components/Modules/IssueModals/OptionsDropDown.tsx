"use client";

import { useState, useEffect, useRef } from "react";
import {
  Check,
  ChevronDown,
  Building2,
  HelpCircle,
  Loader2,
} from "lucide-react";
import { IssueOption } from "@/serverActions/GetIssueTypes";

interface OptionsDropDownProps {
  value: string;
  options: Record<string, string>[] | IssueOption[];
  dropDownType: string;
  onChange: (value: string) => void;
  error?: boolean;
  loading?: boolean;
}

const OptionsDropDown = ({
  value,
  onChange,
  options,
  dropDownType,
  error,
  loading,
}: OptionsDropDownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
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

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setIsOpen(false);
  };

  // Find the label for the current value
  const selectedLabel = options.find(
    (option) => option.value === value,
  )?.option;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button" // Important: prevents form submission
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm transition-all focus:ring-1 focus:ring-blue-500 focus:outline-none ${
          isOpen
            ? "border-blue-500 bg-white ring-1 ring-blue-500/20 dark:bg-neutral-800"
            : "bg-white hover:bg-neutral-50 dark:bg-neutral-800 dark:hover:bg-neutral-700/50"
        } ${
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
            : "border-neutral-300 dark:border-neutral-700"
        }`}
      >
        <div className="flex items-center gap-2">
          {/* Optional: Add an icon for the department field */}
          {dropDownType === "department" ? (
            <Building2 className="h-4 w-4 text-neutral-400" />
          ) : (
            <HelpCircle className="h-4 w-4 text-neutral-400" />
          )}

          <span
            className={`${!value ? "text-neutral-500" : "text-neutral-900 dark:text-neutral-100"}`}
          >
            {value
              ? selectedLabel
              : dropDownType === "department"
                ? "Direct this issue to..."
                : "Select an issue type..."}
          </span>
        </div>

        <ChevronDown
          className={`h-4 w-4 text-neutral-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-neutral-200 bg-white p-1 shadow-xl shadow-neutral-200/50 dark:border-neutral-700 dark:bg-neutral-800 dark:shadow-none">
          <div className="px-2 py-2 text-xs font-semibold text-neutral-500 uppercase">
            Select {dropDownType === "department" ? "Department" : "Issue Type"}
          </div>

          {loading && (
            <div className="flex items-center gap-1 px-3 py-6 text-sm text-neutral-400 dark:text-neutral-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading...</span>
            </div>
          )}

          {options.length > 0 ? (
            options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
              >
                <span>{option.option}</span>
                {value === option.value && (
                  <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                )}
              </button>
            ))
          ) : (
            /* Fallback state when no options exist */
            <div className="px-3 py-6 text-center text-sm text-neutral-400 dark:text-neutral-500">
              No {dropDownType === "department" ? "departments" : "issue types"}{" "}
              found for this selection.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OptionsDropDown;
