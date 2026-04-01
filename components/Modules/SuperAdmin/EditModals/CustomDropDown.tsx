"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

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

const CustomDropdown = ({
  label,
  options,
  value,
  onChange,
}: CustomDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Handle clicking outside to close the dropdown without blocking scrolling
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
      <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 shadow-sm transition-all duration-150 hover:border-neutral-400 hover:bg-neutral-50 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:border-neutral-600 dark:hover:bg-neutral-800/70 dark:focus:border-neutral-500 dark:focus:ring-neutral-700"
      >
        <span
          className={
            selectedOption ? "" : "text-neutral-400 dark:text-neutral-500"
          }
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
        /* Added absolute positioning and removed the fixed backdrop */
        <ul className="default-scrollbar absolute top-full left-0 z-70 mt-1.5 max-h-60 w-full overflow-y-auto rounded-xl border border-neutral-200 bg-white py-1.5 shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
          {options.map((item) => (
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
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomDropdown;
