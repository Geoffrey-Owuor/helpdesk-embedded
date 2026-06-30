"use client";

import { useLoadingStore } from "@/store/useLoadingStore";
import { fetchIssues } from "@/queries/fetchIssues";
import { fetchAutomations } from "@/queries/fetchAutomations";
import { DEFAULT_FETCH_OPTIONS, IssueValueTypes } from "@/public/assets";
import { useQuery } from "@tanstack/react-query";
import { useSearchStore } from "@/store/useSearchStore";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { useUser } from "@/contexts/UserContext";
import { usePathname } from "next/navigation";
import { dateFormatter } from "@/public/assets";
import { dynamicCircleColor } from "./Notifications/NotificationModal";
import {
  Search,
  CheckCircle2,
  Bot,
  ArrowRight,
  Loader2,
  CircleDot,
  X,
} from "lucide-react";

const SearchArea = ({ closeBar }: { closeBar: () => void }) => {
  const { isSuper } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  // Local States
  const [isAutomation, setIsAutomation] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Global stores
  const setLoadingLine = useLoadingStore((state) => state.setLoadingLine);
  const agentAdminFilter = useSearchStore((state) => state.agentAdminFilter);
  const superAdminFilter = useSearchStore((state) => state.superAdminFilter);
  const selectedDepartment = useSearchStore(
    (state) => state.selectedDepartment,
  );

  // Queries
  const { data: issuesData = [], isLoading: loading } = useQuery({
    queryKey: ["issuesDashboardData", superAdminFilter, agentAdminFilter],
    queryFn: () => fetchIssues(DEFAULT_FETCH_OPTIONS),
    enabled: !isAutomation,
  });

  const { data: automationsData = [], isLoading: automationsLoading } =
    useQuery({
      queryKey: ["automationsDashboardData", selectedDepartment],
      queryFn: () => fetchAutomations(DEFAULT_FETCH_OPTIONS),
      enabled: isAutomation,
    });

  const recordsData = isAutomation ? automationsData : issuesData;
  const recordsLoading = isAutomation ? automationsLoading : loading;

  // --- Search Filtering Logic ---
  // Memoized so it only recalculates when the query or active dataset changes
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const lowerQuery = searchQuery.toLowerCase();

    return recordsData.filter((record) => {
      // TODO: Adjust these object keys if your automation data model differs from your issues data model
      const titleMatch = record.issue_title
        ?.toString()
        .toLowerCase()
        .includes(lowerQuery);
      const descMatch = record.issue_description
        ?.toString()
        .toLowerCase()
        .includes(lowerQuery);
      const refMatch = record.issue_reference_id
        ?.toString()
        .toLowerCase()
        .includes(lowerQuery);
      const statusMatch = record.issue_status
        ?.toString()
        .toLowerCase()
        .includes(lowerQuery);
      const priorityMatch = record.issue_priority
        ?.toString()
        .toLowerCase()
        .includes(lowerQuery);

      return (
        titleMatch || descMatch || refMatch || statusMatch || priorityMatch
      );
    });
  }, [searchQuery, recordsData]);

  // --- Routing Handler ---
  const handleIssueRoute = (record: Record<string, IssueValueTypes>) => {
    closeBar();

    const basePath = `/dashboard/${record.issue_uuid}`;

    const typeParam = isAutomation ? "automation" : "issue";
    // TODO: Verify that `record.issue_uuid` exists on both issues and automations.
    const route = `${basePath}?type=${typeParam}&title=${encodeURIComponent(
      record.issue_title || "",
    )}&description=${encodeURIComponent(record.issue_description || "")}`;

    if (pathname === basePath) return;

    setLoadingLine(true);

    router.push(route);
  };

  return (
    <div className="flex max-h-[60vh] flex-col">
      {/* ── TOP SECTION (Fixed/Non-Scrolling) ── */}
      <div className="shrink-0 border-b border-neutral-100 px-4 dark:border-neutral-800">
        <h3 className="mb-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase">
          Search
        </h3>

        {/* Dataset Toggle Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAutomation(false)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              !isAutomation
                ? "bg-neutral-900 text-white shadow-sm dark:bg-white dark:text-neutral-900"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800/50 dark:text-neutral-400 dark:hover:bg-neutral-800"
            }`}
          >
            <CheckCircle2
              size={14}
              className={!isAutomation ? "opacity-100" : "opacity-70"}
            />
            Issues
          </button>

          {isSuper && (
            <button
              onClick={() => setIsAutomation(true)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                isAutomation
                  ? "bg-neutral-900 text-white shadow-sm dark:bg-white dark:text-neutral-900"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800/50 dark:text-neutral-400 dark:hover:bg-neutral-800"
              }`}
            >
              <Bot
                size={14}
                className={isAutomation ? "opacity-100" : "opacity-70"}
              />
              Automations
            </button>
          )}
        </div>

        {/* Search Input Bar */}
        <div className="relative">
          <input
            type="text"
            autoFocus
            disabled={recordsLoading}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${isAutomation ? "automations" : "issues"}...`}
            className="h-11 w-full px-0.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none dark:text-white dark:placeholder:text-neutral-500"
          />

          {!searchQuery.trim() && (
            <kbd className="absolute top-1/2 right-0.5 -translate-y-1/2 rounded-md border border-neutral-300 px-1 py-0.5 text-xs font-semibold dark:border-neutral-700">
              ESC
            </kbd>
          )}
          {searchQuery.trim() && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute top-1/2 right-0.5 -translate-y-1/2 rounded-full p-1 text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* ── BOTTOM SECTION (Scrollable Results) ── */}
      <div className="default-scrollbar flex-1 overflow-y-auto p-4">
        {/* State 1: Data is currently loading */}
        {searchQuery.trim() && recordsLoading ? (
          <div className="flex h-32 flex-col items-center justify-center gap-3 text-neutral-400">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-xs">Fetching records...</span>
          </div>
        ) : /* State 2: No search query (Show Default Suggestions) */
        !searchQuery.trim() ? (
          <div className="space-y-4">
            <h4 className="text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">
              Quick Search
            </h4>
            <div className="flex flex-col gap-1">
              {/* TODO: Replace these placeholder queries with actual recent searches from localStorage or just hardcode some helpful hints */}
              {[
                "open",
                "resolved",
                "closed",
                "Critical",
                "High",
                "Medium",
                "Low",
              ].map((hint) => (
                <button
                  key={hint}
                  onClick={() => setSearchQuery(hint)}
                  className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800/50"
                >
                  <Search size={14} className="opacity-50" />
                  <span>{hint}</span>
                </button>
              ))}
            </div>
          </div>
        ) : /* State 3: Search Query Entered but No Results Found */
        searchResults.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center gap-2 text-center text-neutral-500 dark:text-neutral-400">
            <Search className="mb-2 h-8 w-8 opacity-20" />
            <p className="text-sm font-medium">
              No results found for &quot;{searchQuery}&quot;
            </p>
            <p className="text-xs opacity-70">
              Try adjusting your keywords or switching the filter pill above.
            </p>
          </div>
        ) : (
          /* State 4: Search Results Found */
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-semibold tracking-wider text-neutral-400 uppercase">
                Search Results
              </h4>
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                {searchResults.length}{" "}
                {searchResults.length === 1 ? "result" : "results"}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {searchResults.map((record) => (
                <button
                  key={record.issue_uuid}
                  onClick={() => handleIssueRoute(record)}
                  className="group flex cursor-pointer flex-col items-start gap-1 rounded-xl border border-transparent p-3 text-left transition-all hover:border-neutral-200 hover:bg-neutral-50 dark:hover:border-neutral-800 dark:hover:bg-neutral-900/50"
                >
                  <div className="flex w-full items-start justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <CircleDot
                        size={14}
                        className={`shrink-0 ${dynamicCircleColor[record.issue_status]}`}
                      />
                      {/* Truncated Title */}
                      <span className="line-clamp-1 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {record.issue_title || "Untitled"}
                      </span>
                    </div>
                    <ArrowRight
                      size={14}
                      className="shrink-0 text-neutral-300 opacity-0 transition-all group-hover:-translate-x-1 group-hover:opacity-100 dark:text-neutral-600"
                    />
                  </div>

                  {/* Line-clamped description */}
                  <p className="line-clamp-1 pl-6 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                    {record.issue_description || "No description provided."}
                  </p>

                  {/* Meta Information */}
                  <div className="mt-1 flex flex-wrap items-center gap-1 pl-6 text-[10px] text-neutral-400 dark:text-neutral-500">
                    <span className="font-medium">
                      {record.issue_reference_id}
                    </span>
                    <span>·</span>
                    <span>{dateFormatter(record.issue_created_at)}</span>
                    <span>·</span>
                    <span>{record.issue_submitter_name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchArea;
