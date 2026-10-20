/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import Link from "next/link";
import { DashBoardLogo } from "../Modules/DashBoardLogo";
import { Dispatch, SetStateAction } from "react";
import { useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { X, HousePlug, CircleQuestionMark, ExternalLink } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useFocusTrapping } from "@/hooks/useFocusTrapping";
import { useDashboardModalsStore } from "@/store/useDashboardModalsStore";
import { useIsEmbedd } from "@/hooks/useIsEmbedd";
import {
  DashboardNavItem,
  HOME_NAV_ITEM,
  getDashboardNavGroups,
  isNavItemActive,
} from "@/lib/dashboardNav";

const BASE_ITEM_CLASSES =
  "flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white";
const INACTIVE_ITEM_CLASSES = `${BASE_ITEM_CLASSES} text-neutral-700 hover:bg-neutral-200 dark:text-neutral-300 dark:hover:bg-neutral-800`;

// Active styling matches the desktop rail's highlighted link
const linkClasses = (isActive: boolean) =>
  isActive
    ? `${BASE_ITEM_CLASSES} bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200`
    : INACTIVE_ITEM_CLASSES;

type MobileSideBarProps = {
  sideBarOpen: boolean;
  setSideBarOpen: Dispatch<SetStateAction<boolean>> | ((open: boolean) => void);
};

const MobileSideBar = ({ sideBarOpen, setSideBarOpen }: MobileSideBarProps) => {
  const user = useUser();
  const setIsIssueModalOpen = useDashboardModalsStore(
    (state) => state.setIsIssueModalOpen,
  );
  const setIsAdminPanelOpen = useDashboardModalsStore(
    (state) => state.setIsAdminPanelOpen,
  );
  const pathname = usePathname();
  const groups = getDashboardNavGroups(user);

  const isEmbedded = useIsEmbedd();

  // Tab focus trapping
  const closeSidebar = useCallback(
    () => setSideBarOpen(false),
    [setSideBarOpen],
  );
  const menuRef = useRef<HTMLElement | null>(null);
  useFocusTrapping(menuRef, sideBarOpen, closeSidebar);

  // Close on navigation, however it started
  useEffect(() => {
    closeSidebar();
  }, [pathname, closeSidebar]);

  const renderItem = (item: DashboardNavItem) => {
    const content = (
      <>
        <item.Icon className="h-5 w-5 shrink-0" />
        <span>{item.label}</span>
      </>
    );

    if (item.kind === "link") {
      const isActive = isNavItemActive(item, pathname);
      return (
        <Link
          href={item.href}
          onClick={closeSidebar}
          aria-current={isActive ? "page" : undefined}
          className={linkClasses(isActive)}
        >
          {content}
        </Link>
      );
    }

    return (
      <button
        type="button"
        onClick={() => {
          closeSidebar();
          if (item.action === "newIssue") setIsIssueModalOpen(true);
          else setIsAdminPanelOpen(true);
        }}
        className={INACTIVE_ITEM_CLASSES}
      >
        {content}
      </button>
    );
  };

  return (
    <>
      {/* inert while closed so the off-screen links can't be tabbed to */}
      <div
        inert={!sideBarOpen}
        className={`fixed inset-0 z-70 flex ${
          sideBarOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        {/* Sidebar backdrop */}
        <div
          aria-hidden="true"
          className={`fixed inset-0 bg-black/30 transition-opacity duration-200 dark:bg-black/60 ${
            sideBarOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeSidebar}
        />

        {/* Sidebar panel */}
        <aside
          ref={menuRef}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className={`relative z-10 flex w-[min(18rem,85vw)] flex-col gap-4 rounded-r-[20px] border-r border-neutral-300 bg-white px-4 py-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] shadow-sm transition-transform duration-200 dark:border-neutral-900 dark:bg-neutral-950 ${
            sideBarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Logo Area and close button */}
          <div className="flex shrink-0 items-center justify-between pl-2">
            <DashBoardLogo isSideBarOpen={true} />
            <button
              type="button"
              className="rounded-full p-2.5 outline-none hover:bg-neutral-200 focus-visible:ring-2 focus-visible:ring-neutral-900 dark:hover:bg-neutral-800 dark:focus-visible:ring-white"
              onClick={closeSidebar}
              aria-label="Close navigation menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav
            aria-label="Main"
            className="layout-scrollbar flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overscroll-contain"
          >
            {renderItem(HOME_NAV_ITEM)}

            {groups.map((group) => (
              <section
                key={group.key}
                aria-labelledby={`mobile-nav-${group.key}`}
              >
                <h2
                  id={`mobile-nav-${group.key}`}
                  className="mb-1.5 px-3 text-[11px] font-bold tracking-[0.12em] text-neutral-500 uppercase"
                >
                  {group.label}
                </h2>
                <ul className="flex flex-col gap-1">
                  {group.items.map((item) => (
                    <li key={item.key}>{renderItem(item)}</li>
                  ))}
                </ul>
              </section>
            ))}
          </nav>

          {/* Leaving HelpDesk: the hub (not when embedded in it) and the manual */}
          <div className="flex shrink-0 flex-col gap-1 border-t border-neutral-200 pt-3 dark:border-neutral-800">
            {!isEmbedded && (
              // Plain <a>: the Apps Hub lives at the site root, outside basePath
              <a
                href="/dashboard"
                onClick={closeSidebar}
                className={INACTIVE_ITEM_CLASSES}
              >
                <HousePlug className="h-5 w-5 shrink-0" />
                <span>Apps Hub</span>
              </a>
            )}
            <Link
              href="/manual"
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeSidebar}
              className={INACTIVE_ITEM_CLASSES}
            >
              <CircleQuestionMark className="h-5 w-5 shrink-0" />
              <span className="flex-1">User Manual</span>
              <ExternalLink
                aria-hidden="true"
                className="h-3.5 w-3.5 shrink-0 text-neutral-400"
              />
              <span className="sr-only">(opens in a new tab)</span>
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
};

export default MobileSideBar;
