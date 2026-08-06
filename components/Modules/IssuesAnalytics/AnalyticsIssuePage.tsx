"use client";

import IssueDetailsSkeleton from "@/components/Skeletons/IssueDetailsSkeleton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import IssueAttachmentsViewer from "../IssueModals/IssueAttachmentsViewer";
import { AssignedAgentFormatter } from "../IssuesData/AssignedAgentFormatter";
import {
  ArrowLeft,
  Hash,
  Briefcase,
  Calendar,
  FileText,
  UserRound,
  MessageSquare,
  FileQuestion,
  LayoutDashboard,
  UndoDot,
  GitMerge,
  RotateCcw,
  ArrowRight,
} from "lucide-react";
import IssueStatusFormatter from "../IssuesData/IssueStatusFormatter";
import { dateFormatter, titleHelper } from "@/public/assets";
import { useState } from "react";
import { DetailCard } from "../IssuePage/HelperComponents/DetailCard";
import { InfoBlock } from "../IssuePage/HelperComponents/InfoBlock";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import CommentsSection from "../IssuePage/CommentsSection";
import IssuePriorityFormatter from "../IssuesData/IssuePriorityFormatter";
import { useQuery } from "@tanstack/react-query";
import { fetchAnalyticsIssue } from "@/queries/analytics/fetchAnalyticsIssue";
import EscalationHistoryModal from "../IssuePage/EscalationHistoryModal";
import ReopenHistoryModal from "../IssuePage/ReopenHistoryModal";
import RelativeTimeBadge from "../IssuesData/RelativeTimeBadge";
import { ResolutionTimePill } from "../IssuesData/ResolutionTimePill";
import { fetchCollaborators } from "@/queries/fetchCollaborators";
import { useUser } from "@/contexts/UserContext";
import SkeletonBox from "@/components/Skeletons/SkeletonBox";

// Read-only mirror of IssuePage used by the analytics table, since analytics
// viewers may not have permission to act on the underlying issue.
export const AnalyticsIssuePage = ({ uuid }: { uuid: string }) => {
  const { role } = useUser();
  const {
    data: issueData,
    isLoading: loading,
    isError,
    refetch: refetchData,
  } = useQuery({
    queryKey: ["analyticsIssue", uuid],
    queryFn: () => fetchAnalyticsIssue(uuid),
    retry: false,
  });

  // The agents invited to collaborate on this issue
  const { data: collaborators = [], isLoading: collaboratorsLoading } =
    useQuery({
      queryKey: ["issueCollaborators", uuid],
      queryFn: () => fetchCollaborators(uuid),
      enabled: Number(issueData?.collaborators_count) > 0,
    });

  const router = useRouter();

  // Escalation and Reopen History modals states
  const [escalationHistoryOpen, setEscalationHistoryOpen] = useState(false);
  const [reopenHistoryOpen, setReopenHistoryOpen] = useState(false);

  // call useScrollToTop hook
  useScrollToTop();

  if (loading) return <IssueDetailsSkeleton />;

  if (isError || !issueData) {
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
            href="/dashboard/analytics"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 sm:w-auto dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <LayoutDashboard className="h-4 w-4" />
            Analytics
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Escalation History Modal */}
      {escalationHistoryOpen && (
        <EscalationHistoryModal
          isOpen={escalationHistoryOpen}
          uuid={uuid}
          closeModal={() => setEscalationHistoryOpen(false)}
        />
      )}

      {/* Reopen History Modal */}
      {reopenHistoryOpen && (
        <ReopenHistoryModal
          isOpen={reopenHistoryOpen}
          uuid={uuid}
          closeModal={() => setReopenHistoryOpen(false)}
        />
      )}
      <div className="mx-auto py-6 md:py-4">
        {/* Link buttons */}
        <div className="mb-2 flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard/analytics"
            className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-200 hover:text-neutral-700 dark:bg-neutral-800/70 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to analytics
          </Link>
          {role === "admin" && (
            <Link
              href={`/dashboard/${issueData.issue_uuid}?title=${encodeURIComponent(issueData.issue_title)}&description=${encodeURIComponent(issueData.issue_description)}`}
              className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-200 hover:text-neutral-700 dark:bg-neutral-800/70 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
            >
              Go to issue
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
        {/* --- HEADER SECTION --- */}
        <div className="mb-4 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex flex-col gap-3">
            <h1
              title={titleHelper(issueData.issue_title)}
              className="line-clamp-1 max-w-100 text-xl font-semibold wrap-break-word text-neutral-900 dark:text-white"
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

          <div className="flex flex-col items-start gap-3 lg:items-end">
            <div className="flex flex-wrap items-center gap-2">
              {/* Reopening history button */}
              {Number(issueData.reopened_count) > 0 && (
                <button
                  onClick={() => setReopenHistoryOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                >
                  <UndoDot size={12} />
                  reopening history
                </button>
              )}

              {/* Escalation history button */}
              {Number(issueData.escalated_count) > 0 && (
                <button
                  onClick={() => setEscalationHistoryOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                >
                  <GitMerge size={12} />
                  escalation history
                </button>
              )}

              {/* Relative time badge */}
              <RelativeTimeBadge
                createdAt={issueData.issue_created_at}
                status={issueData.issue_status}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Resolution time */}
              {(issueData.issue_status === "resolved" ||
                issueData.issue_status === "closed") &&
                issueData.issue_created_at &&
                issueData.issue_date_resolved && (
                  <ResolutionTimePill
                    dateSubmitted={issueData.issue_created_at}
                    dateResolved={issueData.issue_date_resolved}
                  />
                )}
              <button
                onClick={() => refetchData()}
                className="rounded-xl bg-neutral-100 p-2 transition-colors duration-200 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800"
              >
                <RotateCcw className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        </div>

        {/* --- DETAILS GRID (3 Cards) --- */}
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
                  agentName={issueData.issue_agent_name ?? "Not Assigned"}
                />
              </div>
            </div>
          </DetailCard>

          {/* Card 3: System Info */}
          <DetailCard title="Issue Data" icon={Hash}>
            <InfoBlock label="Issue Type" value={issueData.issue_type} />

            {/* The agents invited to collaborate on this issue */}
            <div className="flex flex-col">
              <span className="text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-500">
                Collaborators
              </span>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {Number(issueData.collaborators_count) > 0 ? (
                  <>
                    {collaboratorsLoading ? (
                      <SkeletonBox className="h-7.5 w-40 rounded-full!" />
                    ) : collaborators.length === 0 ? (
                      <span className="text-sm text-neutral-400 italic dark:text-neutral-500">
                        No collaborators on this issue.
                      </span>
                    ) : (
                      collaborators.map((collaborator) => (
                        <div
                          key={collaborator.collaborator_email}
                          title={`${collaborator.collaborator_email} - invited by ${collaborator.inviter_name}`}
                          className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 py-1 pr-3 pl-1 dark:border-blue-900/40 dark:bg-blue-900/20"
                        >
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white dark:bg-blue-500">
                            {collaborator.collaborator_name
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                          <span className="max-w-32 truncate text-xs font-semibold text-blue-800 dark:text-blue-300">
                            {collaborator.collaborator_name}
                          </span>
                        </div>
                      ))
                    )}
                  </>
                ) : (
                  <span className="text-sm text-neutral-400 italic dark:text-neutral-500">
                    No collaborators on this issue.
                  </span>
                )}
              </div>
            </div>
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
            </div>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p
                title={issueData.issue_description.toString()}
                className="text-sm leading-relaxed wrap-break-word whitespace-pre-wrap text-neutral-600 dark:text-neutral-300"
              >
                {issueData.issue_description}
              </p>
            </div>
          </div>

          {/* --- ISSUE REMARKS AREA --- */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-950">
            <div className="mb-4 flex items-center">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-white">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                  <MessageSquare className="h-4 w-4" />
                </div>
                Remarks
              </h2>
            </div>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              {issueData.issue_remarks ? (
                <p
                  title={titleHelper(issueData.issue_remarks)}
                  className="text-sm leading-relaxed wrap-break-word whitespace-pre-wrap text-neutral-600 dark:text-neutral-300"
                >
                  {issueData.issue_remarks}
                </p>
              ) : (
                <p className="text-sm text-neutral-400 italic dark:text-neutral-500">
                  No remarks provided.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* --- ATTACHMENTS VIEWER --- */}
        {Number(issueData.attachments_count) > 0 && (
          <div className="mb-6">
            <IssueAttachmentsViewer uuid={uuid} />
          </div>
        )}

        {/* --- BOTTOM GRID: Comments (read-only) + Metadata --- */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Comments Section - add comment hidden for read-only viewers */}
          <CommentsSection uuid={uuid} canComment={false} />

          {/* Summary card */}
          <div className="flex flex-col rounded-xl border-t-2 border-black dark:border-white">
            {/* Card header */}
            <div className="flex items-center justify-between p-6">
              <div className="inline-flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20">
                  <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>

                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
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
                  value: dateFormatter(issueData.issue_date_resolved ?? ""),
                },
                {
                  label: "Date Closed",
                  value: dateFormatter(issueData.issue_date_closed ?? ""),
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
        </div>
      </div>
    </>
  );
};

export default AnalyticsIssuePage;
