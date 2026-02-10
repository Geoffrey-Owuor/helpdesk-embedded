"use client";

import { useIssuesData } from "@/contexts/IssuesDataContext";
import { useAutomationsData } from "@/contexts/AutomationsDataContext";
import { useSearchParams } from "next/navigation";
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
} from "lucide-react";
import IssueStatusFormatter from "../IssuesData/IssueStatusFormatter";
import { dateFormatter } from "@/public/assets";
import { useState, useRef, useEffect } from "react";
import ConfirmationDialog from "../Overlays";
import { useAlert } from "@/contexts/AlertContext";
import apiClient from "@/lib/AxiosClient";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import { useAutomations } from "@/contexts/AutomationCardsContext";
import { useIssuesCards } from "@/contexts/IssuesCardsContext";
import { useUser } from "@/contexts/UserContext";
import TitleDescriptionModal from "./TitleDescriptionModal";
import ReassignIssue from "./ReassignIssue";
import { PromiseOverlay } from "../Overlays";
import { DetailCard } from "./HelperComponents/DetailCard";
import { InfoBlock } from "./HelperComponents/InfoBlock";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import CommentsSection from "./CommentsSection";

const statusOptions = [
  { label: "In Progress", value: "in progress" },
  { label: "Resolved", value: "resolved" },
  { label: "Unfeasible", value: "unfeasible" },
];

export const IssuePage = ({ uuid }: { uuid: string }) => {
  // Get our data
  const { issuesData, loading, refetchIssues } = useIssuesData();
  const {
    automationsData,
    loading: automationsLoading,
    refetchAutomations,
  } = useAutomationsData();
  const { refetchAutomationCounts } = useAutomations();
  const { refetchIssuesCounts } = useIssuesCards();
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const router = useRouter();
  const { setAlertInfo } = useAlert();
  const { role, email, department, userId } = useUser();

  // Status to hold our selected status
  const [selectedStatus, setSelectedStatus] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // call useScrollToTop hook
  useScrollToTop();

  const handleSelect = (selectedValue: string) => {
    setSelectedStatus(selectedValue);
    setIsOpen(false);
    setShowConfirmationDialog(true);
  };

  // Helper function for refetching data
  const refetchData = () => {
    refetchIssues();
    refetchAutomations();
    refetchAutomationCounts();
    refetchIssuesCounts();
  };

  let recordsData;
  let recordsLoading;

  switch (type) {
    case "automation":
      recordsData = automationsData;
      recordsLoading = automationsLoading;
      break;
    default:
      recordsData = issuesData;
      recordsLoading = loading;
      break;
  }
  // Defining a constant to hold our specific issue
  const issueData = recordsData.find((record) => record.issue_uuid === uuid);

  // Async function for updating the status
  const handleUpdateStatus = async () => {
    setShowConfirmationDialog(false);
    setUpdatingStatus(true);
    try {
      const response = await apiClient.put("/update-status", {
        uuid,
        status: selectedStatus,
      });

      // Set a success alert
      setAlertInfo({
        alertType: "success",
        showAlert: true,
        alertMessage:
          response.data.message || "Issue status updated successfully",
      });

      // clear selected status
      setSelectedStatus("");
      // refetch data
      refetchData();
    } catch (error) {
      const errorMessage = getApiErrorMessage(error);
      setAlertInfo({
        alertType: "error",
        showAlert: true,
        alertMessage: errorMessage,
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

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

  if (recordsLoading || (!issueData && recordsData.length === 0))
    return <IssueDetailsSkeleton />;

  // Handle case where ID is invalid or not found after loading
  if (!issueData) {
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
      {showConfirmationDialog && (
        <ConfirmationDialog
          title="Update Status"
          onConfirm={handleUpdateStatus}
          onCancel={() => setShowConfirmationDialog(false)}
          message={`Are you sure you want to mark this issue as ${selectedStatus}`}
        />
      )}
      {updatingStatus && <PromiseOverlay overlaytext="loading" />}

      {/* Title and description edit modal */}
      {isEditModalOpen && (
        <TitleDescriptionModal
          title={issueData.issue_title}
          description={issueData.issue_description}
          closeModal={() => setIsEditModalOpen(false)}
          uuid={uuid}
          userId={issueData.issue_submitter_id}
        />
      )}

      {isReassignModalOpen && (
        <ReassignIssue
          uuid={uuid}
          closeModal={() => setIsReassignModalOpen(false)}
          issueType={issueData.issue_type}
          issueAgentEmail={issueData.issue_agent_email}
        />
      )}
      <div className="mx-auto max-w-6xl py-8">
        {/* --- HEADER SECTION (Unchanged) --- */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div className="flex flex-col gap-3">
            <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">
              {issueData.issue_title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                {issueData.issue_reference_id}
              </span>
              <span className="h-1 w-1 rounded-full bg-neutral-300 dark:bg-neutral-600"></span>
              <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
                <Calendar className="h-3.5 w-3.5" />
                {dateFormatter(issueData.issue_created_at)}
              </div>
              <span className="h-1 w-1 rounded-full bg-neutral-300 dark:bg-neutral-600"></span>
              <IssueStatusFormatter status={issueData.issue_status} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={refetchData}
              className="rounded-full bg-neutral-100 p-2 transition-colors duration-200 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800"
            >
              <RotateCcw />
            </button>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden md:inline">Back</span>
            </button>

            {role === "admin" &&
              issueData.issue_status !== "resolved" &&
              issueData.issue_target_department === department && (
                <button
                  onClick={() => setIsReassignModalOpen(true)}
                  className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold transition-colors duration-200 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-transparent dark:hover:bg-neutral-900"
                >
                  <UserRoundPen className="h-4 w-4" />
                  <span className="hidden md:inline">Reassign</span>
                </button>
              )}
            {issueData.issue_agent_email === email &&
              issueData.issue_status !== "resolved" && (
                <div className="relative w-fit" ref={dropdownRef}>
                  <button
                    type="button" // Prevent form submission if inside a form
                    onClick={() => setIsOpen(!isOpen)}
                    className={`flex h-9.5 w-full min-w-45 items-center justify-between rounded-xl border bg-white px-3 text-sm transition-all sm:w-auto dark:bg-neutral-950 ${
                      isOpen
                        ? "border-blue-500 ring-2 ring-blue-500/20"
                        : "border-neutral-300 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-300">
                      <SquareCheckBig className="h-4 w-4" />
                      <span className="font-semibold text-neutral-600 dark:text-neutral-400">
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
                    <div className="absolute top-full left-0 z-20 mt-2 max-h-80 w-full min-w-50 origin-top-left overflow-y-auto rounded-xl border border-neutral-300 bg-white p-1 shadow-xl shadow-neutral-200/50 dark:border-neutral-800 dark:bg-neutral-950 dark:shadow-none">
                      <div className="px-2 py-2 text-xs font-semibold text-neutral-500 uppercase">
                        Available options
                      </div>
                      {statusOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleSelect(option.value)}
                          disabled={option.value === issueData.issue_status}
                          className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 disabled:opacity-50 dark:text-neutral-300 dark:hover:bg-neutral-900"
                        >
                          {option.label}
                          {selectedStatus === option.value && (
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
            <InfoBlock label="Record Type" value={issueData.issue_type} />
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
  );
};

export default IssuePage;
