"use client";
import IssuesDataSkeleton from "@/components/Skeletons/IssuesDataSkeleton";
import { useUser } from "@/contexts/UserContext";
import ShowHideColumnsLogic from "./ShowHideColumnsLogic";
import IssuesFilterPanel from "./IssuesFilterPanel";
import { useSearchStore } from "@/store/useSearchStore";
import { useIssuesFilterStore } from "@/store/useIssuesFilterStore";
import ViewAgentAdminFilter from "./ViewAgentAdminFilter";
import IssuesPagination from "./IssuesPagination";
import ToggleTableView from "./ToggleTableView";
import TableViewData from "./TableViewData";
import CardViewData from "./CardViewData";
import ExportData from "./ExportData";
import { useQuery } from "@tanstack/react-query";
import { fetchIssues } from "@/queries/fetchIssues";
import { RotateCw } from "lucide-react";
import PinnedIssuesSection from "../PinnedIssues/PinnedIssuesSection";

const IssuesData = () => {
  const { role, department, isSuper } = useUser();

  // useSearchStore Data
  const agentAdminFilter = useSearchStore((state) => state.agentAdminFilter);
  const superAdminFilter = useSearchStore((state) => state.superAdminFilter);
  const isTableView = useSearchStore((state) => state.isTableView);

  // useIssuesFilterStore Data
  const committedFilters = useIssuesFilterStore(
    (state) => state.committedFilters,
  );
  const page = useIssuesFilterStore((state) => state.page);
  const pageSize = useIssuesFilterStore((state) => state.pageSize);

  const {
    data,
    isLoading: loading,
    refetch: refetchIssues,
  } = useQuery({
    queryKey: [
      "issuesDashboardData",
      superAdminFilter,
      agentAdminFilter,
      committedFilters,
      page,
      pageSize,
    ],
    queryFn: () => fetchIssues(committedFilters, page, pageSize),
  });

  const rows = data?.rows ?? [];
  const total = data?.total ?? 0;

  // default subtitle
  const defaultSubtitle = `you have submitted`;
  const generatedSubtitle = () => {
    // Determine the text to display in title based on the current user role
    const textRoleMapping: Record<string, string> = {
      user: defaultSubtitle,
      admin:
        agentAdminFilter === "agentAdminFilter"
          ? defaultSubtitle
          : `Incoming for ${department}`,
      agent:
        agentAdminFilter === "agentAdminFilter"
          ? defaultSubtitle
          : "Assigned to You",
    };

    return textRoleMapping[role];
  };

  return (
    <>
      {/* Title Area Refresh Button, show/hide columns functionalities */}
      <div className="mb-4 flex flex-col gap-6 md:flex-row md:justify-between">
        {/* The title and toggle */}
        <div className="flex items-center justify-between md:justify-center md:gap-10">
          <div className="inline-flex flex-col">
            <span className="text-xl font-semibold">Issues Data</span>
            <span className="text-sm text-neutral-800 dark:text-neutral-400">
              {superAdminFilter && isSuper
                ? "All department submitted issues"
                : `Issues ${generatedSubtitle()}`}
            </span>

            <span className="text-xs text-neutral-500">
              Returned results: {total || "none"}
            </span>
          </div>
          {role !== "user" && <ViewAgentAdminFilter />}
        </div>

        {/* The refresh button and hide columns */}
        <div className="flex flex-wrap items-center justify-start gap-4 md:justify-center">
          <button
            onClick={() => refetchIssues()}
            title="Refresh"
            className="rounded-xl bg-neutral-100 p-2 transition-colors duration-200 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800"
          >
            <RotateCw className="h-4.5 w-4.5" />
          </button>

          {/* Export and table toggle */}
          <ExportData />
          <ToggleTableView />

          {/* Show/Hide Columns Logic */}
          <ShowHideColumnsLogic />
        </div>
      </div>

      {/* The consolidated filter panel */}
      <IssuesFilterPanel />

      {/* Pinned issues, shown ahead of the general fetched issues */}
      <PinnedIssuesSection />

      {loading ? (
        <IssuesDataSkeleton isTableView={isTableView} />
      ) : (
        <div>
          {isTableView ? (
            <TableViewData currentIssues={rows} />
          ) : (
            <CardViewData currentIssues={rows} />
          )}

          {/* Our pagination ui */}
          <IssuesPagination total={total} />
        </div>
      )}
    </>
  );
};

export default IssuesData;
