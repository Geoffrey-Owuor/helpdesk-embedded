import AutomationsPage from "@/components/Modules/AutomationsPage/AutomationsPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Department Automations Overview",
  description: "Automations page showing submitted automation requets",
};

const page = () => {
  return <AutomationsPage />;
};

export default page;
