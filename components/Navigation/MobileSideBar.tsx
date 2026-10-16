/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import Link from "next/link";
import { DashBoardLogo } from "../Modules/DashBoardLogo";
import { Dispatch, SetStateAction } from "react";
import { useCallback, useRef } from "react";
import {
  CirclePlus,
  X,
  ShieldUser,
  ShieldPlus,
  LayoutDashboard,
  NotebookPen,
  HousePlug,
  ChartColumnBig,
} from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { hasFeatureAccess, FEATURES } from "@/lib/FeatureAccess";
import { useFocusTrapping } from "@/hooks/useFocusTrapping";
import { useDashboardModalsStore } from "@/store/useDashboardModalsStore";
import { useIsEmbedd } from "@/hooks/useIsEmbedd";

const BASE_ITEM_CLASSES =
  "flex w-full items-center gap-2 rounded-xl p-3 text-sm font-medium";
const INACTIVE_ITEM_CLASSES = `${BASE_ITEM_CLASSES} hover:bg-neutral-200 dark:hover:bg-neutral-800`;

// Active styling matches the desktop rail's highlighted link
const linkClasses = (isActive: boolean) =>
  isActive
    ? `${BASE_ITEM_CLASSES} bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200`
    : INACTIVE_ITEM_CLASSES;

type MobileSideBarProps = {
  sideBarOpen: boolean;
  highlightLink: (path: string) => boolean;
  setSideBarOpen: Dispatch<SetStateAction<boolean>> | ((open: boolean) => void);
};

const MobileSideBar = ({
  sideBarOpen,
  highlightLink,
  setSideBarOpen,
}: MobileSideBarProps) => {
  const { role, isSuper, specialAccess } = useUser();
  const setIsIssueModalOpen = useDashboardModalsStore(
    (state) => state.setIsIssueModalOpen,
  );
  const setIsAdminPanelOpen = useDashboardModalsStore(
    (state) => state.setIsAdminPanelOpen,
  );

  const isEmbedded = useIsEmbedd();

  // Tab focus trapping
  const closeSidebar = useCallback(
    () => setSideBarOpen(false),
    [setSideBarOpen],
  );
  const menuRef = useRef<HTMLElement | null>(null);
  useFocusTrapping(menuRef, sideBarOpen, closeSidebar);

  const handleNewIssueOpening = () => {
    setSideBarOpen(false);
    setIsIssueModalOpen(true);
  };

  const handleAdminPanelOpening = () => {
    setSideBarOpen(false);
    setIsAdminPanelOpen(true);
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-70 flex ${
          sideBarOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        {/* Sidebar backdrop */}
        <div
          className={`fixed inset-0 bg-black/30 transition-opacity duration-200 dark:bg-black/60 ${
            sideBarOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setSideBarOpen(false)}
        />

        {/* Sidebar panel */}
        <aside
          ref={menuRef}
          className={`relative z-10 flex w-64 flex-col gap-6 border-r border-neutral-300 bg-white px-6 py-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] pl-[max(1.5rem,env(safe-area-inset-left))] shadow-sm transition-transform duration-200 dark:border-neutral-900 dark:bg-neutral-950 ${
            sideBarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Logo Area and close button */}
          <div className="flex items-center justify-between">
            <DashBoardLogo isSideBarOpen={true} />
            <button
              className="rounded-full p-2.5 hover:bg-neutral-200 sm:p-1.5 dark:hover:bg-neutral-800"
              onClick={() => setSideBarOpen(false)}
              aria-label="Close navigation menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-4">
            {/* Link: Homepage */}
            <Link
              href="/dashboard"
              onClick={closeSidebar}
              aria-current={highlightLink("/dashboard") ? "page" : undefined}
              className={linkClasses(highlightLink("/dashboard"))}
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>

            {/* Button: New Issue */}
            <button
              onClick={handleNewIssueOpening}
              className={INACTIVE_ITEM_CLASSES}
            >
              <CirclePlus className="h-5 w-5" />
              <span>New Issue</span>
            </button>

            {/* Super Admin  */}
            {isSuper && (
              <Link
                href="/dashboard/superadmin"
                onClick={closeSidebar}
                aria-current={
                  highlightLink("/dashboard/superadmin") ? "page" : undefined
                }
                className={linkClasses(highlightLink("/dashboard/superadmin"))}
              >
                <ShieldPlus className="h-5 w-5" />
                <span>Super Admin</span>
              </Link>
            )}

            {/* Issues Analytics */}
            {hasFeatureAccess({ role, specialAccess }, FEATURES.ANALYTICS) && (
              <Link
                href="/dashboard/analytics"
                onClick={closeSidebar}
                aria-current={
                  highlightLink("/dashboard/analytics") ? "page" : undefined
                }
                className={linkClasses(highlightLink("/dashboard/analytics"))}
              >
                <ChartColumnBig className="h-5 w-5" />
                <span>Analytics</span>
              </Link>
            )}

            {/* Admin functionality */}
            {role === "admin" && (
              <button
                onClick={handleAdminPanelOpening}
                className={INACTIVE_ITEM_CLASSES}
              >
                <ShieldUser className="h-5 w-5" />
                <span>Admin Panel</span>
              </button>
            )}

            {/* Articles Page */}
            <Link
              href="/dashboard/articles"
              onClick={closeSidebar}
              aria-current={
                highlightLink("/dashboard/articles") ? "page" : undefined
              }
              className={linkClasses(highlightLink("/dashboard/articles"))}
            >
              <NotebookPen className="h-5 w-5" />
              <span>Articles Hub</span>
            </Link>
            {!isEmbedded && (
              <a
                href="/dashboard"
                onClick={() => setSideBarOpen(false)}
                className={INACTIVE_ITEM_CLASSES}
              >
                <HousePlug className="h-5 w-5" />
                <span>Apps Hub</span>
              </a>
            )}
          </nav>
        </aside>
      </div>
    </>
  );
};

export default MobileSideBar;
