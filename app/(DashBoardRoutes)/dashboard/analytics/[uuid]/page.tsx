import { Metadata } from "next";
import { requireSession } from "@/lib/Auth";
import { hasFeatureAccess, FEATURES } from "@/lib/FeatureAccess";
import UnauthorizedModal from "@/components/Navigation/UnauthorizedModal";
import AnalyticsIssuePage from "@/components/Modules/IssuesAnalytics/AnalyticsIssuePage";

type analyticsIssuePageProps = {
  params: Promise<{ uuid: string }>;
  searchParams: Promise<{ title: string; description: string }>;
};

export const generateMetadata = async ({
  searchParams,
}: analyticsIssuePageProps): Promise<Metadata> => {
  const user = await requireSession();

  if (!hasFeatureAccess(user, FEATURES.ANALYTICS))
    return { title: "Unauthorized Access" };

  const { title, description } = await searchParams;

  return {
    title: title || "Issue Title",
    description: description || "Issue Description",
  };
};

const page = async ({ params }: analyticsIssuePageProps) => {
  const user = await requireSession();

  if (!hasFeatureAccess(user, FEATURES.ANALYTICS)) return <UnauthorizedModal />;

  const { uuid } = await params;
  return <AnalyticsIssuePage uuid={uuid} />;
};

export default page;
