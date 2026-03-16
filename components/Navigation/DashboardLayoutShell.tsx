import DashboardSidebar from "./DashboardSidebar";
import DashboardFooter from "./DashboardFooter";

const DashboardLayoutShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <DashboardSidebar />
      <div
        id="main-content"
        className="fixed top-16 right-1 bottom-0 left-1 overflow-y-auto rounded-3xl border border-[#eceef1] bg-white [scrollbar-color:#a3a3a3_transparent] [scrollbar-width:thin] sm:bottom-1 sm:rounded-2xl md:top-1 md:left-20 dark:border-neutral-900 dark:bg-black dark:[scrollbar-color:#484848_transparent]"
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
    </>
  );
};

export default DashboardLayoutShell;
