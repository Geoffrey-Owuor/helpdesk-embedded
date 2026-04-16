"use client";

import IssueDetailsSkeleton from "@/components/Skeletons/IssueDetailsSkeleton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import UpdateStatusModal from "./UpdateStatusModal";
import { AssignedAgentFormatter } from "../IssuesData/AssignedAgentFormatter";
import {
  ArrowLeft,
  Hash,
  Briefcase,
  Calendar,
  FileText,
  UserRound,
  PenLine,
  SquareCheckBig,
  UserRoundPen,
  ChevronDown,
  Check,
  RotateCcw,
  ArrowUpDown,
  MessageSquare,
  FileQuestion,
  LayoutDashboard,
} from "lucide-react";
import IssueStatusFormatter from "../IssuesData/IssueStatusFormatter";
import { dateFormatter, titleHelper } from "@/public/assets";
import { useState, useRef, useEffect } from "react";
import { useAlertStore } from "@/store/useAlertStore";
import apiClient from "@/lib/AxiosClient";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import { useUser } from "@/contexts/UserContext";
import TitleDescriptionModal from "./TitleDescriptionModal";
import ReassignIssue from "./ReassignIssue";
import { DetailCard } from "./HelperComponents/DetailCard";
import { InfoBlock } from "./HelperComponents/InfoBlock";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import CommentsSection from "./CommentsSection";
import { useConfirmStore } from "@/store/useConfirmStore";
import IssueTypeModal from "./IssueTypeModal";
import IssuePriorityFormatter from "../IssuesData/IssuePriorityFormatter";
import { useSearchStore } from "@/store/useSearchStore";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { fetchIssues } from "@/queries/fetchIssues";
import { fetchAutomations } from "@/queries/fetchAutomations";
import { IssueValueTypes } from "@/public/assets";
import { DEFAULT_FETCH_OPTIONS } from "@/public/assets";
import { statusOptions as baseOptions } from "@/public/assets";
import { priorityOptions } from "@/public/assets";

const statusOptions = baseOptions.filter((option) => option.value !== "open");

export const IssuePage = ({ uuid, type }: { uuid: string; type: string }) => {
  // Initialize the query client
  const queryClient = useQueryClient();

  const isAutomation = type === "automation";

  // 1. Grab the exact same filters from your search store to match the Query Keys
  const agentAdminFilter = useSearchStore((state) => state.agentAdminFilter);
  const superAdminFilter = useSearchStore((state) => state.superAdminFilter);
  const selectedDepartment = useSearchStore(
    (state) => state.selectedDepartment,
  );

  // 2. Query Issues (Will instantly hit the cache if already loaded on the list page)
  const {
    data: issuesData = [],
    isLoading: issuesLoading,
    refetch: refetchIssues,
  } = useQuery({
    queryKey: ["issuesDashboardData", superAdminFilter, agentAdminFilter],
    queryFn: () => fetchIssues(DEFAULT_FETCH_OPTIONS),
    enabled: !isAutomation,
  });

  // 3. Query Automations (Will instantly hit the cache if already loaded)
  const {
    data: automationsData = [],
    isLoading: automationsLoading,
    refetch: refetchAutomations,
  } = useQuery({
    queryKey: ["automationsDashboardData", selectedDepartment],
    queryFn: () => fetchAutomations(DEFAULT_FETCH_OPTIONS),
    enabled: isAutomation,
  });

  // 4. Define our variables based on the record type
  const recordsData = isAutomation ? automationsData : issuesData;
  const loading = isAutomation ? automationsLoading : issuesLoading;
  const refetchInfo = isAutomation ? refetchAutomations : refetchIssues;

  // Define the exact active query key based on the record type
  const activeQueryKey = isAutomation
    ? ["automationsDashboardData", selectedDepartment]
    : ["issuesDashboardData", superAdminFilter, agentAdminFilter];

  const activeCardsKey = isAutomation
    ? ["dashboardAutomationCounts", selectedDepartment]
    : ["dashboardIssueCounts", agentAdminFilter, superAdminFilter];

  const refetchData = () => {
    refetchInfo();
  };

  // Our issue data
  const issueData = recordsData.find((issue) => issue.issue_uuid === uuid);

  const router = useRouter();

  const triggerAlert = useAlertStore((state) => state.triggerAlert);

  const triggerDialog = useConfirmStore((state) => state.triggerDialog);
  const hideDialog = useConfirmStore((state) => state.hideDialog);
  const { role, email, department, userId, isSuper } = useUser();

  // States for the update status modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");

  // Status to hold our selected status
  const [isOpen, setIsOpen] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const priorityDropDownRef = useRef<HTMLDivElement>(null);

  // call useScrollToTop hook
  useScrollToTop();

  // ADD:
  const handleConfirmationDialog = (selectedValue: string) => {
    setIsOpen(false);
    setSelectedStatus(selectedValue);
    setStatusModalOpen(true);
  };

  // Mutation for updating the priority
  const updatePriorityMutation = useMutation({
    mutationFn: (priority: string) =>
      apiClient.put("/update-priority", { uuid, priority }),

    onSuccess: (response, newPriority) => {
      queryClient.setQueryData(
        activeQueryKey,
        (oldData: Record<string, IssueValueTypes>[]) => {
          if (!oldData) return oldData;
          return oldData.map((issue: Record<string, IssueValueTypes>) =>
            issue.issue_uuid === uuid
              ? { ...issue, issue_priority: newPriority }
              : issue,
          );
        },
      );

      triggerAlert("success", response.data.message);
    },

    onError: (error) => {
      const errorMessage = getApiErrorMessage(error);
      triggerAlert("error", errorMessage);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: activeCardsKey });
    },
  });

  const handleUpdatePriority = async (priority: string) => {
    hideDialog();
    updatePriorityMutation.mutate(priority);
  };

  const handlePriorityConfirmation = (selectedValue: string) => {
    setIsPriorityOpen(false);
    // Show the dialog
    triggerDialog({
      title: "Update Priority",
      description: `Confirm changing issue priority to ${selectedValue}.`,
      onConfirm: () => handleUpdatePriority(selectedValue),
    });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Options dropdown
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
      //Prioriy dropdown
      if (
        priorityDropDownRef.current &&
        !priorityDropDownRef.current.contains(event.target as Node)
      ) {
        setIsPriorityOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) return <IssueDetailsSkeleton />;

  // Case where the issueData has not been found (The object is blank)
  if (!issueData) {
    return (
      <div className="mx-auto my-12 flex w-full max-w-md flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50/50 p-8 dark:border-neutral-800 dark:bg-neutral-900/20">
        {/* Icon */}
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800/80">
          <FileQuestion className="h-6 w-6 text-neutral-400 dark:text-neutral-500" />
        </div>

        {/* Title & Context */}
        <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
          Issue/Page not found
        </h2>
        <p className="mt-2 text-center text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
          We couldn&apos;t find the issue/page you are looking for. It may have
          been deleted, the URL might be incorrect, or you might not have
          access.
        </p>

        {/* Actions */}
        <div className="mt-8 flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={() => router.back()}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900 sm:w-auto dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>

          <Link
            href="/dashboard"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 sm:w-auto dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Update  Status Modal */}
      {statusModalOpen && (
        <UpdateStatusModal
          isOpen={statusModalOpen}
          closeModal={() => setStatusModalOpen(false)}
          uuid={uuid}
          selectedStatus={selectedStatus}
          activeQueryKey={activeQueryKey}
          activeCardsKey={activeCardsKey}
        />
      )}
      {/* Title and description edit modal */}
      {isEditModalOpen && (
        <TitleDescriptionModal
          title={issueData.issue_title}
          description={issueData.issue_description}
          isModalOpen={isEditModalOpen}
          closeModal={() => setIsEditModalOpen(false)}
          activeQueryKey={activeQueryKey}
          uuid={uuid}
          userId={issueData.issue_submitter_id}
        />
      )}

      {isReassignModalOpen && (
        <ReassignIssue
          uuid={uuid}
          closeModal={() => setIsReassignModalOpen(false)}
          isModalOpen={isReassignModalOpen}
          issueType={issueData.issue_type}
          targetDepartment={issueData.issue_target_department}
          activeQueryKey={activeQueryKey}
          issueAgentEmail={issueData.issue_agent_email}
        />
      )}
      <div className="mx-auto max-w-6xl py-6 md:py-3.5">
        {/* --- HEADER SECTION (Unchanged) --- */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div className="flex flex-col gap-3">
            <h1
              title={titleHelper(issueData.issue_title)}
              className="max-w-100 truncate text-xl font-semibold text-neutral-900 dark:text-white"
            >
              {issueData.issue_title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="font-mono text-[15px] font-semibold text-blue-600 dark:text-blue-400">
                {issueData.issue_reference_id}
              </span>
              <span className="h-1 w-1 rounded-full bg-neutral-300 dark:bg-neutral-600"></span>
              <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
                <Calendar className="h-3.5 w-3.5" />
                {dateFormatter(issueData.issue_created_at)}
              </div>
              <span className="h-1 w-1 rounded-full bg-neutral-300 dark:bg-neutral-600"></span>
              <IssueStatusFormatter status={issueData.issue_status} />
              <span className="h-1 w-1 rounded-full bg-neutral-300 dark:bg-neutral-600"></span>
              <IssuePriorityFormatter priority={issueData.issue_priority} />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={refetchData}
              className="rounded-xl bg-neutral-100 p-2 transition-colors duration-200 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800"
            >
              <RotateCcw className="h-4.5 w-4.5" />
            </button>

            {/* Reassigning an issue and changing the issue priority */}
            {((role === "admin" &&
              issueData.issue_target_department === department) ||
              isSuper) &&
              issueData.issue_status !== "closed" && (
                <div className="inline-flex items-center gap-2">
                  <button
                    onClick={() => setIsReassignModalOpen(true)}
                    className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold transition-colors duration-200 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-transparent dark:hover:bg-neutral-900"
                  >
                    <UserRoundPen className="h-4 w-4" />
                    <span>Reassign</span>
                  </button>
                  <div className="relative w-fit" ref={priorityDropDownRef}>
                    <button
                      type="button"
                      onClick={() => setIsPriorityOpen(!isPriorityOpen)}
                      className={`flex h-9.5 w-full min-w-43 items-center justify-between rounded-xl border bg-white px-3 text-sm transition-all sm:w-auto dark:bg-neutral-950 ${
                        isPriorityOpen
                          ? "border-blue-500 ring-2 ring-blue-500/20"
                          : "border-neutral-300 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
                      }`}
                    >
                      <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300">
                        <ArrowUpDown className="h-4 w-4" />
                        <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                          Change Priority:
                        </span>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 text-neutral-400 transition-transform ${
                          isPriorityOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {/* Dropdown Menu */}
                    {isPriorityOpen && (
                      <div className="default-scrollbar absolute top-full right-0 z-20 mt-2 max-h-80 w-full min-w-43 origin-top-right overflow-y-auto rounded-xl border border-neutral-300 bg-white p-1 shadow-xl shadow-neutral-200/50 dark:border-neutral-700 dark:bg-neutral-950 dark:shadow-none">
                        <div className="px-2 py-2 text-xs font-semibold text-neutral-500 uppercase">
                          Priority options
                        </div>
                        {priorityOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() =>
                              handlePriorityConfirmation(option.value)
                            }
                            disabled={
                              option.value === issueData.issue_priority ||
                              updatePriorityMutation.isPending
                            }
                            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 disabled:opacity-50 dark:text-neutral-300 dark:hover:bg-neutral-900"
                          >
                            {option.label}
                            {issueData.issue_priority === option.value && (
                              <Check className="h-4 w-4 text-blue-600" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            {(issueData.issue_agent_email === email ||
              isSuper ||
              (role === "admin" &&
                issueData.issue_target_department === department)) &&
              issueData.issue_status !== "closed" && (
                <div className="relative w-fit" ref={dropdownRef}>
                  <button
                    type="button" // Prevent form submission if inside a form
                    onClick={() => setIsOpen(!isOpen)}
                    className={`flex h-9.5 w-full min-w-43 items-center justify-between rounded-xl border bg-white px-3 text-sm transition-all sm:w-auto dark:bg-neutral-950 ${
                      isOpen
                        ? "border-blue-500 ring-2 ring-blue-500/20"
                        : "border-neutral-300 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300">
                      <SquareCheckBig className="h-4 w-4" />
                      <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                        Update Status:
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
                    <div className="default-scrollbar absolute top-full right-0 z-20 mt-2 max-h-80 w-full min-w-43 origin-top-right overflow-y-auto rounded-xl border border-neutral-300 bg-white p-1 shadow-xl shadow-neutral-200/50 dark:border-neutral-700 dark:bg-neutral-950 dark:shadow-none">
                      <div className="px-2 py-2 text-xs font-semibold text-neutral-500 uppercase">
                        Status options
                      </div>
                      {statusOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleConfirmationDialog(option.value)}
                          disabled={option.value === issueData.issue_status}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 disabled:opacity-50 dark:text-neutral-300 dark:hover:bg-neutral-900"
                        >
                          {option.label}
                          {issueData.issue_status === option.value && (
                            <Check className="h-4 w-4 text-blue-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
          </div>
        </div>

        {/* --- DETAILS GRID (Revamped into 3 Cards) --- */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Card 1: Submitter Info */}
          <DetailCard title="Submitter Details" icon={UserRound}>
            <InfoBlock
              label="Submitted By"
              value={issueData.issue_submitter_name}
            />
            <InfoBlock
              label="Department"
              value={issueData.issue_submitter_department}
            />
          </DetailCard>

          {/* Card 2: Handling Info */}
          <DetailCard title="Handling Details" icon={Briefcase}>
            <InfoBlock
              label="Target Department"
              value={issueData.issue_target_department}
            />
            <div className="flex flex-col">
              <span className="text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-500">
                Assigned Agent
              </span>
              <div className="mt-2 w-auto">
                <AssignedAgentFormatter
                  agentName={issueData.issue_agent_name}
                />
              </div>
            </div>
          </DetailCard>

          {/* Card 3: System Info */}
          <DetailCard title="Issue Data" icon={Hash}>
            <div className="flex justify-between">
              <InfoBlock label="Issue Type" value={issueData.issue_type} />
              {isSuper && issueData.issue_status !== "closed" && (
                <IssueTypeModal
                  targetDepartment={issueData.issue_target_department}
                  uuid={uuid}
                  activeQueryKey={activeQueryKey}
                  currentType={issueData.issue_type}
                />
              )}
            </div>
            <InfoBlock label="UUID" value={issueData.issue_uuid} />
          </DetailCard>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* --- DESCRIPTION SECTION --- */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-950">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-white">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                  <FileText className="h-4 w-4" />
                </div>
                Description
              </h2>
              {(userId === issueData.issue_submitter_id || isSuper) &&
                issueData.issue_status !== "closed" && (
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(true)}
                    className="group rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
                  >
                    <PenLine className="h-4 w-4" />
                  </button>
                )}
            </div>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p
                title={issueData.issue_description.toLocaleString()}
                className="line-clamp-2 leading-relaxed text-neutral-600 dark:text-neutral-300"
              >
                {issueData.issue_description}
              </p>
            </div>
          </div>

          {/* --- ISSUE REMARKS AREA --- */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-950">
            <div className="mb-4 flex items-center">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-white">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                  <MessageSquare className="h-4 w-4" />
                </div>
                Remarks
              </h2>
            </div>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              {issueData.issue_remarks ? (
                <p className="line-clamp-1 leading-relaxed text-neutral-600 dark:text-neutral-300">
                  {issueData.issue_remarks}
                </p>
              ) : (
                <p className="text-neutral-400 italic dark:text-neutral-500">
                  No remarks provided.
                </p>
              )}
            </div>
          </div>
        </div>
        {/* --- BOTTOM GRID: Description summary card + Comments --- */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Summary card */}
          <div className="flex flex-col rounded-xl border-t-2 border-black dark:border-white">
            {/* Card header */}
            <div className="flex items-center justify-between px-6 py-4">
              <div className="inline-flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <FileText className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                </div>

                <h2 className="font-semibold text-neutral-900 dark:text-white">
                  Other Metadata
                </h2>
              </div>
              <p className="hidden text-sm text-neutral-500 sm:inline-flex dark:text-neutral-400">
                Relevant metadata
              </p>
            </div>

            {/* Rows */}
            <div className="flex flex-col divide-y divide-neutral-100 px-6 dark:divide-neutral-800">
              {[
                {
                  label: "Date Updated",
                  value: dateFormatter(issueData.issue_updated_at),
                },
                {
                  label: "Date Resolved",
                  value: dateFormatter(issueData.issue_date_resolved) ?? "N/A",
                },
                {
                  label: "Date Closed",
                  value: dateFormatter(issueData.issue_date_closed) ?? "N/A",
                },
                {
                  label: "Issue Reopened",
                  value: (
                    <span className="rounded-full bg-gray-200 px-2 py-1 text-xs dark:bg-gray-800">
                      {issueData.issue_reopened}
                    </span>
                  ),
                },
                {
                  label: "Reason Reopened",
                  value: issueData.issue_reopened_reason ?? "N/A",
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-center justify-between py-3"
                >
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">
                    {label}
                  </span>
                  <span className="line-clamp-1 text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Comments Section */}
          <CommentsSection uuid={uuid} />
        </div>
      </div>
    </>
  );
};

export default IssuePage;
