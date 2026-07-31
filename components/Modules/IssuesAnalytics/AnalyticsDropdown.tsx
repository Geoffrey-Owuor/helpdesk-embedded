"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, X } from "lucide-react";

export interface AnalyticsDropdownOption {
  label: string;
  value: string;
}

interface AnalyticsDropdownProps {
  label: string;
  options: AnalyticsDropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

// Single-select, clearable dropdown for the analytics filter panel.
// Modeled on the CustomDropdown inside SearchInputFields.tsx, which is a
// private, unexported component of that file and can't be reused directly.
const AnalyticsDropdown = ({
  label,
  options,
  value,
  onChange,
  placeholder,
}: AnalyticsDropdownProps) => {
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

  const selectedLabel = options.find((opt) => opt.value === value)?.label;

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
        {label}
      </span>
      <div className="relative w-full" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex h-10 w-full items-center justify-between rounded-xl border bg-white px-3 text-sm transition-all dark:bg-neutral-950 ${
            isOpen
              ? "border-blue-500 ring-2 ring-blue-500/20"
              : "border-neutral-300 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
          }`}
        >
          <span
            className={
              selectedLabel
                ? "truncate text-neutral-900 dark:text-white"
                : "truncate text-neutral-400"
            }
          >
            {selectedLabel || placeholder}
          </span>
          <div className="flex shrink-0 items-center gap-2">
            {value && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onChange("");
                }}
                className="cursor-pointer rounded-full p-0.5 hover:bg-neutral-300 dark:hover:bg-neutral-700"
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
          <div className="default-scrollbar absolute top-full left-0 z-20 mt-2 max-h-60 w-full overflow-y-auto rounded-xl border border-neutral-300 bg-white p-1 shadow-xl shadow-neutral-200/50 dark:border-neutral-700 dark:bg-neutral-950 dark:shadow-none">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-900"
              >
                <span className="truncate">{option.label}</span>
                {value === option.value && (
                  <Check className="h-4 w-4 shrink-0 text-blue-600" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDropdown;
