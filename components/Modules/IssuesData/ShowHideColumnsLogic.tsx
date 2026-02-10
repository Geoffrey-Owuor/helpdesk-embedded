"use client";
import { useState, useRef, useEffect } from "react";
import { Columns2, ChevronDown, Check } from "lucide-react";
import {
  useColumnVisibility,
  columnLabels,
} from "@/contexts/ColumnVisibilityContext";
import { useSearchLogic } from "@/contexts/SearchLogicContext";

const ShowHideColumnsLogic = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { visibleColumns, toggleColumn } = useColumnVisibility();
  const { isTableView } = useSearchLogic();

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

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={!isTableView}
        className={`flex h-9.5 items-center gap-2 rounded-xl border px-3 text-sm transition-colors disabled:opacity-50 ${
          isOpen
            ? "border-blue-500 bg-white ring-2 ring-blue-500/20 dark:bg-neutral-900"
            : "border-neutral-300 bg-neutral-100 text-neutral-900 hover:bg-neutral-200 dark:border-neutral-800 dark:bg-neutral-800/50 dark:text-white dark:hover:bg-neutral-700/50"
        }`}
      >
        <Columns2 className="h-4.5 w-4.5" />
        <span>
          <span className="hidden max-w-40 truncate sm:inline-flex">
            Show/Hide Columns
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 z-20 mt-2 max-h-80 w-56 overflow-y-auto rounded-xl border border-neutral-300 bg-white p-1 shadow-xl shadow-neutral-200/50 dark:border-neutral-700 dark:bg-neutral-950 dark:shadow-none">
          <div className="px-2 py-2 text-xs font-semibold text-neutral-500 uppercase">
            Visible Columns
          </div>
          <div className="flex flex-col gap-0.5">
            {(
              Object.keys(columnLabels) as Array<keyof typeof columnLabels>
            ).map((key) => (
              <button
                key={key}
                onClick={() => toggleColumn(key)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-900"
              >
                <span>{columnLabels[key]}</span>
                {visibleColumns[key] && (
                  <Check className="h-4 w-4 text-blue-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowHideColumnsLogic;
