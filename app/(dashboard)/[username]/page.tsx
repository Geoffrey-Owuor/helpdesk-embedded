// The currently viewed dashboard homepage
import IssueCards from "@/components/Modules/IssuesCards/IssueCards";
import IssuesData from "@/components/Modules/IssuesData/IssuesData";

const page = () => {
  return (
    <>
      <IssueCards />
      <IssuesData />
    </>
  );
};

export default page;
