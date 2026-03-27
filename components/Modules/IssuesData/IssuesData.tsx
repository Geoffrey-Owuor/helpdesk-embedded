"use client";
import { useIssuesStore } from "@/store/useIssuesStore";
import { useAutomationsStore } from "@/store/useAutomationsStore";
import IssuesDataSkeleton from "@/components/Skeletons/IssuesDataSkeleton";
import { useUser } from "@/contexts/UserContext";
import ShowHideColumnsLogic from "./ShowHideColumnsLogic";
import SearchFilterLogic from "./SearchFilterLogic";
import SearchInputFields from "./SearchInputFields";
import ClearRefreshFilters from "./ClearRefreshFilters";
import SearchFilters from "./SearchFilters";
import { useState, useEffect } from "react";
import { useSearchStore } from "@/store/useSearchStore";
import ViewAgentAdminFilter from "./ViewAgentAdminFilter";
import Pagination from "./Pagination";
import ToggleTableView from "./ToggleTableView";
import TableViewData from "./TableViewData";
import CardViewData from "./CardViewData";
import ExportData from "./ExportData";
import { useRowCount } from "@/hooks/userRowCount";
import { useQuery } from "@tanstack/react-query";

const IssuesData = ({ recordType }: { recordType: string }) => {
  const isAutomations = recordType === "automations";

  const issuesData = useIssuesStore((state) => state.issuesData);
  const loading = useIssuesStore((state) => state.loading);
  const refetchIssues = useIssuesStore((state) => state.refetchIssues);

  const automationsData = useAutomationsStore((state) => state.automationsData);
  const automationsLoading = useAutomationsStore((state) => state.loading);
  const refetchAutomations = useAutomationsStore(
    (state) => state.refetchAutomations,
  );

  const { role, department, isSuper } = useUser();

  // useSearchStore Data
  const agentAdminFilter = useSearchStore((state) => state.agentAdminFilter);
  const superAdminFilter = useSearchStore((state) => state.superAdminFilter);
  const isTableView = useSearchStore((state) => state.isTableView);
  const selectedDepartment = useSearchStore(
    (state) => state.selectedDepartment,
  );

  // Defining our variables based on record type
  const recordsData = isAutomations ? automationsData : issuesData;
  const recordsLoading = isAutomations ? automationsLoading : loading;
  const refetchRecords = isAutomations ? refetchAutomations : refetchIssues;

  // Generate a dynamic url param that we will pass to the issue url - based on the data we are currently viewing
  // We have two sources of data, some are in issuesData,  some are in Automations (based on recordType)
  const dynamicUrlParam = isAutomations ? "automation" : "issue";

  // Pagination states and logic
  const [currentPage, setCurrentPage] = useState(1);
  const {
    rowsPerPage: issuesPerPage,
    setRowsPerPage: setIssuesPerPage,
    rowsArray: perPageOptions,
  } = useRowCount();
  const totalPages = Math.ceil(recordsData.length / issuesPerPage);
  const indexOfLastIssue = currentPage * issuesPerPage;
  const indexOfFirstIssue = indexOfLastIssue - issuesPerPage;
  const currentIssues = recordsData.slice(
    indexOfFirstIssue,
    Math.min(indexOfLastIssue, recordsData.length),
  );

  // Handle issue refetching
  const handleRefetchIssues = () => {
    refetchRecords();
  };

  // useEffect that resets current page when data changes or records per page changes
  useEffect(() => {
    Promise.resolve().then(() => setCurrentPage(1));
  }, [recordsData, issuesPerPage]);

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
      {/* Title Area Refresh Button, show/hide columns and Clear filters functionalities */}
      <div className="mb-4 flex flex-col gap-6 md:flex-row md:justify-between">
        {/* The title and toggle */}
        <div className="flex items-center justify-between md:justify-center md:gap-10">
          <div className="inline-flex flex-col">
            <span className="text-xl font-semibold">
              {isAutomations ? "Automations" : "Issues"} Data
            </span>
            <span className="text-sm text-neutral-800 dark:text-neutral-400">
              {isAutomations
                ? `${selectedDepartment || "All"} Automations Summary`
                : superAdminFilter && isSuper
                  ? "All department submitted issues"
                  : `Issues ${generatedSubtitle()}`}
            </span>

            <span className="text-xs text-neutral-500">
              Total records: {recordsData.length || "none"}
            </span>
          </div>
          {role !== "user" && !isAutomations && <ViewAgentAdminFilter />}
        </div>

        {/* The refresh button, clear filters, hide columns */}
        <div className="flex items-center justify-start gap-4 md:justify-center">
          {/* Clearing filters */}
          <ClearRefreshFilters handleRefetchIssues={handleRefetchIssues} />

          {/* Show/Hide Columns Logic */}
          <ShowHideColumnsLogic />
        </div>
      </div>

      {/* The filtering logic and search input fields */}

      <div className="mb-6 flex flex-wrap items-center justify-start gap-4">
        <SearchFilterLogic recordType={recordType} />
        <SearchInputFields />
        {/* The search button */}
        <SearchFilters recordType={recordType} />

        {/* Toggle between table and card view and Export Data buttons*/}
        <div className="ml-0 flex items-center gap-4 md:ml-auto">
          <ExportData fetchAutomations={recordType} />
          <ToggleTableView />
        </div>
      </div>

      {recordsLoading ? (
        <IssuesDataSkeleton isTableView={isTableView} />
      ) : (
        <div>
          {isTableView ? (
            <TableViewData
              currentIssues={currentIssues}
              dynamicUrlParam={dynamicUrlParam}
            />
          ) : (
            <CardViewData
              currentIssues={currentIssues}
              dynamicUrlParam={dynamicUrlParam}
            />
          )}

          {/* Our pagination ui */}
          <Pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            issuesPerPage={issuesPerPage}
            setIssuesPerPage={setIssuesPerPage}
            perPageOptions={perPageOptions}
            indexOfFirstIssue={indexOfFirstIssue}
            indexOfLastIssue={indexOfLastIssue}
            issuesLength={recordsData.length}
          />
        </div>
      )}
    </>
  );
};

export default IssuesData;
