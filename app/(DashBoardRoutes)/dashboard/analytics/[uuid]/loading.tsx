import IssueDetailsSkeleton from "@/components/Skeletons/IssueDetailsSkeleton";

// Shown while the route renders on the server; AnalyticsIssuePage shows the same skeleton while it fetches, so the handoff doesn't shift
const loading = () => <IssueDetailsSkeleton variant="analytics" />;

export default loading;
