import Manual from "@/components/Home/Manual";
import { Metadata } from "next";

// Page Metadata
export const metadata: Metadata = {
  title: "Manual",
  description: "IssueDesk manual page",
};

const page = () => {
  return <Manual />;
};

export default page;
