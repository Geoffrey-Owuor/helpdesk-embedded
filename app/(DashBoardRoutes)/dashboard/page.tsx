// The currently viewed dashboard homepage
import IssuesCards from "@/components/Modules/IssuesCards/IssuesCards";
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
