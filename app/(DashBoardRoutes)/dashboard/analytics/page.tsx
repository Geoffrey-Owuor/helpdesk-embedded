import { Metadata } from "next";
import { requireSession } from "@/lib/Auth";
import UnauthorizedModal from "@/components/Navigation/UnauthorizedModal";
import AnalyticsDashboard from "@/components/Modules/IssuesAnalytics/AnalyticsDashboard";

export const generateMetadata = async (): Promise<Metadata> => {
  const user = await requireSession();

  if (user?.role !== "admin") return { title: "Unauthorized Access" };

  return {
    title: "Issues Analytics",
    description: "Company-wide issues analytics dashboard",
  };
};

const page = async () => {
  const user = await requireSession();

  if (user?.role !== "admin") return <UnauthorizedModal />;
  return <AnalyticsDashboard />;
};

export default page;
