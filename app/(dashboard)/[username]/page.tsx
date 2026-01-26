// The currently viewed dashboard homepage
import IssuesCards from "@/components/Modules/IssuesCards/IssuesCards";
import IssuesData from "@/components/Modules/IssuesData/IssuesData";
import { ColumnVisibilityProvider } from "@/contexts/ColumnVisibilityContext";
import { IssuesCardsProvider } from "@/contexts/IssuesCardsContext";

const page = () => {
  return (
    <IssuesCardsProvider>
      <ColumnVisibilityProvider>
        <IssuesCards />

        <IssuesData />
      </ColumnVisibilityProvider>
    </IssuesCardsProvider>
  );
};

export default page;
