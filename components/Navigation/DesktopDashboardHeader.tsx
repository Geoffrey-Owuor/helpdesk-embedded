"use client";

import { useState, useRef } from "react";
import { useUser } from "@/contexts/UserContext";
import { abbreviateUserName } from "@/public/assets";
import { DashBoardLogo } from "../Modules/DashBoardLogo";
import UserInfoCard from "../Modules/UserInfoCard";
import UserSettings from "./UserSettings/UserSettings";
import ThemeToggle from "../Themes/ThemeToggle";
import Notifications from "./Notifications/Notifications";
import MiddleBar from "./MiddleBar";
import { useSidebarToggleStore } from "@/store/useSidebarToggleStore";

// --- SVG ICON ---
const SidebarIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
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
    <>
      <UserSettings
        isUserSettingsOpen={showUserSettings}
        setIsUserSettingsOpen={setShowUserSettings}
      />
      <header className="z-40 hidden w-full lg:block">
        <div className="flex h-16 w-full items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            {/* Far Left: Dashboard Logo */}
            <div className="flex items-center justify-center px-3">
              <DashBoardLogo />
            </div>

            {/* Dashboard sidebar toggle icon */}
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="group rounded-full p-2 transition-all hover:bg-neutral-200 dark:hover:bg-neutral-800"
              aria-label="Toggle Sidebar"
              title={showSidebar ? "Close Sidebar" : "Open Sidebar"}
            >
              <SidebarIcon className="h-5 w-5 text-neutral-600 transition-colors group-hover:text-neutral-900 dark:text-neutral-400 dark:group-hover:text-neutral-100" />
            </button>
          </div>

          {/* Middle: Middle bar placeholder */}
          <MiddleBar />

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
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-neutral-900 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200"
              >
                <span className="text-xs font-semibold">
                  {abbreviateUserName(username)}
                </span>
              </button>

              <UserInfoCard
                isUserCardOpen={isUserCardOpen}
                openDownwards={true}
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
