"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Keyboard, Menu, ChevronLeft } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { abbreviateUserName } from "@/lib/assets";
import { DashBoardLogo } from "../Modules/DashBoardLogo";
import UserInfoCard from "../Modules/UserInfoCard";
import ThemeToggle from "../Themes/ThemeToggle";
import Notifications from "./Notifications/Notifications";
import PinnedIssuesButton from "../Modules/PinnedIssues/PinnedIssuesButton";
import MiddleBar from "./MiddleBar";
import NewsButton from "../Modules/News/NewsButton";
import { useSidebarToggleStore } from "@/store/useSidebarToggleStore";
import { useDashboardModalsStore } from "@/store/useDashboardModalsStore";

// --- SVG ICONS ---
const SidebarOpenIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    viewBox="0 0 16 16"
  >
    <path
      fill="currentColor"
      d="M2 5.5A2.5 2.5 0 0 1 4.5 3h7A2.5 2.5 0 0 1 14 5.5v5a2.5 2.5 0 0 1-2.5 2.5h-7A2.5 2.5 0 0 1 2 10.5zm9.5 6.5a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 11.5 4H8v8zm-7-7a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1zM4 8a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 0-1h-1A.5.5 0 0 0 4 8m.5 2a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1z"
    ></path>
  </svg>
);

const SidebarClosedIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    viewBox="0 0 16 16"
  >
    <path
      fill="currentColor"
      d="M4 5.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1a.5.5 0 0 1-.5-.5M4 8a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 0 1h-1A.5.5 0 0 1 4 8m.5 2a.5.5 0 0 0 0 1h1a.5.5 0 0 0 0-1zm0-7A2.5 2.5 0 0 0 2 5.5v5A2.5 2.5 0 0 0 4.5 13h7a2.5 2.5 0 0 0 2.5-2.5v-5A2.5 2.5 0 0 0 11.5 3zM3 5.5A1.5 1.5 0 0 1 4.5 4H7v8H4.5A1.5 1.5 0 0 1 3 10.5zM8 12V4h3.5A1.5 1.5 0 0 1 13 5.5v5a1.5 1.5 0 0 1-1.5 1.5z"
    ></path>
  </svg>
);

// One responsive topbar for desktop and mobile, rendered as the first row of the content panel
const DashboardHeader = () => {
  const { username } = useUser();
  const router = useRouter();

  const showSidebar = useSidebarToggleStore((state) => state.showSidebar);
  const setShowSidebar = useSidebarToggleStore((state) => state.setShowSidebar);
  const setShowMobileSidebar = useSidebarToggleStore(
    (state) => state.setShowMobileSidebar,
  );
  const setIsUserSettingsOpen = useDashboardModalsStore(
    (state) => state.setIsUserSettingsOpen,
  );

  const [isUserCardOpen, setIsUserCardOpen] = useState(false);

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
    <header className="custom:gap-4 custom:border custom:px-4 relative z-1 flex h-14 w-full shrink-0 items-center justify-between gap-2 border-[#eceef1] bg-white px-2 dark:border-neutral-900 dark:bg-black">
      <div className="flex items-center gap-2.5">
        {/* Mobile: open the overlay sidebar */}
        <button
          onClick={() => setShowMobileSidebar(true)}
          className="custom:hidden rounded-full p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Desktop: the logo moves here from the rail while the sidebar is hidden */}
        {!showSidebar && (
          <div className="custom:flex hidden items-center justify-center px-1">
            <DashBoardLogo />
          </div>
        )}

        {/* Desktop: sidebar toggle */}
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="group custom:inline-flex relative hidden rounded-full p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800"
          aria-label={showSidebar ? "Hide sidebar" : "Show sidebar"}
          aria-pressed={showSidebar}
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

      {/* Middle: search / quick navigation (desktop) */}
      <div className="custom:flex hidden min-w-0 flex-1 justify-center">
        <MiddleBar />
      </div>

      {/* Right: actions & user menu */}
      <div className="custom:gap-4 flex shrink-0 items-center gap-2">
        {/* Mobile: back */}
        <button
          onClick={() => router.back()}
          className="custom:hidden rounded-full p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800"
          aria-label="Go back"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <NewsButton />

        {/* On mobile the theme switch lives in the user menu */}
        <div className="custom:contents hidden">
          <ThemeToggle />
        </div>

        <PinnedIssuesButton />
        <Notifications />

        <div className="relative flex flex-col items-center" ref={userDivRef}>
          <button
            onClick={() => setIsUserCardOpen((prev) => !prev)}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-neutral-900 text-white hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            aria-label="Open user menu"
            aria-haspopup="menu"
            aria-expanded={isUserCardOpen}
          >
            <span className="text-xs font-semibold">
              {abbreviateUserName(username)}
            </span>
          </button>

          <UserInfoCard
            isUserCardOpen={isUserCardOpen}
            openDownwards={true}
            openUserSettings={() => setIsUserSettingsOpen(true)}
            closeUserCard={() => setIsUserCardOpen(false)}
            triggerRef={userDivRef}
          />
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
