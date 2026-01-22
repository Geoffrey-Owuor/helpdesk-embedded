import DashboardHeader from "./DashboardHeader";
import { IssuesDataProvider } from "@/contexts/IssuesDataContext";

const DashboardLayoutShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <IssuesDataProvider>
      <div className="flex min-h-screen flex-col">
        <DashboardHeader />
        <main className="fixed top-16 right-1 bottom-3 left-1 overflow-y-auto rounded-3xl border border-neutral-200 sm:bottom-1 sm:rounded-2xl dark:border-neutral-800">
          <div className="mx-auto max-w-7xl flex-1 px-4">{children}</div>
        </main>
      </div>
    </IssuesDataProvider>
  );
};

export default DashboardLayoutShell;
