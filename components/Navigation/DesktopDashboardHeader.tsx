"use client";

import { useState, useRef, useEffect } from "react";
import { Keyboard } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { abbreviateUserName } from "@/public/assets";
import { DashBoardLogo } from "../Modules/DashBoardLogo";
import UserInfoCard from "../Modules/UserInfoCard";
import UserSettings from "./UserSettings/UserSettings";
import ThemeToggle from "../Themes/ThemeToggle";
import Notifications from "./Notifications/Notifications";
import MiddleBar from "./MiddleBar";
import NewsButton from "../Modules/News/NewsButton";
import { useSidebarToggleStore } from "@/store/useSidebarToggleStore";

// --- SVG ICONS ---
const SidebarOpenIcon = () => (
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

const SidebarClosedIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1.7em"
    height="1.7em"
    viewBox="0 0 17 17"
  >
    <path
      fill="currentColor"
      d="M2 5.5A2.5 2.5 0 0 1 4.5 3h7A2.5 2.5 0 0 1 14 5.5v5a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 2 10.5zM7 4v8h4.5a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 11.5 4zM6 4H4.5A1.5 1.5 0 0 0 3 5.5v5A1.5 1.5 0 0 0 4.5 12H6z"
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

  // --- Keyboard Shortcut Listener ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if the user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        ["INPUT", "TEXTAREA"].includes(target.tagName) ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.shiftKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        setShowSidebar(!showSidebar);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showSidebar, setShowSidebar]);

  return (
    <>
      <UserSettings
        isUserSettingsOpen={showUserSettings}
        setIsUserSettingsOpen={setShowUserSettings}
      />
      <header className="z-40 hidden w-full lg:block">
        <div className="flex w-full items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2.5">
            {/* Far Left: Dashboard Logo */}
            <div className="flex items-center justify-center px-3">
              <DashBoardLogo />
            </div>

            {/* Dashboard sidebar toggle icon */}
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="group relative rounded-full p-1 transition-all hover:bg-neutral-200 dark:hover:bg-neutral-800"
              aria-label="Toggle Sidebar"
            >
              {showSidebar ? <SidebarOpenIcon /> : <SidebarClosedIcon />}

              {/* ── TOOLTIP ── */}
              <div className="pointer-events-none absolute top-1/2 left-full z-50 ml-3 translate-x-2 -translate-y-1/2 opacity-0 transition-all duration-200 ease-out group-hover:translate-x-0 group-hover:opacity-100">
                <div className="relative flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-white shadow-lg dark:bg-white dark:text-neutral-900">
                  <Keyboard
                    size={14}
                    className="shrink-0 text-neutral-400 dark:text-neutral-500"
                  />
                  <span>Shift + S</span>

                  {/* Tooltip Tail/Arrow pointing left */}
                  <div className="absolute top-1/2 -left-1 h-2.5 w-2.5 -translate-y-1/2 rotate-45 rounded-sm bg-neutral-900 dark:bg-white" />
                </div>
              </div>
            </button>
          </div>

          {/* Middle: Middle bar placeholder */}
          <MiddleBar />

          {/* Far Right: User Initials & Dropdown */}
          <div className="flex shrink-0 items-center gap-4">
            <NewsButton />
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
