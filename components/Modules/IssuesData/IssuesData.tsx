"use client";
import IssuesDataSkeleton from "@/components/Skeletons/IssuesDataSkeleton";
import { useUser } from "@/contexts/UserContext";
import ShowHideColumnsLogic from "./ShowHideColumnsLogic";
import SearchFilterLogic from "./SearchFilterLogic";
import SearchInputFields from "./SearchInputFields";
import ClearRefreshFilters from "./ClearRefreshFilters";
import SearchFilters from "./SearchFilters";
import { useState, useEffect, useMemo } from "react";
import { useSearchStore } from "@/store/useSearchStore";
import ViewAgentAdminFilter from "./ViewAgentAdminFilter";
import Pagination from "./Pagination";
import ToggleTableView from "./ToggleTableView";
import TableViewData from "./TableViewData";
import CardViewData from "./CardViewData";
import ExportData from "./ExportData";
import { useRowCount } from "@/hooks/userRowCount";
import { useQuery } from "@tanstack/react-query";
import { fetchIssues } from "@/queries/fetchIssues";
import { fetchAutomations } from "@/queries/fetchAutomations";
import ActiveFilterPills from "./ActiveFilterPills";
import { DEFAULT_FETCH_OPTIONS, Options } from "@/public/assets";

const IssuesData = ({ recordType }: { recordType: string }) => {
  const isAutomations = recordType === "automations";

  const { role, department, isSuper } = useUser();

  // useSearchStore Data
  const agentAdminFilter = useSearchStore((state) => state.agentAdminFilter);
  const superAdminFilter = useSearchStore((state) => state.superAdminFilter);
  const isTableView = useSearchStore((state) => state.isTableView);
  const selectedDepartment = useSearchStore(
    (state) => state.selectedDepartment,
  );

  // Committed state - only applies filters when search button is clicked
  const [committedFilters, setCommittedFilters] = useState<Options | null>(
    null,
  );

  const {
    data: issuesData = [],
    isLoading: loading,
    refetch: refetchIssues,
  } = useQuery({
    queryKey: ["issuesDashboardData", superAdminFilter, agentAdminFilter],
    queryFn: () => fetchIssues(DEFAULT_FETCH_OPTIONS),
    enabled: !isAutomations,
  });

  const {
    data: automationsData = [],
    isLoading: automationsLoading,
    refetch: refetchAutomations,
  } = useQuery({
    queryKey: ["automationsDashboardData", selectedDepartment],
    queryFn: () => fetchAutomations(DEFAULT_FETCH_OPTIONS),
    enabled: isAutomations,
  });

  // Defining our variables based on record type
  const recordsData = isAutomations ? automationsData : issuesData;
  const recordsLoading = isAutomations ? automationsLoading : loading;
  const refetchRecords = isAutomations ? refetchAutomations : refetchIssues;

  const filteredData = useMemo(() => {
    if (!committedFilters) return recordsData;

    return recordsData.filter((record) => {
      const {
        status,
        fromDate,
        toDate,
        reference,
        department,
        agent,
        issueType,
        issuePriority,
        submitter,
      } = committedFilters;

      if (status && record.issue_status !== status) return false;
      if (
        reference &&
        !record.issue_reference_id
          .toLocaleString()
          .toLocaleLowerCase()
          .includes(reference.toLowerCase())
      )
        return false;
      if (department) {
        let departmentCheck;

        if (role === "user") {
          departmentCheck = record.issue_target_department;
        } else if (role === "admin" || role === "agent") {
          departmentCheck =
            agentAdminFilter === "agentAdminFilter"
              ? record.issue_target_department
              : record.issue_submitter_department;
        } else {
          departmentCheck = record.issue_target_department;
        }

        if (departmentCheck !== department) return false;
      }
      if (
        agent &&
        !record.issue_agent_name
          .toLocaleString()
          .toLocaleLowerCase()
          .includes(agent.toLocaleLowerCase())
      )
        return false;
      if (
        issueType &&
        !record.issue_type
          .toLocaleString()
          .toLocaleLowerCase()
          .includes(issueType.toLocaleLowerCase())
      )
        return false;
      if (issuePriority && record.issue_priority !== issuePriority)
        return false;
      if (
        submitter &&
        !record.issue_submitter_name
          .toLocaleString()
          .toLocaleLowerCase()
          .includes(submitter.toLocaleLowerCase())
      )
        return false;
      if (fromDate && new Date(record.issue_created_at) < new Date(fromDate))
        return false;
      if (
        toDate &&
        new Date(record.issue_created_at) >
          new Date(new Date(toDate).setHours(23, 59, 59, 999))
      )
        return false;

      return true;
    });
  }, [recordsData, committedFilters, role, agentAdminFilter]);

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
  const totalPages = Math.ceil(filteredData.length / issuesPerPage);
  const indexOfLastIssue = currentPage * issuesPerPage;
  const indexOfFirstIssue = indexOfLastIssue - issuesPerPage;
  const currentIssues = filteredData.slice(
    indexOfFirstIssue,
    Math.min(indexOfLastIssue, filteredData.length),
  );

  // useEffect that resets current page when data changes or records per page changes
  useEffect(() => {
    Promise.resolve().then(() => setCurrentPage(1));
  }, [filteredData, issuesPerPage]);

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
              Total records: {filteredData.length || "none"}
            </span>
          </div>
          {role !== "user" && !isAutomations && <ViewAgentAdminFilter />}
        </div>

        {/* The refresh button, clear filters, hide columns */}
        <div className="flex items-center justify-start gap-4 md:justify-center">
          {/* Clearing filters */}
          <ClearRefreshFilters
            handleRefetchIssues={() => {
              refetchRecords();
              setCommittedFilters(null);
            }}
          />

          {/* Show/Hide Columns Logic */}
          <ShowHideColumnsLogic />
        </div>
      </div>

      {/* The filtering logic and search input fields */}

      <div className="mb-4 flex flex-wrap items-center justify-start gap-4">
        <SearchFilterLogic recordType={recordType} />
        <SearchInputFields />
        {/* The search button */}
        <SearchFilters
          onSearch={(filters: Options) => setCommittedFilters(filters)}
        />

        {/* Toggle between table and card view and Export Data buttons*/}
        <div className="ml-0 flex items-center gap-4 md:ml-auto">
          <ExportData fetchAutomations={recordType} />
          <ToggleTableView />
        </div>
      </div>

      {/* Active filter pills */}
      <ActiveFilterPills
        committedFilters={committedFilters}
        setCommittedFilters={setCommittedFilters}
      />

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
            issuesLength={filteredData.length}
          />
        </div>
      )}
    </>
  );
};

export default IssuesData;
