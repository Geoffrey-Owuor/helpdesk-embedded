import DashboardHeader from "./DashboardHeader";
import { IssuesDataProvider } from "@/contexts/IssuesDataContext";
import { SearchLogicProvider } from "@/contexts/SearchLogicContext";

const DashboardLayoutShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <SearchLogicProvider>
      <IssuesDataProvider>
        <div className="flex min-h-screen flex-col">
          <DashboardHeader />
          <main className="fixed top-16 right-1 bottom-3 left-1 overflow-y-auto rounded-3xl border border-neutral-100 sm:bottom-1 sm:rounded-2xl dark:border-neutral-900">
            <div className="mx-auto max-w-7xl flex-1 px-4">{children}</div>
          </main>
        </div>
      </IssuesDataProvider>
    </SearchLogicProvider>
  );
};

export default DashboardLayoutShell;
