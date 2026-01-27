// The currently viewed dashboard homepage
import IssuesCards from "@/components/Modules/IssuesCards/IssuesCards";
import IssuesData from "@/components/Modules/IssuesData/IssuesData";
import { ColumnVisibilityProvider } from "@/contexts/ColumnVisibilityContext";

const page = () => {
  return (
    <ColumnVisibilityProvider>
      <IssuesCards type="issues" />

      <IssuesData />
    </ColumnVisibilityProvider>
  );
};

export default page;
