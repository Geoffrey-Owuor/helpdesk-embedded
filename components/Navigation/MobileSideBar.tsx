/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import Link from "next/link";
import { DashBoardLogo } from "../Modules/DashBoardLogo";
import { Dispatch, SetStateAction } from "react";
import { useState, useCallback, useRef } from "react";
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
import MainIssueModal from "../Modules/IssueModals/MainIssueModal";
import { useUser } from "@/contexts/UserContext";
import { hasFeatureAccess, FEATURES } from "@/lib/FeatureAccess";
import { useFocusTrapping } from "@/hooks/useFocusTrapping";
import AdminPanel from "./AdminFunctions/AdminPanel";
import { useIsEmbedd } from "@/hooks/useIsEmbedd";

type MobileSideBarProps = {
  sideBarOpen: boolean;
  handleRouteChange: (val: string) => void;
  setSideBarOpen: Dispatch<SetStateAction<boolean>> | ((open: boolean) => void);
};

const MobileSideBar = ({
  sideBarOpen,
  handleRouteChange,
  setSideBarOpen,
}: MobileSideBarProps) => {
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const { role, isSuper, specialAccess } = useUser();
  const [showAdminOptions, setShowAdminOptions] = useState(false);

  const isEmbedded = useIsEmbedd();

  // Tab focus trapping
  const closeSidebar = useCallback(
    () => setSideBarOpen(false),
    [setSideBarOpen],
  );
  const menuRef = useRef<HTMLElement | null>(null);
  useFocusTrapping(menuRef, sideBarOpen, closeSidebar);

  // Handling mobile route change
  const handleMobileRouteChange = (route: string) => {
    setSideBarOpen(false);
    handleRouteChange(route);
  };

  const handleNewIssueOpening = () => {
    setSideBarOpen(false);
    setIsIssueModalOpen(true);
  };

  const handleAdminPanelOpening = () => {
    setSideBarOpen(false);
    setShowAdminOptions((prev) => !prev);
  };

  return (
    <>
      {isIssueModalOpen && (
        <MainIssueModal
          isOpen={isIssueModalOpen}
          setIsOpen={setIsIssueModalOpen}
        />
      )}

      <AdminPanel
        showAdminPanel={showAdminOptions}
        setShowAdminPanel={setShowAdminOptions}
      />

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
          className={`relative z-10 flex w-64 flex-col gap-6 border-r border-neutral-300 bg-white px-6 py-4 shadow-sm transition-transform duration-200 dark:border-neutral-900 dark:bg-neutral-950 ${
            sideBarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Logo Area and close button */}
          <div className="flex items-center justify-between">
            <DashBoardLogo isSideBarOpen={true} />
            <button
              className="rounded-full p-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-800"
              onClick={() => setSideBarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-4">
            {/* Link: Homepage */}
            <Link
              href="/dashboard"
              onClick={() => handleMobileRouteChange("/dashboard")}
              className="flex w-full items-center gap-2 rounded-xl bg-neutral-900 p-3 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>

            {/* Button: New Issue */}
            <button
              onClick={handleNewIssueOpening}
              className="flex w-full items-center gap-2 rounded-xl p-3 text-sm font-medium hover:bg-neutral-200 dark:hover:bg-neutral-800"
            >
              <CirclePlus className="h-5 w-5" />
              <span>New Issue</span>
            </button>

            {/* Super Admin  */}
            {isSuper && (
              <Link
                href="/dashboard/superadmin"
                onClick={() => handleMobileRouteChange("/dashboard/superadmin")}
                className="flex w-full items-center gap-2 rounded-xl p-3 text-sm font-medium hover:bg-neutral-200 dark:hover:bg-neutral-800"
              >
                <ShieldPlus className="h-5 w-5" />
                <span>Super Admin</span>
              </Link>
            )}

            {/* Issues Analytics */}
            {hasFeatureAccess({ role, specialAccess }, FEATURES.ANALYTICS) && (
              <Link
                href="/dashboard/analytics"
                onClick={() => handleMobileRouteChange("/dashboard/analytics")}
                className="flex w-full items-center gap-2 rounded-xl p-3 text-sm font-medium hover:bg-neutral-200 dark:hover:bg-neutral-800"
              >
                <ChartColumnBig className="h-5 w-5" />
                <span>Analytics</span>
              </Link>
            )}

            {/* Admin functionality */}
            {role === "admin" && (
              <button
                onClick={handleAdminPanelOpening}
                className="flex w-full items-center gap-2 rounded-xl p-3 text-sm font-medium hover:bg-neutral-200 dark:hover:bg-neutral-800"
              >
                <ShieldUser className="h-5 w-5" />
                <span>Admin Panel</span>
              </button>
            )}

            {/* Articles Page */}
            <Link
              href="/dashboard/articles"
              onClick={() => handleMobileRouteChange("/dashboard/articles")}
              className="flex w-full items-center gap-2 rounded-xl p-3 text-sm font-medium hover:bg-neutral-200 dark:hover:bg-neutral-800"
            >
              <NotebookPen className="h-5 w-5" />
              <span>Articles Hub</span>
            </Link>
            {!isEmbedded && (
              <a
                href="/dashboard"
                onClick={() => setSideBarOpen(false)}
                className="flex w-full items-center gap-2 rounded-xl p-3 text-sm font-medium hover:bg-neutral-200 dark:hover:bg-neutral-800"
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
