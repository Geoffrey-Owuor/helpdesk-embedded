"use client";

import { useEffect } from "react";
import DashboardSidebar from "./DashboardSidebar";
import DashboardFooter from "./DashboardFooter";
import { DbStatusOverlay } from "../Modules/DbStatus/DbStatusOverlay";
import { useDbStore } from "@/store/useDbStore";
import { useSidebarToggleStore } from "@/store/useSidebarToggleStore";
import { useDashboardModalsStore } from "@/store/useDashboardModalsStore";
import { usePinnedIssuesStore } from "@/store/usePinnedIssuesStore";
import DashboardHeader from "./DashboardHeader";
import MainIssueModal from "../Modules/IssueModals/MainIssueModal";
import AdminPanel from "./AdminFunctions/AdminPanel";
import UserSettings from "./UserSettings/UserSettings";

const DashboardLayoutShell = ({ children }: { children: React.ReactNode }) => {
  const status = useDbStore((state) => state.status);
  const showSidebar = useSidebarToggleStore((state) => state.showSidebar);

  const isIssueModalOpen = useDashboardModalsStore(
    (state) => state.isIssueModalOpen,
  );
  const setIsIssueModalOpen = useDashboardModalsStore(
    (state) => state.setIsIssueModalOpen,
  );
  const isAdminPanelOpen = useDashboardModalsStore(
    (state) => state.isAdminPanelOpen,
  );
  const setIsAdminPanelOpen = useDashboardModalsStore(
    (state) => state.setIsAdminPanelOpen,
  );
  const isUserSettingsOpen = useDashboardModalsStore(
    (state) => state.isUserSettingsOpen,
  );
  const setIsUserSettingsOpen = useDashboardModalsStore(
    (state) => state.setIsUserSettingsOpen,
  );

  // Pinned issues persist in localStorage, which the server can't read
  useEffect(() => {
    usePinnedIssuesStore.persist.rehydrate();
  }, []);

  const defaultContent = (
    <>
      {/* Dashboard-wide modals — mounted once, opened via useDashboardModalsStore */}
      {isIssueModalOpen && (
        <MainIssueModal
          isOpen={isIssueModalOpen}
          setIsOpen={setIsIssueModalOpen}
        />
      )}
      <AdminPanel
        showAdminPanel={isAdminPanelOpen}
        setShowAdminPanel={setIsAdminPanelOpen}
      />
      <UserSettings
        isUserSettingsOpen={isUserSettingsOpen}
        setIsUserSettingsOpen={setIsUserSettingsOpen}
      />

      <DashboardSidebar />
      {/* Frame: positions the panel; it must not clip, so no radius/overflow here.
          Full-bleed on mobile, inset beside the rail on desktop. */}
      <div
        className={`custom:top-2 custom:right-2 custom:bottom-2 fixed inset-0 flex flex-col pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)] ${showSidebar ? "custom:left-20" : "custom:left-2"}`}
      >
        {/* Topbar — a fixed row above the scroller (not sticky inside it), so the
            scrollbar starts below it and sticky page elements keep top-0 */}
        <DashboardHeader />

        <div className="relative z-0 min-h-0 flex-1">
          {/* The scroller is deliberately square: a border-radius on a scroll container
              forces a rounded clip mask that is recomposited on every scroll frame,
              which halves the frame rate on 4K / integrated GPUs. The rounded look
              comes from the corner "ears" instead. overflow-x-hidden clips the
              sticky bars' oversized bands to its inner edges. */}
          <div
            id="main-content"
            className="layout-scrollbar custom:border-t-0 custom:border-b absolute inset-0 overflow-x-hidden overflow-y-auto border-x border-t border-[#eceef1] bg-white dark:border-neutral-900 dark:bg-black"
          >
            <div className="flex h-full flex-col pb-[env(safe-area-inset-bottom)]">
              {/* Content */}
              <main className="mx-auto w-full max-w-7xl flex-1 px-4">
                {children}
              </main>

              {/* Footer */}
              <DashboardFooter />
            </div>
          </div>

          {/* Mobile: the line under the topbar curves down into the content edges */}
          <span
            aria-hidden
            className="shell-ear shell-ear-inner shell-ear-tl custom:hidden"
          />
          <span
            aria-hidden
            className="shell-ear shell-ear-inner shell-ear-tr custom:hidden"
          />
        </div>

        {/* Desktop: rounded panel corners painted over the square header/scroller */}
        <span
          aria-hidden
          className="shell-ear shell-ear-tl custom:block hidden"
        />
        <span
          aria-hidden
          className="shell-ear shell-ear-tr custom:block hidden"
        />
        <span
          aria-hidden
          className="shell-ear shell-ear-bl custom:block hidden"
        />
        <span
          aria-hidden
          className="shell-ear shell-ear-br custom:block hidden"
        />
      </div>
    </>
  );

  if (status === "degraded") {
    return <DbStatusOverlay />;
  } else {
    return defaultContent;
  }
};

export default DashboardLayoutShell;
