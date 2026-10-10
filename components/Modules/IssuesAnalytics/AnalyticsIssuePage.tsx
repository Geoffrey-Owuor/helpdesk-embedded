"use client";

import IssueDetailsSkeleton from "@/components/Skeletons/IssueDetailsSkeleton";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { useQuery } from "@tanstack/react-query";
import { fetchAnalyticsIssue } from "@/queries/analytics/fetchAnalyticsIssue";
import { useIssueCollaborators } from "@/hooks/useIssueCollaborators";
import { IssueNotFound } from "../IssuePage/HelperComponents/IssueNotFound";
import { IssueHeader } from "../IssuePage/HelperComponents/IssueHeader";
import { IssueDetailBody } from "../IssuePage/HelperComponents/IssueDetailBody";

const breadcrumbClass =
  "inline-flex items-center gap-2 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-600 hover:bg-neutral-200 hover:text-neutral-700 dark:bg-neutral-800/70 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-300";

// Read-only mirror of IssuePage used by the analytics table, since analytics
// viewers may not have permission to act on the underlying issue.
export const AnalyticsIssuePage = ({ uuid }: { uuid: string }) => {
  const {
    data: issueData,
    isLoading: loading,
    isError,
    isFetching,
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

  if (loading) return <IssueDetailsSkeleton variant="analytics" />;

  if (isError || !issueData) {
    return (
      <IssueNotFound backHref="/dashboard/analytics" backLabel="Analytics" />
    );
  }

  return (
    <div className="mx-auto py-6 md:py-4">
      <IssueHeader
        issue={issueData}
        onRefresh={() => refetchData()}
        isRefreshing={isFetching}
        breadcrumb={
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/dashboard/analytics" className={breadcrumbClass}>
              <ArrowLeft className="h-3 w-3" />
              Back to analytics
            </Link>
            {issueData.viewer_can_open && (
              <Link
                href={`/dashboard/${issueData.issue_uuid}`}
                className={breadcrumbClass}
              >
                Go to issue
                <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        }
      />

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
