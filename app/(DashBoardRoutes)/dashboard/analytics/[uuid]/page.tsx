import { Metadata } from "next";
import { requireSession } from "@/lib/Auth";
import { getIssueMeta } from "@/lib/issues/getIssueMeta";
import { metaDescription } from "@/lib/metadata";
import { hasFeatureAccess, FEATURES } from "@/lib/FeatureAccess";
import UnauthorizedModal from "@/components/Navigation/UnauthorizedModal";
import AnalyticsIssuePage from "@/components/Modules/IssuesAnalytics/AnalyticsIssuePage";

type analyticsIssuePageProps = {
  params: Promise<{ uuid: string }>;
};

export const generateMetadata = async ({
  params,
}: analyticsIssuePageProps): Promise<Metadata> => {
  const user = await requireSession();

  if (!hasFeatureAccess(user, FEATURES.ANALYTICS))
    return { title: "Unauthorized Access" };

  const { uuid } = await params;
  const issue = user
    ? await getIssueMeta(uuid, user, { analytics: true })
    : null;

  if (!issue) return { title: "Issue not found" };

  return {
    title: issue.issue_title,
    description: metaDescription(issue.issue_description),
  };
};

const page = async ({ params }: analyticsIssuePageProps) => {
  const user = await requireSession();

  if (!hasFeatureAccess(user, FEATURES.ANALYTICS)) return <UnauthorizedModal />;

  const { uuid } = await params;
  return <AnalyticsIssuePage uuid={uuid} />;
};

export default page;
