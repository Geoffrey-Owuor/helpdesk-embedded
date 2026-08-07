import { QueryClient } from "@tanstack/react-query";

// Reusable invalidation for anything that changes an issue's state - creation,
// status/priority/type changes, reassignment, reopening, escalation, etc.
// Uses TanStack's array-prefix matching so it catches every filter/page
// variant of the list/cards queries without needing their exact key shape.
// Also invalidates the Analytics dashboard's queries, which otherwise have no
// invalidation hook from anywhere else in the app and would go stale silently.
export const invalidateIssuesCaches = (
  queryClient: QueryClient,
  { uuid }: { uuid?: string } = {},
) => {
  queryClient.invalidateQueries({ queryKey: ["issuesDashboardData"] });
  queryClient.invalidateQueries({ queryKey: ["dashboardIssueCounts"] });

  if (uuid) {
    queryClient.invalidateQueries({ queryKey: ["issue", uuid] });
  }

  queryClient.invalidateQueries({ queryKey: ["analyticsIssues"] });
  queryClient.invalidateQueries({ queryKey: ["analyticsSummary"] });
};
