"use client";

import DashboardSidebar from "./DashboardSidebar";
import DashboardFooter from "./DashboardFooter";
import HydrationGuard from "../Skeletons/HydrationGuard";
import { DbStatusOverlay } from "../Modules/DbStatus/DbStatusOverlay";
import { useDbStore } from "@/store/useDbStore";
import { useSidebarToggleStore } from "@/store/useSidebarToggleStore";
import DesktopDashboardHeader from "./DesktopDashboardHeader";

const DashboardLayoutShell = ({ children }: { children: React.ReactNode }) => {
  const status = useDbStore((state) => state.status);
  const showSidebar = useSidebarToggleStore((state) => state.showSidebar);

  const defaultContent = (
    <HydrationGuard>
      <DesktopDashboardHeader />
      <DashboardSidebar />
      <div
        id="main-content"
        className={`layout-scrollbar fixed top-14 right-0 bottom-0 left-0 overflow-y-auto rounded-t-3xl border border-[#eceef1] bg-white transition-all duration-200 ease-in-out [scrollbar-gutter:stable] sm:rounded-t-2xl ${showSidebar ? "lg:left-20" : "lg:left-0"} dark:border-neutral-900 dark:bg-black`}
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
    </HydrationGuard>
  );

  if (status === "degraded") {
    return <DbStatusOverlay />;
  } else {
    return defaultContent;
  }
};

export default DashboardLayoutShell;
