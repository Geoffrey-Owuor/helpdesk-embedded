import { IssuePage } from "@/components/Modules/IssuePage/IssuePage";
import { requireSession } from "@/lib/Auth";
import { getIssueMeta, metaDescription } from "@/lib/issues/getIssueMeta";
import { Metadata } from "next";

type issuePageProps = {
  params: Promise<{ uuid: string }>;
};

// Generating page metadata from the issue itself, for those who can see it
export const generateMetadata = async ({
  params,
}: issuePageProps): Promise<Metadata> => {
  const [{ uuid }, user] = await Promise.all([params, requireSession()]);
  const issue = user ? await getIssueMeta(uuid, user) : null;

  if (!issue) return { title: "Issue not found" };

  return {
    title: issue.issue_title,
    description: metaDescription(issue.issue_description),
  };
};

const page = async ({ params }: issuePageProps) => {
  const { uuid } = await params;
  return <IssuePage uuid={uuid} />;
};

export default page;
