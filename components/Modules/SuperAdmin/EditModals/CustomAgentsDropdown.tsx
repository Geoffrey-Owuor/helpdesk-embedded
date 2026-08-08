"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import {
  ChevronDown,
  Shield,
  LucideIcon,
  Headset,
  Search,
  X,
} from "lucide-react";
import FormAsterisk from "../../FormAsterisk";
import { DropdownOption } from "./CustomDropDown";

type CustomDropdownProps = {
  label: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
};

const LabelIcon: Record<string, LucideIcon> = {
  Agent: Headset,
  Admin: Shield,
};

const CustomAgentsDropdown = ({
  label,
  options,
  value,
  onChange,
}: CustomDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Search Query
  const [searchQuery, setSearchQuery] = useState("");

  // Memoized filtered options
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;

    const query = searchQuery.toLowerCase().trim();

    return options.filter(
      (option) =>
        option.option.toLowerCase().includes(query) ||
        option.value.toLowerCase().includes(query),
    );
  }, [options, searchQuery]);

  const selectedOption = options.find((opt) => opt.value === value);
  const isSelected = !!selectedOption;

  // Getting the relevant icon
  const Icon = LabelIcon[label];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setIsOpen(false);
  };

  return (
    <div className="relative flex flex-col gap-1.5" ref={dropdownRef}>
      <label className="flex items-center gap-1 text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {label}
        <FormAsterisk />
      </label>

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative flex w-full items-center rounded-xl border border-neutral-300 bg-white py-2.5 pr-3 pl-9 text-sm shadow-sm transition-all duration-150 hover:border-neutral-400 hover:bg-neutral-50 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-neutral-600 dark:hover:bg-neutral-800/70 dark:focus:border-neutral-500 dark:focus:ring-neutral-700"
      >
        {/* Left icon — swaps to CheckCircle2 when selected, matching the name field pattern */}
        <div className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2">
          <Icon className="h-4 w-4 text-neutral-400" />
        </div>

        <span
          className={`flex-1 text-left ${
            isSelected
              ? "text-neutral-900 dark:text-neutral-100"
              : "text-neutral-400 dark:text-neutral-500"
          }`}
        >
          {selectedOption?.option || `Select ${label}`}
        </span>

        <ChevronDown
          className={`h-4 w-4 text-neutral-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <ul className="absolute top-full left-0 z-70 mt-1.5 w-full gap-2 rounded-xl border border-neutral-200 bg-white px-1 py-2 shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
          {/* SEARCH INPUT - Search threshold of six*/}
          {options.length >= 6 && (
            <div className="relative px-1 pb-2">
              <div className="relative flex items-center">
                <Search className="absolute left-2.5 h-3.5 w-3.5 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Agents"
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

          <div className="default-scrollbar flex max-h-60 flex-col overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((item) => (
                <button
                  key={item.value}
                  onClick={() => handleSelect(item.value)}
                  disabled={item.value === "Unassigned"}
                  className={`mx-1.5 cursor-pointer rounded-lg px-3 py-2 text-left text-sm transition-colors duration-100 hover:bg-neutral-100 disabled:opacity-50 dark:hover:bg-neutral-800 ${
                    value === item.value
                      ? "bg-neutral-100 font-medium text-neutral-900 dark:bg-neutral-800 dark:text-white"
                      : "text-neutral-700 dark:text-neutral-300"
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                      {item.option}
                    </span>
                    <span className="text-[10px] text-neutral-500">
                      {item.value}
                    </span>
                  </div>
                </button>
              ))
            ) : (
              /* Fallback state when no options exist */
              <div className="px-3 py-6 text-center text-sm text-neutral-400 dark:text-neutral-500">
                {searchQuery ? "No matching results found." : `No agents found`}
              </div>
            )}
          </div>
        </ul>
      )}
    </div>
  );
};

export default CustomAgentsDropdown;
