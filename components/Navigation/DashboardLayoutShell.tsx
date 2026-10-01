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
      {/* Frame: positions the panel; it must not clip, so no radius/overflow here */}
      <div
        className={`custom:right-2 custom:bottom-2 fixed top-14 right-0 bottom-0 left-0 transition-all duration-200 ease-in-out ${showSidebar ? "custom:left-20" : "custom:left-2"}`}
      >
        {/* The scroller is deliberately square: a border-radius on a scroll container
            forces a rounded clip mask that is recomposited on every scroll frame,
            which halves the frame rate on 4K / integrated GPUs. The rounded look
            comes from the corner "ears" below instead. */}
        <div
          id="main-content"
          className="layout-scrollbar absolute inset-0 scrollbar-gutter-stable overflow-y-auto border border-[#eceef1] bg-white dark:border-neutral-900 dark:bg-black"
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

        {/* Rounded corners painted over the square scroller */}
        <span aria-hidden className="shell-ear shell-ear-tl" />
        <span aria-hidden className="shell-ear shell-ear-tr" />
        <span
          aria-hidden
          className="shell-ear shell-ear-bl custom:block hidden"
        />
        <span
          aria-hidden
          className="shell-ear shell-ear-br custom:block hidden"
        />
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
