import { Metadata } from "next";
import NewIssueForm from "@/components/Modules/NewIssue/NewIssueForm";
import IconPattern from "@/components/Modules/IconPattern";

export const metadata: Metadata = {
  title: "New Issue",
  description: "Raise a new issue",
};

const page = () => {
  return (
    <div className="relative isolate">
      <IconPattern />
      <NewIssueForm />
    </div>
  );
};

export default page;
