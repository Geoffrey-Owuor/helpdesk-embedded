"use client";
import { useIssuesData } from "@/contexts/IssuesDataContext";
import { useAutomationsData } from "@/contexts/AutomationsDataContext";
import IssuesDataSkeleton from "@/components/Skeletons/IssuesDataSkeleton";
import { useUser } from "@/contexts/UserContext";
import ShowHideColumnsLogic from "./ShowHideColumnsLogic";
import SearchFilterLogic from "./SearchFilterLogic";
import SearchInputFields from "./SearchInputFields";
import ClearRefreshFilters from "./ClearRefreshFilters";
import { useAutomations } from "@/contexts/AutomationCardsContext";
import SearchFilters from "./SearchFilters";
import { useState } from "react";
import { useSearchLogic } from "@/contexts/SearchLogicContext";
import ViewAgentAdminFilter from "./ViewAgentAdminFilter";
import Pagination from "./Pagination";
import ToggleTableView from "./ToggleTableView";
import TableViewData from "./TableViewData";
import CardViewData from "./CardViewData";

const IssuesData = ({ recordType }: { recordType: string }) => {
  const { issuesData, loading, refetchIssues } = useIssuesData();
  const {
    automationsData,
    loading: automationsLoading,
    refetchAutomations,
  } = useAutomationsData();
  const { role, department } = useUser();
  const { agentAdminFilter, isTableView } = useSearchLogic();
  const { selectedDepartment } = useAutomations();

  // Defining our variables based on record type
  let recordsData;
  let recordsLoading;
  let refetchRecords;

  // Determine which data we should use based on record type
  switch (recordType) {
    case "automations":
      recordsData = automationsData;
      recordsLoading = automationsLoading;
      refetchRecords = refetchAutomations;
      break;
    default:
      recordsData = issuesData;
      recordsLoading = loading;
      refetchRecords = refetchIssues;
      break;
  }

  // Generate a dynamic url param that we will pass to the issue url - based on the data we are currently viewing
  // We have two sources of data, some are in issuesData,  some are in Automations (based on recordType)
  const dynamicUrlParam = recordType === "automations" ? "automation" : "issue";

  // Pagination states and logic
  const [currentPage, setCurrentPage] = useState(1);
  const [issuesPerPage, setIssuesPerPage] = useState(8);
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
    setCurrentPage(1);
  };

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
              {recordType === "automations" ? "Automations" : "Issues"} Data
            </span>
            <span className="text-sm text-neutral-800 dark:text-neutral-400">
              {recordType === "automations"
                ? `${selectedDepartment} Automations Summary`
                : `Issues ${generatedSubtitle()}`}
            </span>

            <span className="text-xs text-neutral-500">
              Total records: {recordsData.length || "none"}
            </span>
          </div>
          {role !== "user" && recordType !== "automations" && (
            <ViewAgentAdminFilter setCurrentPage={setCurrentPage} />
          )}
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
        <SearchFilters
          setCurrentPage={setCurrentPage}
          recordType={recordType}
        />

        {/* Toggle between table and card view */}
        <ToggleTableView />
      </div>

      {/* Implementing table view and card view */}

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
            issuesPerPage={issuesPerPage}
            setIssuesPerPage={setIssuesPerPage}
            totalPages={totalPages}
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
