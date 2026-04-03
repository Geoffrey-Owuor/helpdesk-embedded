"use client";

import DashboardSidebar from "./DashboardSidebar";
import DashboardFooter from "./DashboardFooter";
import HydrationGuard from "../Skeletons/HydrationGuard";
import { DbStatusOverlay } from "../Modules/DbStatus/DbStatusOverlay";
import { useDbStore } from "@/store/useDbStore";

const DashboardLayoutShell = ({ children }: { children: React.ReactNode }) => {
  const status = useDbStore((state) => state.status);

  const defaultContent = (
    <HydrationGuard>
      <DashboardSidebar />
      <div
        id="main-content"
        className="layout-scrollbar fixed top-16 right-1 bottom-0 left-1 overflow-y-auto rounded-3xl border border-[#eceef1] bg-white [scrollbar-gutter:stable] sm:bottom-1 sm:rounded-2xl lg:top-1 lg:left-20 dark:border-neutral-900 dark:bg-black"
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
