import { Metadata } from "next";
import NewIssueForm from "@/components/Modules/NewIssue/NewIssueForm";

export const metadata: Metadata = {
  title: "New Issue",
  description: "Raise a new issue",
};

const page = () => {
  return <NewIssueForm />;
};

export default page;
