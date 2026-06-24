import ItTeam from "@/components/Home/ItTeam";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "IT Team",
  description: "Dedicated page for Hotpoint team members",
};
const page = () => {
  return <ItTeam />;
};

export default page;
