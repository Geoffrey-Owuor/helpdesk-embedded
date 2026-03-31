import DashboardSidebar from "./DashboardSidebar";
import DashboardFooter from "./DashboardFooter";
import HydrationGuard from "../Skeletons/HydrationGuard";

const DashboardLayoutShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <DashboardSidebar />
      <div
        id="main-content"
        className="layout-scrollbar custom:top-1 custom:left-20 fixed top-16 right-1 bottom-0 left-1 overflow-y-auto rounded-3xl border border-[#eceef1] bg-white [scrollbar-gutter:stable] sm:bottom-1 sm:rounded-2xl dark:border-neutral-900 dark:bg-black"
      >
        <div className="flex h-full flex-col">
          {/* Content */}
          <main className="mx-auto w-full max-w-7xl flex-1 px-4">
            <HydrationGuard>{children}</HydrationGuard>
          </main>

          {/* Footer */}
          <DashboardFooter />
        </div>
      </div>
    </>
  );
};

export default DashboardLayoutShell;
