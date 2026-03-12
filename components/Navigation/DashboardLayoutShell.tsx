import DashboardSidebar from "./DashboardSidebar";
import HydrationGuard from "../Modules/HydrationGuard";
import DashboardFooter from "./DashboardFooter";

const DashboardLayoutShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <HydrationGuard>
      {/* Fixed full-viewport container */}
      <div className="fixed inset-0 flex justify-center">
        {/* Max-width constrainer */}
        <div className="relative w-full max-w-7xl">
          <DashboardSidebar />
          <div
            id="main-content"
            className="absolute top-16 right-1 bottom-0 left-1 overflow-y-auto rounded-3xl border border-neutral-100 bg-white sm:bottom-1 sm:rounded-2xl md:top-1 md:left-20 dark:border-neutral-900 dark:bg-black"
          >
            <div className="flex h-full flex-col">
              <main className="flex-1 px-4">{children}</main>
              <DashboardFooter />
            </div>
          </div>
        </div>
      </div>
    </HydrationGuard>
  );
};

export default DashboardLayoutShell;
