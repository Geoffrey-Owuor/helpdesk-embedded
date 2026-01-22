// The currently viewed dashboard homepage
import IssuesCards from "@/components/Modules/IssueCards/IssueCards";
import IssuesData from "@/components/Modules/IssuesData/IssuesData";
const page = () => {
  return (
    <>
      <IssuesCards />
      <IssuesData />
    </>
  );
};

export default page;
