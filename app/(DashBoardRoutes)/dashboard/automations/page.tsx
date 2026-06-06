import AutomationsPage from "@/components/Modules/AutomationsPage/AutomationsPage";
import { Metadata } from "next";
import { requireSession } from "@/lib/Auth";
import UnauthorizedModal from "@/components/Navigation/UnauthorizedModal";

export const generateMetadata = async (): Promise<Metadata> => {
  const user = await requireSession();
  if (user?.role === "user") return { title: "Unauthorized Access" };

  return {
    title: "Automations",
    description: "Automations page showing submitted automation requets",
  };
};

const page = async () => {
  const user = await requireSession();
  if (user?.role === "user") return <UnauthorizedModal />;
  return <AutomationsPage />;
};

export default page;
