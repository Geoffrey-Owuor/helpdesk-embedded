// The currently viewed dashboard homepage
import IssuesCards from "@/components/Modules/IssuesCards/IssuesCards";
import IssuesData from "@/components/Modules/IssuesData/IssuesData";

const page = () => {
  return (
    <>
      <IssuesCards type="issues" />

      <IssuesData recordType="issues" />
    </>
  );
};

export default page;
