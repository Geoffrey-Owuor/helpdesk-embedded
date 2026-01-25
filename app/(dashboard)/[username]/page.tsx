// The currently viewed dashboard homepage
import IssuesCards from "@/components/Modules/IssueCards/IssueCards";
import IssuesData from "@/components/Modules/IssuesData/IssuesData";
import { ColumnVisibilityProvider } from "@/contexts/ColumnVisibilityContext";

const page = () => {
  return (
    <ColumnVisibilityProvider>
      <IssuesCards />

      <IssuesData />
    </ColumnVisibilityProvider>
  );
};

export default page;
