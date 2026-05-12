"use client";

import { useState, useRef } from "react";
import { Search } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { abbreviateUserName } from "@/public/assets";
import { DashBoardLogo } from "../Modules/DashBoardLogo";
import UserInfoCard from "../Modules/UserInfoCard";
import UserSettings from "./UserSettings/UserSettings";
import ThemeToggle from "../Themes/ThemeToggle";
import Notifications from "./Notifications/Notifications";
import { useSidebarToggleStore } from "@/store/useSidebarToggleStore";

const ModernSidebarIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Top line - Full width */}
    <path d="M3 5h18" />
    {/* Middle line - Shortened to suggest a "back" or "indent" action */}
    <path d="M3 12h12" />
    {/* Bottom line - Medium width */}
    <path d="M3 19h15" />
  </svg>
);

const DesktopDashboardHeader = () => {
  const { username } = useUser();

  const showSidebar = useSidebarToggleStore((state) => state.showSidebar);
  const setShowSidebar = useSidebarToggleStore((state) => state.setShowSidebar);

  const [isUserCardOpen, setIsUserCardOpen] = useState(false);
  const [showUserSettings, setShowUserSettings] = useState(false);

  const userDivRef = useRef<HTMLDivElement>(null);

  return (
    // Only visible on lg screens and up. No bottom border as requested.
    <>
      <UserSettings
        isUserSettingsOpen={showUserSettings}
        setIsUserSettingsOpen={setShowUserSettings}
      />
      <header className="z-40 hidden w-full lg:block">
        <div className="flex h-16 w-full items-center justify-between px-4">
          <div className="flex items-center gap-3">
            {/* Far Left: Dashboard Logo */}
            <div className="flex items-center justify-center px-3">
              <DashBoardLogo />
            </div>

            {/* Dashboard sidebar toggle icon */}
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="group rounded-lg p-1.5 transition-all duration-200 hover:bg-neutral-300/50 active:scale-90 dark:hover:bg-neutral-800/50"
              aria-label="Toggle Sidebar"
              title="Toggle sidebar"
            >
              <ModernSidebarIcon
                className={`h-5 w-5 transition-transform duration-200 ${
                  showSidebar ? "rotate-0" : "rotate-180"
                } text-neutral-600 group-hover:text-neutral-900 dark:text-neutral-400 dark:group-hover:text-neutral-100`}
              />
            </button>
          </div>

          {/* Middle: Search Bar Placeholder */}
          <div className="flex flex-1 items-center justify-center px-8">
            {/* TODO: Wire up actual search functionality and state to this div/input */}
            <div className="relative w-full max-w-lg">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
              </div>
              <div className="flex h-10 w-full cursor-text items-center rounded-xl border border-neutral-200 bg-white pr-4 pl-10 text-sm text-neutral-400 transition-colors hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900/50 dark:hover:border-neutral-700">
                Search issues, articles, or users...
              </div>
            </div>
          </div>

          {/* Far Right: User Initials & Dropdown */}
          <div className="flex shrink-0 items-center gap-4">
            <ThemeToggle />
            <Notifications />

            <div
              className="relative flex flex-col items-center"
              ref={userDivRef}
            >
              <button
                onClick={() => setIsUserCardOpen((prev) => !prev)}
                // TODO: Remove the user avatar section from the bottom of your DashboardSidebar component
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-neutral-900 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200"
              >
                <span className="text-xs font-semibold">
                  {abbreviateUserName(username)}
                </span>
              </button>

              <UserInfoCard
                isUserCardOpen={isUserCardOpen}
                openDownwards={true} // Set to true as requested so it opens downwards
                openUserSettings={() => setShowUserSettings(true)}
                closeUserCard={() => setIsUserCardOpen(false)}
                triggerRef={userDivRef}
              />
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default DesktopDashboardHeader;
