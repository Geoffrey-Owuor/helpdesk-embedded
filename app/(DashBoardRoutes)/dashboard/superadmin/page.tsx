import { Metadata } from "next";
import { requireSession } from "@/lib/Auth";
import UnauthorizedModal from "@/components/Navigation/UnauthorizedModal";
import SuperAdmin from "@/components/Modules/SuperAdmin/SuperAdmin";

export const generateMetadata = async (): Promise<Metadata> => {
  const user = await requireSession();
  if (!user?.isSuper) return { title: "Unauthorized Access" };

  return {
    title: "Super Admin",
    description: "The Super Admin Page",
  };
};

const page = async () => {
  const user = await requireSession();

  if (!user?.isSuper) return <UnauthorizedModal />;
  return <SuperAdmin />;
};

export default page;
