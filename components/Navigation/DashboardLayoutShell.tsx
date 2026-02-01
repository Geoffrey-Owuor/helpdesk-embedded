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
                <DashboardHeader />
                <div
                  id="main-content"
                  className="fixed top-16 right-1 bottom-3 left-1 overflow-y-auto rounded-3xl border border-neutral-100 bg-white sm:bottom-1 sm:rounded-2xl dark:border-neutral-900 dark:bg-black"
                >
                  <div className="flex h-full flex-col">
                    {/* Content */}
                    <main className="mx-auto w-full max-w-7xl flex-1 px-4">
                      {children}
                    </main>

                    <footer className="flex justify-center px-6 py-4 text-sm text-neutral-500">
                      &copy; {currentYear} Issue Desk. All rights reserved.
                    </footer>
                  </div>
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
