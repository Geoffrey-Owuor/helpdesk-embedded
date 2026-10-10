"use client";

import IssueDetailsSkeleton from "@/components/Skeletons/IssueDetailsSkeleton";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { useQuery } from "@tanstack/react-query";
import { fetchAnalyticsIssue } from "@/queries/analytics/fetchAnalyticsIssue";
import { useUser } from "@/contexts/UserContext";
import { useIssueCollaborators } from "@/hooks/useIssueCollaborators";
import { IssueNotFound } from "../IssuePage/HelperComponents/IssueNotFound";
import { IssueHeader } from "../IssuePage/HelperComponents/IssueHeader";
import { IssueDetailBody } from "../IssuePage/HelperComponents/IssueDetailBody";

const breadcrumbClass =
  "inline-flex items-center gap-2 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-200 hover:text-neutral-700 dark:bg-neutral-800/70 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-300";

// Read-only mirror of IssuePage used by the analytics table, since analytics
// viewers may not have permission to act on the underlying issue.
export const AnalyticsIssuePage = ({ uuid }: { uuid: string }) => {
  const { role, email, isSuper } = useUser();
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

  const { collaborators, isLoading: collaboratorsLoading } =
    useIssueCollaborators(uuid, issueData);

  // call useScrollToTop hook
  useScrollToTop();

  // Who can go to a particular issue - We expose the "Go to issue" button for them (Limits a user bumping into "Issue not found" when they click on "go to issue")
  const userCanView = issueData?.issue_submitter_email === email;
  const agentCanView =
    issueData?.issue_agent_email === email ||
    !!collaborators.find(
      (collaborator) =>
        collaborator.collaborator_email === issueData?.issue_agent_email,
    );
  const adminsCanView = role === "admin" || isSuper;

  if (loading) return <IssueDetailsSkeleton />;

  if (isError || !issueData) {
    return (
      <IssueNotFound backHref="/dashboard/analytics" backLabel="Analytics" />
    );
  }

  return (
    <div className="mx-auto py-6 md:py-4">
      {/* Link buttons */}
      <div className="mb-2 flex flex-wrap items-center gap-3">
        <Link href="/dashboard/analytics" className={breadcrumbClass}>
          <ArrowLeft className="h-3 w-3" />
          Back to analytics
        </Link>
        {(userCanView || agentCanView || adminsCanView) && (
          <Link
            href={`/dashboard/${issueData.issue_uuid}?title=${encodeURIComponent(issueData.issue_title)}&description=${encodeURIComponent(issueData.issue_description)}`}
            className={breadcrumbClass}
          >
            Go to issue
            <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>

      <IssueHeader issue={issueData} onRefresh={() => refetchData()} />

      {/* Comments are read-only for analytics viewers */}
      <IssueDetailBody
        issue={issueData}
        collaborators={collaborators}
        collaboratorsLoading={collaboratorsLoading}
        canComment={false}
      />
    </div>
  );
};

export default AnalyticsIssuePage;
