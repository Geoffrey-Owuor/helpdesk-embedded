import DashboardHeader from "./DashboardHeader";
import { IssuesDataProvider } from "@/contexts/IssuesDataContext";
import { SearchLogicProvider } from "@/contexts/SearchLogicContext";
import { IssuesCardsProvider } from "@/contexts/IssuesCardsContext";
import { AutomationCardsProvider } from "@/contexts/AutomationCardsContext";
import { AutomationsDataProvider } from "@/contexts/AutomationsDataContext";
import { ColumnVisibilityProvider } from "@/contexts/ColumnVisibilityContext";
import { currentYear } from "@/public/assets";

const DashboardLayoutShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <SearchLogicProvider>
      <AutomationCardsProvider>
        <IssuesDataProvider>
          <AutomationsDataProvider>
            <IssuesCardsProvider>
              <ColumnVisibilityProvider>
                <div className="flex min-h-full flex-col">
                  <DashboardHeader />
                  <main
                    id="main-content"
                    className="fixed top-16 right-1 bottom-3 left-1 overflow-y-auto rounded-3xl border border-neutral-100 bg-white sm:bottom-1 sm:rounded-2xl dark:border-neutral-900 dark:bg-black"
                  >
                    {/* Content */}
                    <div className="mx-auto w-full max-w-7xl flex-1 px-4">
                      {children}
                    </div>

                    <footer className="flex justify-center px-6 py-4 text-neutral-500">
                      &copy; {currentYear} Issue Desk. All rights reserved.
                    </footer>
                  </main>
                </div>
              </ColumnVisibilityProvider>
            </IssuesCardsProvider>
          </AutomationsDataProvider>
        </IssuesDataProvider>
      </AutomationCardsProvider>
    </SearchLogicProvider>
  );
};

export default DashboardLayoutShell;
