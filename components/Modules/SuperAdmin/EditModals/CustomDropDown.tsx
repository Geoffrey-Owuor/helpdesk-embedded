"use client";
import { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  Building,
  Shield,
  Activity,
  LucideIcon,
  Siren,
  UserRound,
  KeyRound,
  Search,
} from "lucide-react";
import FormAsterisk from "../../FormAsterisk";

export type DropdownOption = {
  option: string;
  value: string;
};

type CustomDropdownProps = {
  label: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
};

const LabelIcon: Record<string, LucideIcon> = {
  Department: Building,
  Role: Shield,
  Status: Activity,
  Priority: Siren,
  User: UserRound,
  Feature: KeyRound,
};

// Option count above which the in-menu search box is shown - short lists
// don't need it, long ones (User) do.
const SEARCH_THRESHOLD = 6;

const CustomDropdown = ({
  label,
  options,
  value,
  onChange,
}: CustomDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const isSelected = !!selectedOption;

  // Getting the relevant icon
  const Icon = LabelIcon[label];

  const showSearch = options.length > SEARCH_THRESHOLD;
  const filteredOptions = showSearch
    ? options.filter((opt) =>
        opt.option.toLowerCase().includes(search.trim().toLowerCase()),
      )
    : options;

  const closeMenu = () => {
    setIsOpen(false);
    setSearch("");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        closeMenu();
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
    closeMenu();
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
        <div className="absolute top-full left-0 z-70 mt-1.5 w-full rounded-xl border border-neutral-200 bg-white py-1.5 shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
          {showSearch && (
            <div className="relative mb-1.5 px-2">
              <Search className="pointer-events-none absolute top-1/2 left-5 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="h-8 w-full rounded-full border border-neutral-200 bg-neutral-50 pr-3 pl-8 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:border-neutral-500 dark:focus:ring-neutral-700"
              />
            </div>
          )}
          <ul className="default-scrollbar max-h-60 overflow-y-auto">
            {/* Options list */}
            {filteredOptions.length === 0 ? (
              <li className="px-3.5 py-2 text-sm text-neutral-400">
                No matches found
              </li>
            ) : (
              filteredOptions.map((item) => (
                <li
                  key={item.value}
                  onClick={() => handleSelect(item.value)}
                  className={`mx-1.5 cursor-pointer rounded-lg px-3 py-2 text-sm transition-colors duration-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                    value === item.value
                      ? "bg-neutral-100 font-medium text-neutral-900 dark:bg-neutral-800 dark:text-white"
                      : "text-neutral-700 dark:text-neutral-300"
                  }`}
                >
                  {item.option}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
