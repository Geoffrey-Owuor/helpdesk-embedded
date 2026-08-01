"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  Check,
  ChevronDown,
  Building2,
  HelpCircle,
  Loader2,
  Search,
  X,
} from "lucide-react";
import { IssueOption } from "@/serverActions/GetIssueTypes";
import { generateValueType } from "@/public/assets";

interface OptionsDropDownProps {
  value: string;
  options: Record<string, string>[] | IssueOption[];
  dropDownType: string;
  onChange: (value: string) => void;
  error?: boolean;
  loading?: boolean;
  disabled?: boolean;
}

const OptionsDropDown = ({
  value,
  onChange,
  options,
  dropDownType,
  error,
  loading,
  disabled = false,
}: OptionsDropDownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Search input state
  const [searchQuery, setSearchQuery] = useState("");

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

  // Clear search query whenever the dropdown opens/closes
  useEffect(() => {
    if (!isOpen) {
      Promise.resolve().then(() => setSearchQuery(""));
    }
  }, [isOpen]);

  // Memoized filtered options
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;

    const query = searchQuery.toLowerCase().trim();

    return options.filter((option) => {
      // Determine label to check against based on dropdown type
      const targetLabel =
        dropDownType === "department"
          ? option.option
          : generateValueType(option.option);

      return targetLabel.toLowerCase().includes(query);
    });
  }, [options, searchQuery, dropDownType]);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button" // Important: prevents form submission
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex w-full items-center justify-between rounded-xl border bg-white px-3 py-2 text-sm transition-all focus:ring-1 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-900 ${
          isOpen
            ? "border-blue-500 ring-1 ring-blue-500/20"
            : "hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
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
            className={`${!value ? "text-neutral-500" : "line-clamp-1 text-neutral-900 dark:text-neutral-100"}`}
          >
            {value
              ? generateValueType(value)
              : dropDownType === "department"
                ? "Select a department..."
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
        <div className="absolute top-full left-0 z-20 mt-1 w-full rounded-xl border border-neutral-300 bg-white p-1 shadow-2xl dark:border-neutral-700 dark:bg-neutral-900">
          <div className="px-2 py-2 text-xs font-semibold text-neutral-500 uppercase">
            Select {dropDownType === "department" ? "Department" : "Issue Type"}
          </div>

          {/* SEARCH INPUT - Search threshold of six*/}
          {options.length > 6 && (
            <div className="relative px-1 pb-2">
              <div className="relative flex items-center">
                <Search className="absolute left-2.5 h-3.5 w-3.5 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${dropDownType === "department" ? "departments" : "issue types"}...`}
                  className="w-full rounded-full border border-neutral-200 bg-neutral-100 py-2 pr-8 pl-8 text-xs text-neutral-900 placeholder-neutral-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500 dark:focus:border-blue-500 dark:focus:bg-neutral-900"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 rounded-full p-0.5 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-600 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="default-scrollbar max-h-60 overflow-y-auto">
            {loading ? (
              <div className="flex items-center gap-1 px-3 py-6 text-sm text-neutral-400 dark:text-neutral-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  <span
                    title={generateValueType(option.option)}
                    className="line-clamp-1 text-left"
                  >
                    {dropDownType === "department"
                      ? option.option
                      : generateValueType(option.option)}
                  </span>
                  {value === option.value && (
                    <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  )}
                </button>
              ))
            ) : (
              /* Fallback state when no options exist */
              <div className="px-3 py-6 text-center text-sm text-neutral-400 dark:text-neutral-500">
                {searchQuery
                  ? "No matching results found."
                  : `No ${dropDownType === "department" ? "departments" : "issue types"} found for this selection.`}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OptionsDropDown;
