"use client";

import IssueDetailsSkeleton from "@/components/Skeletons/IssueDetailsSkeleton";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import IssueStatusFormatter from "../IssuesData/IssueStatusFormatter";
import { dateFormatter } from "@/public/assets";
import { useState, useRef, useEffect, useCallback } from "react";
import { useAlertStore } from "@/store/useAlertStore";
import { useIssueStore } from "@/store/useIssueStore";
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
import { useOverlayStore } from "@/store/useOverlayStore";
import IssuePriorityFormatter from "../IssuesData/IssuePriorityFormatter";

const statusOptions = [
  { label: "In Progress", value: "in progress" },
  { label: "Resolved", value: "resolved" },
  { label: "Unfeasible", value: "unfeasible" },
];

export const priorityOptions = [
  { label: "Critical", value: "Critical" },
  { label: "High", value: "High" },
  { label: "Medium", value: "Medium" },
  { label: "Low", value: "Low" },
];

export const IssuePage = ({ uuid }: { uuid: string }) => {
  // Our issue data
  const issueData = useIssueStore((state) => state.issueData);
  const fetchIssueData = useIssueStore((state) => state.fetchIssueData);
  const loading = useIssueStore((state) => state.loading);

  //Function for fetching issue data
  const refetchData = useCallback(async () => {
    if (uuid) await fetchIssueData(uuid);
  }, [fetchIssueData, uuid]);

  const router = useRouter();

  const triggerAlert = useAlertStore((state) => state.triggerAlert);
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const hideOverlay = useOverlayStore((state) => state.hideOverlay);
  const triggerDialog = useConfirmStore((state) => state.triggerDialog);
  const hideDialog = useConfirmStore((state) => state.hideDialog);
  const { role, email, department, userId } = useUser();

  // Status to hold our selected status
  const [isOpen, setIsOpen] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const priorityDropDownRef = useRef<HTMLDivElement>(null);

  // call useScrollToTop hook
  useScrollToTop();

  // UseEffect for fetching data on mount
  useEffect(() => {
    refetchData();
  }, [refetchData]);

  // Async function for updating the status
  const handleUpdateStatus = async (status: string) => {
    hideDialog();

    showOverlay("Updating");

    try {
      const response = await apiClient.put("/update-status", {
        uuid,
        status,
      });

      // Trigger a success alert
      triggerAlert("success", response.data.message);

      // refetch data
      await refetchData();
    } catch (error) {
      const errorMessage = getApiErrorMessage(error);
      triggerAlert("error", errorMessage);
    } finally {
      hideOverlay();
    }
  };

  // Updating the priority
  const handleUpdatePriority = async (priority: string) => {
    hideDialog();

    showOverlay("Updating");

    try {
      const response = await apiClient.put("/update-priority", {
        uuid,
        priority,
      });

      // Trigger a success alert
      triggerAlert("success", response.data.message);

      // refetch data
      await refetchData();
    } catch (error) {
      const errorMessage = getApiErrorMessage(error);
      triggerAlert("error", errorMessage);
    } finally {
      hideOverlay();
    }
  };

  const handleConfirmationDialog = (selectedValue: string) => {
    setIsOpen(false);
    // Show the dialog
    triggerDialog({
      title: "Update Status",
      description: `Confirm marking of issue as ${selectedValue}.`,
      onConfirm: () => handleUpdateStatus(selectedValue),
    });
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
  if (Object.keys(issueData).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
        <p className="text-lg font-semibold">Record not found</p>
        <button
          onClick={() => router.back()}
          className="mt-4 flex items-center gap-2 text-blue-600 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Go Back
        </button>
      </div>
    );
  }

  return (
    <>
      {loading ? (
        <IssueDetailsSkeleton />
      ) : (
        <>
          {Object.keys(issueData).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
              <p className="text-lg font-semibold">Record not found</p>
              <button
                onClick={() => router.back()}
                className="mt-4 flex items-center gap-2 text-blue-600 hover:underline"
              >
                <ArrowLeft className="h-4 w-4" /> Go Back
              </button>
            </div>
          ) : (
            <>
              {/* Title and description edit modal */}
              {isEditModalOpen && (
                <TitleDescriptionModal
                  title={issueData.issue_title}
                  description={issueData.issue_description}
                  closeModal={() => setIsEditModalOpen(false)}
                  uuid={uuid}
                  refetchData={refetchData}
                  userId={issueData.issue_submitter_id}
                />
              )}

              {isReassignModalOpen && (
                <ReassignIssue
                  uuid={uuid}
                  closeModal={() => setIsReassignModalOpen(false)}
                  issueType={issueData.issue_type}
                  refetchData={refetchData}
                  issueAgentEmail={issueData.issue_agent_email}
                />
              )}
              <div className="mx-auto max-w-6xl py-6 md:py-3.5">
                {/* --- HEADER SECTION (Unchanged) --- */}
                <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div className="flex flex-col gap-3">
                    <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">
                      {issueData.issue_title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className="font-mono text-lg font-semibold text-blue-600 dark:text-blue-400">
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
                      <IssuePriorityFormatter
                        priority={issueData.issue_priority}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={refetchData}
                      className="rounded-full bg-neutral-100 p-2 transition-colors duration-200 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800"
                    >
                      <RotateCcw />
                    </button>

                    {/* Reassigning an issue and changing the issue priority */}
                    {role === "admin" &&
                      issueData.issue_status !== "resolved" &&
                      issueData.issue_target_department === department && (
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => setIsReassignModalOpen(true)}
                            className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold transition-colors duration-200 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-transparent dark:hover:bg-neutral-900"
                          >
                            <UserRoundPen className="h-4 w-4" />
                            <span>Reassign</span>
                          </button>
                          <div
                            className="relative w-fit"
                            ref={priorityDropDownRef}
                          >
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
                                <span className="font-semibold text-neutral-500 dark:text-neutral-300">
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
                              <div className="absolute top-full right-0 z-20 mt-2 max-h-80 w-full min-w-50 origin-top-right overflow-y-auto rounded-xl border border-neutral-300 bg-white p-1 shadow-xl shadow-neutral-200/50 dark:border-neutral-700 dark:bg-neutral-950 dark:shadow-none">
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
                                      option.value === issueData.issue_priority
                                    }
                                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 disabled:opacity-50 dark:text-neutral-300 dark:hover:bg-neutral-900"
                                  >
                                    {option.label}
                                    {issueData.issue_priority ===
                                      option.value && (
                                      <Check className="h-4 w-4 text-blue-600" />
                                    )}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    {issueData.issue_agent_email === email &&
                      issueData.issue_status !== "resolved" && (
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
                              <span className="font-semibold text-neutral-500 dark:text-neutral-300">
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
                            <div className="absolute top-full right-0 z-20 mt-2 max-h-80 w-full min-w-50 origin-top-right overflow-y-auto rounded-xl border border-neutral-300 bg-white p-1 shadow-xl shadow-neutral-200/50 dark:border-neutral-700 dark:bg-neutral-950 dark:shadow-none">
                              <div className="px-2 py-2 text-xs font-semibold text-neutral-500 uppercase">
                                Status options
                              </div>
                              {statusOptions.map((option) => (
                                <button
                                  key={option.value}
                                  onClick={() =>
                                    handleConfirmationDialog(option.value)
                                  }
                                  disabled={
                                    option.value === issueData.issue_status
                                  }
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
                    <InfoBlock
                      label="Record Type"
                      value={issueData.issue_type}
                    />
                    <InfoBlock label="UUID" value={issueData.issue_uuid} />
                  </DetailCard>
                </div>

                {/* --- DESCRIPTION SECTION --- */}
                <div className="mb-6 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-white">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                        <FileText className="h-4 w-4" />
                      </div>
                      Description
                    </h2>
                    {userId === issueData.issue_submitter_id &&
                      issueData.issue_status !== "resolved" && (
                        <button
                          type="button"
                          onClick={() => setIsEditModalOpen(true)}
                          className="group rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
                        >
                          <PenLine className="h-4 w-4" />
                        </button>
                      )}
                  </div>
                  <div className="prose prose-neutral dark:prose-invert max-w-none">
                    <p className="leading-relaxed whitespace-pre-wrap text-neutral-600 dark:text-neutral-300">
                      {issueData.issue_description}
                    </p>
                  </div>
                </div>

                {/* COMMENTS SECTION */}
                <CommentsSection uuid={uuid} />
              </div>
            </>
          )}
        </>
      )}
    </>
  );
};

export default IssuePage;
