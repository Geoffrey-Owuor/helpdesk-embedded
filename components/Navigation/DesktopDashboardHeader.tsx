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
const SidebarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1.7em"
    height="1.7em"
    viewBox="0 0 17 17"
  >
    <path
      fill="currentColor"
      d="M4.5 3A2.5 2.5 0 0 0 2 5.5v5A2.5 2.5 0 0 0 4.5 13h7a2.5 2.5 0 0 0 2.5-2.5v-5A2.5 2.5 0 0 0 11.5 3zM7 4h4.5A1.5 1.5 0 0 1 13 5.5v5a1.5 1.5 0 0 1-1.5 1.5H7z"
    ></path>
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
              className="group rounded-full p-1 transition-all hover:bg-neutral-200 dark:hover:bg-neutral-800"
              aria-label="Toggle Sidebar"
            >
              <SidebarIcon />
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
