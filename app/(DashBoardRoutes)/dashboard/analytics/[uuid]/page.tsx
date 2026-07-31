import { Metadata } from "next";
import { requireSession } from "@/lib/Auth";
import UnauthorizedModal from "@/components/Navigation/UnauthorizedModal";
import AnalyticsIssueDetailPage from "@/components/Modules/IssuesAnalytics/IssueDetail/AnalyticsIssueDetailPage";

type analyticsIssuePageProps = {
  params: Promise<{ uuid: string }>;
};

export const generateMetadata = async (): Promise<Metadata> => {
  const user = await requireSession();
  if (!user?.isSuper) return { title: "Unauthorized Access" };

  return {
    title: "Issue Details",
    description: "Read-only issue details",
  };
};

const page = async ({ params }: analyticsIssuePageProps) => {
  const user = await requireSession();
  if (!user?.isSuper) return <UnauthorizedModal />;

  const { uuid } = await params;
  return <AnalyticsIssueDetailPage uuid={uuid} />;
};

export default page;
