"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, X, Search } from "lucide-react";

export interface DropdownOption {
  label: string;
  value: string;
}

interface CustomDropdownProps {
  label: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  hideLabel?: boolean;
}

// Option count above which the in-menu search box is shown - short lists
// (Priority, Status) don't need it, long ones (Agent, Issue Type) do.
const SEARCH_THRESHOLD = 6;

// Single-select, clearable dropdown shared by the Issues Data and Issues
// Analytics filter panels.
const CustomDropdown = ({
  label,
  options,
  value,
  onChange,
  placeholder,
  hideLabel = false,
}: CustomDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeMenu = () => {
    setIsOpen(false);
    setSearch("");
  };

  const selectedLabel = options.find((opt) => opt.value === value)?.label;

  const showSearch = options.length > SEARCH_THRESHOLD;
  const filteredOptions = showSearch
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(search.trim().toLowerCase()),
      )
    : options;

  return (
    <div className="flex flex-col gap-1.5">
      {!hideLabel && (
        <span className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
          {label}
        </span>
      )}
      <div className="relative w-full" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => (isOpen ? closeMenu() : setIsOpen(true))}
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
          <div className="absolute top-full left-0 z-20 mt-2 w-full rounded-xl border border-neutral-300 bg-white p-1 shadow-xl shadow-neutral-200/50 dark:border-neutral-700 dark:bg-neutral-950 dark:shadow-none">
            {showSearch && (
              <div className="relative mb-1 px-0.5 pt-0.5">
                <Search className="pointer-events-none absolute top-1/2 left-3.5 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="h-8 w-full rounded-full border border-neutral-200 bg-neutral-50 pr-3 pl-8 text-sm outline-none placeholder:text-neutral-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
                />
              </div>
            )}
            <div className="default-scrollbar max-h-60 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <p className="px-3 py-2 text-sm text-neutral-400">
                  No matches found
                </p>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      closeMenu();
                    }}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-900"
                  >
                    <span className="truncate">{option.label}</span>
                    {value === option.value && (
                      <Check className="h-4 w-4 shrink-0 text-blue-600" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomDropdown;
