import IssueDetailsSkeleton from "@/components/Skeletons/IssueDetailsSkeleton";

// Shown while the route renders on the server; IssuePage shows the same skeleton while it fetches, so the handoff doesn't shift
const loading = () => <IssueDetailsSkeleton />;

export default loading;
