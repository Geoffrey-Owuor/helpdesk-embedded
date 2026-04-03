import ChangeLog from "@/components/Home/ChangeLog";
import { Metadata } from "next";

// Page Metadata
export const metadata: Metadata = {
  title: "Changelog",
  description: "IssueDesk changelogs page",
};

const page = () => {
  return <ChangeLog />;
};

export default page;
