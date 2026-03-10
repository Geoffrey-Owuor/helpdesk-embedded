import DashboardSidebar from "./DashboardSidebar";
import { IssuesDataProvider } from "@/contexts/IssuesDataContext";
import { IssuesCardsProvider } from "@/contexts/IssuesCardsContext";
import { AutomationCardsProvider } from "@/contexts/AutomationCardsContext";
import { AutomationsDataProvider } from "@/contexts/AutomationsDataContext";
import HydrationGuard from "../Modules/HydrationGuard";
import DashboardFooter from "./DashboardFooter";

const DashboardLayoutShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <HydrationGuard>
      <AutomationCardsProvider>
        <IssuesDataProvider>
          <AutomationsDataProvider>
            <IssuesCardsProvider>
              <DashboardSidebar />
              <div
                id="main-content"
                className="fixed top-16 right-1 bottom-0 left-1 overflow-y-auto rounded-3xl border border-neutral-200 bg-white sm:bottom-1 sm:rounded-2xl md:top-1 md:left-20 dark:border-neutral-800 dark:bg-black"
              >
                <div className="flex h-full flex-col">
                  {/* Content */}
                  <main className="mx-auto w-full max-w-7xl flex-1 px-4">
                    {children}
                  </main>

                  {/* Footer */}
                  <DashboardFooter />
                </div>
              </div>
            </IssuesCardsProvider>
          </AutomationsDataProvider>
        </IssuesDataProvider>
      </AutomationCardsProvider>
    </HydrationGuard>
  );
};

export default DashboardLayoutShell;
