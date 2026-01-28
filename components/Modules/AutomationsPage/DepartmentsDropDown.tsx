"use client";
import { useState, useEffect, useRef } from "react";
import { Check, ChevronDown, Building2 } from "lucide-react"; // Using Building2 for departments
import { baseDepartments } from "@/public/assets";
import { useAutomations } from "@/contexts/AutomationCardsContext";

// Map the data as requested
const departments = baseDepartments.map((department) => ({
  label: department.option,
  value: department.value,
}));

const DepartmentsDropDown = () => {
  // State for visibility
  const [isOpen, setIsOpen] = useState(false);
  const { selectedDepartment, setSelectedDepartment } = useAutomations();

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
    setSelectedDepartment(selectedValue);
    setIsOpen(false);
  };

  // Helper to get the display label - default is all
  const currentLabel =
    departments.find((d) => d.value === selectedDepartment)?.label || "All";

  return (
    <div className="relative mt-3 w-fit" ref={dropdownRef}>
      <button
        type="button" // Prevent form submission if inside a form
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-9.5 w-full min-w-55 items-center justify-between rounded-xl border bg-white px-3 text-sm transition-all sm:w-auto dark:bg-neutral-950 ${
          isOpen
            ? "border-blue-500 ring-2 ring-blue-500/20"
            : "border-neutral-300 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
        }`}
      >
        <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300">
          <Building2 className="h-4 w-4" />
          <span className="font-semibold text-neutral-500">Dept:</span>
          <span
            className={
              currentLabel
                ? "text-neutral-900 dark:text-white"
                : "text-neutral-400"
            }
          >
            {currentLabel}
          </span>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-neutral-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 z-20 mt-2 max-h-80 w-full min-w-50 origin-top-left overflow-y-auto rounded-xl border border-neutral-300 bg-white p-1 shadow-xl shadow-neutral-200/50 dark:border-neutral-800 dark:bg-neutral-950 dark:shadow-none">
          <div className="px-2 py-2 text-xs font-semibold text-neutral-500 uppercase">
            Available Departments
          </div>
          {/* Default button for fetching all cards */}
          <button
            onClick={() => handleSelect("")}
            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-900"
          >
            All
            {selectedDepartment === "" && (
              <Check className="h-4 w-4 text-blue-600" />
            )}
          </button>
          {departments.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-900"
            >
              {option.label}
              {selectedDepartment === option.value && (
                <Check className="h-4 w-4 text-blue-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DepartmentsDropDown;
