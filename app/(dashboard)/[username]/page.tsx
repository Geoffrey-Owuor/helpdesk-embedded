// The currently viewed dashboard homepage
import IssuesCards from "@/components/Modules/IssueCards/IssueCards";
import IssuesData from "@/components/Modules/IssuesData/IssuesData";
import { SearchLogicProvider } from "@/contexts/SearchLogicContext";
import { ColumnVisibilityProvider } from "@/contexts/ColumnVisibilityContext";

const page = () => {
  return (
    <ColumnVisibilityProvider>
      <SearchLogicProvider>
        <IssuesCards />

        <IssuesData />
      </SearchLogicProvider>
    </ColumnVisibilityProvider>
  );
};

export default page;
