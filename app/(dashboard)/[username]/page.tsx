// The currently viewed dashboard homepage
import IssuesCards from "@/components/Modules/IssueCards/IssueCards";
import IssuesData from "@/components/Modules/IssuesData/IssuesData";
import { SearchLogicProvider } from "@/contexts/SearchLogicContext";

const page = () => {
  return (
    <>
      <IssuesCards />
      <SearchLogicProvider>
        <IssuesData />
      </SearchLogicProvider>
    </>
  );
};

export default page;
