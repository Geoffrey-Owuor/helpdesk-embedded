"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import { ChevronDown, Search, X, Filter } from "lucide-react";
import { ArticlesCardValues } from "@/serverActions/GetUserArticles";

type FilterCategory = "department" | "publisher" | "article_type";

export interface FilterPill {
  id: string;
  category: FilterCategory;
  value: string;
}

interface ArticleSearchFilterProps {
  articles: ArticlesCardValues[];
  committedFilters: FilterPill[];
  setCommittedFilters: React.Dispatch<React.SetStateAction<FilterPill[]>>;
}

const filterCategories: { label: string; value: FilterCategory }[] = [
  { label: "Department", value: "department" },
  { label: "Publisher", value: "publisher" },
  { label: "Article Type", value: "article_type" },
];

const ArticleSearchFilter = ({
  articles,
  committedFilters,
  setCommittedFilters,
}: ArticleSearchFilterProps) => {
  const [activeCategory, setActiveCategory] =
    useState<FilterCategory>("department");
  const [inputValue, setInputValue] = useState("");

  // Custom dropdown states
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isValueDropdownOpen, setIsValueDropdownOpen] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryRef.current &&
        !categoryRef.current.contains(event.target as Node)
      )
        setIsCategoryDropdownOpen(false);
      if (valueRef.current && !valueRef.current.contains(event.target as Node))
        setIsValueDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Dynamically extract unique values from the raw articles array
  const uniqueOptions = useMemo(() => {
    const departments = Array.from(
      new Set(articles.map((a) => a.user_department)),
    ).filter(Boolean);
    const types = Array.from(
      new Set(articles.map((a) => a.article_type)),
    ).filter(Boolean);
    return { department: departments, article_type: types };
  }, [articles]);

  const handleAddFilter = () => {
    if (!inputValue.trim()) return;

    // Prevent exact duplicates
    const isDuplicate = committedFilters.some(
      (pill) =>
        pill.category === activeCategory &&
        pill.value.toLowerCase() === inputValue.toLowerCase(),
    );

    if (!isDuplicate) {
      setCommittedFilters((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          category: activeCategory,
          value: inputValue,
        },
      ]);
    }
    setInputValue(""); // Reset input
  };

  const removeFilter = (idToRemove: string) => {
    setCommittedFilters((prev) =>
      prev.filter((pill) => pill.id !== idToRemove),
    );
  };

  const activeCategoryLabel = filterCategories.find(
    (c) => c.value === activeCategory,
  )?.label;

  return (
    <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900/20">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        {/* 1. Category Selector */}
        <div
          className="relative flex flex-col gap-1.5 sm:w-48"
          ref={categoryRef}
        >
          <label className="text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
            Filter By
          </label>
          <button
            type="button"
            onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
            className="flex w-full items-center justify-between rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 shadow-sm transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-800/40"
          >
            <span className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-neutral-400" />
              {activeCategoryLabel}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-neutral-400 transition-transform ${isCategoryDropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {isCategoryDropdownOpen && (
            <ul className="absolute top-full left-0 z-10 mt-1 w-full rounded-xl border border-neutral-200 bg-white p-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
              {filterCategories.map((cat) => (
                <li
                  key={cat.value}
                  onClick={() => {
                    setActiveCategory(cat.value);
                    setInputValue(""); // Reset input when changing category
                    setIsCategoryDropdownOpen(false);
                  }}
                  className="cursor-pointer rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-700"
                >
                  {cat.label}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 2. Dynamic Input (Dropdown for Dept/Type, Text for Publisher) */}
        <div className="relative flex flex-1 flex-col gap-1.5" ref={valueRef}>
          <label className="text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
            Select / Search Value
          </label>

          {activeCategory === "publisher" ? (
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Search publisher name..."
                onKeyDown={(e) => e.key === "Enter" && handleAddFilter()}
                className="w-full rounded-xl border border-neutral-300 bg-white py-2.5 pr-3 pl-9 text-sm text-neutral-900 shadow-sm focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder-neutral-500"
              />
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsValueDropdownOpen(!isValueDropdownOpen)}
                className="flex w-full items-center justify-between rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 shadow-sm transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-800/40"
              >
                <span
                  className={inputValue ? "capitalize" : "text-neutral-400"}
                >
                  {inputValue || `Select ${activeCategoryLabel}`}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-neutral-400 transition-transform ${isValueDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isValueDropdownOpen && (
                <ul className="absolute top-full left-0 z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-neutral-200 bg-white p-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
                  {uniqueOptions[
                    activeCategory as "department" | "article_type"
                  ].map((opt) => (
                    <li
                      key={opt}
                      onClick={() => {
                        setInputValue(opt);
                        setIsValueDropdownOpen(false);
                      }}
                      className="cursor-pointer rounded-lg px-3 py-2 text-sm text-neutral-700 capitalize hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-700"
                    >
                      {opt}
                    </li>
                  ))}
                  {uniqueOptions[
                    activeCategory as "department" | "article_type"
                  ].length === 0 && (
                    <li className="px-3 py-2 text-sm text-neutral-500">
                      No options found.
                    </li>
                  )}
                </ul>
              )}
            </>
          )}
        </div>

        {/* 3. Add Filter Button */}
        <button
          onClick={handleAddFilter}
          disabled={!inputValue.trim()}
          className="rounded-xl bg-neutral-900 px-5 py-2.5 text-sm text-white shadow-sm transition-colors hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          Add Filter
        </button>
      </div>

      {/* 4. Active Filter Pills */}
      {committedFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-t border-neutral-200 pt-4 dark:border-neutral-800">
          <span className="text-xs font-medium text-neutral-500">
            Active Filters:
          </span>
          {committedFilters.map((pill) => (
            <div
              key={pill.id}
              className="flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-900 dark:bg-blue-900/30 dark:text-blue-100"
            >
              <span className="font-semibold capitalize">
                {pill.category.replace("_", " ")}:
              </span>
              <span>{pill.value}</span>
              <button
                onClick={() => removeFilter(pill.id)}
                className="ml-1 rounded-full p-0.5 hover:bg-blue-200 dark:hover:bg-blue-900/70"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          <button
            onClick={() => setCommittedFilters([])}
            className="ml-2 text-xs text-neutral-500 underline-offset-2 hover:text-neutral-800 hover:underline dark:hover:text-neutral-300"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
};

export default ArticleSearchFilter;
