import { Metadata } from "next";
import { requireSession } from "@/lib/Auth";
import { hasFeatureAccess, FEATURES } from "@/lib/FeatureAccess";
import UnauthorizedModal from "@/components/Navigation/UnauthorizedModal";
import AnalyticsDashboard from "@/components/Modules/IssuesAnalytics/AnalyticsDashboard";

export const generateMetadata = async (): Promise<Metadata> => {
  const user = await requireSession();

  if (!hasFeatureAccess(user, FEATURES.ANALYTICS))
    return { title: "Unauthorized Access" };

  return {
    title: "Issues Analytics",
    description: "Company-wide issues analytics dashboard",
  };
};

const page = async () => {
  const user = await requireSession();

  if (!hasFeatureAccess(user, FEATURES.ANALYTICS)) return <UnauthorizedModal />;
  return <AnalyticsDashboard />;
};

export default page;
