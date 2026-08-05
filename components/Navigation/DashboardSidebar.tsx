/* eslint-disable @next/next/no-html-link-for-pages */
"use client";
import {
  Menu,
  CirclePlus,
  ChevronLeft,
  ShieldUser,
  ShieldPlus,
  LayoutDashboard,
  NotebookPen,
  Keyboard,
  CircleQuestionMark,
  HousePlug,
  ChartColumnBig,
} from "lucide-react";
import Link from "next/link";
import ThemeToggle from "../Themes/ThemeToggle";
import { useState, useRef, useEffect } from "react";
import { abbreviateUserName } from "@/public/assets";
import { useUser } from "@/contexts/UserContext";
import UserInfoCard from "../Modules/UserInfoCard";
import MobileSideBar from "./MobileSideBar";
import MainIssueModal from "../Modules/IssueModals/MainIssueModal";
import { usePathname, useRouter } from "next/navigation";
import { useLoadingStore } from "@/store/useLoadingStore";
import AdminPanel from "./AdminFunctions/AdminPanel";
import UserSettings from "./UserSettings/UserSettings";
import Notifications from "./Notifications/Notifications";
import ClientPortal from "../Modules/ClientPortal";
import { useSidebarToggleStore } from "@/store/useSidebarToggleStore";
import NewsButton from "../Modules/News/NewsButton";
import { useIsEmbedd } from "@/hooks/useIsEmbedd";

const DashboardSidebar = () => {
  const { username, role, isSuper } = useUser();
  const [sideBarOpen, setSideBarOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showUserSettings, setShowUserSettings] = useState(false);
  const showSidebar = useSidebarToggleStore((state) => state.showSidebar);

  const isEmbedded = useIsEmbedd();

  // New Issue Keyboard Shortcut Listener
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
      // Listen for Ctrl + Q
      if (e.ctrlKey && e.key.toLowerCase() === "q") {
        e.preventDefault(); // Prevent any default browser behavior
        setIsIssueModalOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // splitting states and refs for mobile and desktop user icons to prevent race conditions
  const [isMobileUserCardOpen, setIsMobileUserCardOpen] = useState(false);

  const mobileUserDivRef = useRef<HTMLDivElement>(null);

  const setLoadingLine = useLoadingStore((state) => state.setLoadingLine);
  const pathname = usePathname();
  const router = useRouter();

  // Determine which link to highlight
  const highlightLink = (path: string) => path === pathname;

  const handleRouteChange = (route: string) => {
    if (route === pathname) return;

    setLoadingLine(true);
  };

  return (
    <>
      {/* Mobile overlay sidebar (unchanged behavior) */}
      <MobileSideBar
        handleRouteChange={handleRouteChange}
        sideBarOpen={sideBarOpen}
        setSideBarOpen={setSideBarOpen}
      />
      {isIssueModalOpen && (
        <MainIssueModal
          isOpen={isIssueModalOpen}
          setIsOpen={setIsIssueModalOpen}
        />
      )}
      <AdminPanel
        showAdminPanel={showAdminPanel}
        setShowAdminPanel={setShowAdminPanel}
      />
      <UserSettings
        isUserSettingsOpen={showUserSettings}
        setIsUserSettingsOpen={setShowUserSettings}
      />

      {/* Mobile top bar — only visible on small screens */}
      <div className="fixed top-0 right-0 left-0 z-50 flex items-center justify-between px-4 py-2 lg:hidden">
        <button
          onClick={() => setSideBarOpen(true)}
          className="rounded-full p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-4">
          {/* Back button */}
          <button
            onClick={() => router.back()}
            className="rounded-full p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* News Button */}
          <NewsButton />

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <Notifications />

          {/* User avatar */}
          <div className="relative" ref={mobileUserDivRef}>
            <button
              onClick={() => setIsMobileUserCardOpen((prev) => !prev)}
              className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-neutral-900 text-white hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            >
              <span className="text-xs font-semibold">
                {abbreviateUserName(username)}
              </span>
            </button>
            <UserInfoCard
              isUserCardOpen={isMobileUserCardOpen}
              openDownwards={true}
              openUserSettings={() => setShowUserSettings(true)}
              closeUserCard={() => setIsMobileUserCardOpen(false)}
              triggerRef={mobileUserDivRef}
            />
          </div>
        </div>
      </div>

      {/* Left sidebar — visible on lg+ screens */}
      <aside
        className={`fixed top-14 bottom-0 transition-all duration-200 ease-in-out ${showSidebar ? "translate-x-0" : "-translate-x-full"} left-0 z-50 hidden w-20 flex-col items-center border-neutral-200 pb-2 lg:flex dark:border-neutral-800`}
      >
        <div className="mx-auto mb-2 w-full px-2">
          {/* Home */}
          <SidebarLink
            href="/dashboard"
            icon={<LayoutDashboard className="h-5 w-5" />}
            label="Home"
            isActive={highlightLink("/dashboard")}
            onClick={() => handleRouteChange("/dashboard")}
            showToolTip={true}
            ToolTipMessage="Dashboard"
          />
        </div>

        {/* Nav items — grow to fill space */}
        <nav className="mb-2 flex w-full flex-1 scrollbar-none flex-col items-center gap-1.5 overflow-y-auto mask-[linear-gradient(to_bottom,transparent_0%,black_24px,black_calc(100%-24px),transparent_100%)] px-2">
          {/* New Issue */}
          <SidebarButton
            onClick={() => setIsIssueModalOpen(true)}
            icon={<CirclePlus className="h-5 w-5" />}
            label="New Issue"
            showToolTip={true}
            isNewIssue={true}
            ToolTipMessage="Ctrl + Q"
          />

          {/* Super Admin */}
          {isSuper && (
            <SidebarLink
              href="/dashboard/superadmin"
              icon={<ShieldPlus className="h-5 w-5" />}
              label="Super"
              isActive={highlightLink("/dashboard/superadmin")}
              onClick={() => handleRouteChange("/dashboard/superadmin")}
              showToolTip={true}
              ToolTipMessage="Super Admin"
            />
          )}

          {/* Issues Analytics */}
          {role === "admin" && (
            <SidebarLink
              href="/dashboard/analytics"
              icon={<ChartColumnBig className="h-5 w-5" />}
              label="Analytics"
              isActive={highlightLink("/dashboard/analytics")}
              onClick={() => handleRouteChange("/dashboard/analytics")}
              showToolTip={true}
              ToolTipMessage="Issues Analytics"
            />
          )}

          {/* Admin Panel */}
          {role === "admin" && (
            <SidebarButton
              onClick={() => setShowAdminPanel(true)}
              icon={<ShieldUser className="h-5 w-5" />}
              label="Admin"
              showToolTip={true}
              ToolTipMessage="Admin Panel"
            />
          )}

          {/* Articles Page */}
          <SidebarLink
            href="/dashboard/articles"
            icon={<NotebookPen className="h-5 w-5" />}
            label="Articles"
            isActive={highlightLink("/dashboard/articles")}
            onClick={() => handleRouteChange("/dashboard/articles")}
            showToolTip={true}
            ToolTipMessage="Articles Hub"
          />
        </nav>

        {/* The back button */}
        <div className="mt-auto w-full px-2">
          <div className="flex w-full flex-col items-center justify-center gap-1.5">
            {/* The main hub link - uses a tag to avoid basePath issues */}
            {!isEmbedded && (
              <a
                href="/dashboard"
                className="flex w-full flex-col items-center gap-1 rounded-2xl py-2.5 text-[10px] font-semibold text-neutral-600 transition-colors hover:bg-neutral-200 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
              >
                <HousePlug className="h-5 w-5" />
                <span>Hub</span>
              </a>
            )}
            {/* Back */}
            <SidebarButton
              onClick={() => router.back()}
              icon={<ChevronLeft className="h-5 w-5" />}
              label="Back"
              showToolTip={true}
              ToolTipMessage="Go Back"
            />
            <Link
              href="/manual"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full p-2 text-neutral-600 transition-colors hover:bg-neutral-200 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            >
              <CircleQuestionMark className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};

// ─── Small helpers ────────────────────────────────────────────────────────────

type SidebarButtonProps = {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  isNewIssue?: boolean;
  showToolTip?: boolean;
  ToolTipMessage?: string;
};

const SidebarButton = ({
  onClick,
  icon,
  label,
  isNewIssue = false,
  showToolTip = false,
  ToolTipMessage,
}: SidebarButtonProps) => {
  // 1. State to track hover and exact coordinates of the button
  const [isHovered, setIsHovered] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleMouseEnter = () => {
    if (!showToolTip) return;

    // 2. Calculate exactly where the button is on the screen right now
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top + rect.height / 2, // Find the vertical center of the button
        left: rect.right, // Find the exact right edge of the button
      });
    }
    setIsHovered(true);
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsHovered(false)}
        className="flex w-full flex-col items-center gap-1 rounded-2xl py-2.5 text-[10px] font-semibold text-neutral-600 transition-colors hover:bg-neutral-200 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
      >
        {icon}
        <span>{label}</span>
      </button>

      {/* ── TOOLTIP (Rendered via Portal to escape the overflow trap) ── */}
      {showToolTip && ToolTipMessage && isHovered && (
        <ClientPortal>
          <div
            // Position it exactly where we calculated, using fixed so scrolling doesn't break it
            style={{ top: coords.top, left: coords.left }}
            className="pointer-events-none fixed z-9999 ml-3 -translate-y-1/2"
          >
            <div className="relative flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-white shadow-lg dark:bg-white dark:text-neutral-900">
              {isNewIssue && (
                <Keyboard
                  size={14}
                  className="shrink-0 text-neutral-400 dark:text-neutral-500"
                />
              )}
              {ToolTipMessage}

              {/* Tooltip Tail/Arrow pointing left */}
              <div className="absolute top-1/2 -left-1 h-2.5 w-2.5 -translate-y-1/2 rotate-45 rounded-sm bg-neutral-900 dark:bg-white" />
            </div>
          </div>
        </ClientPortal>
      )}
    </>
  );
};

type SidebarLinkProps = {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
  showToolTip?: boolean;
  ToolTipMessage?: string;
};

const SidebarLink = ({
  href,
  icon,
  label,
  isActive,
  onClick,
  showToolTip = false,
  ToolTipMessage,
}: SidebarLinkProps) => {
  // 1. State to track hover and exact coordinates of the button
  const [isHovered, setIsHovered] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const linkRef = useRef<HTMLAnchorElement>(null);

  const handleMouseEnter = () => {
    if (!showToolTip) return;

    // 2. Calculate exactly where the button is on the screen right now
    if (linkRef.current) {
      const rect = linkRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top + rect.height / 2, // Find the vertical center of the button
        left: rect.right, // Find the exact right edge of the button
      });
    }
    setIsHovered(true);
  };

  return (
    <>
      <Link
        ref={linkRef}
        href={href}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsHovered(false)}
        className={`flex w-full flex-col items-center gap-1 ${isActive ? "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200" : "text-neutral-600 hover:bg-neutral-200 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"} rounded-2xl py-2.5 text-[10px] font-semibold`}
      >
        {icon}
        <span>{label}</span>
      </Link>

      {/* ── TOOLTIP (Rendered via Portal to escape the overflow trap) ── */}
      {showToolTip && ToolTipMessage && isHovered && (
        <ClientPortal>
          <div
            // Position it exactly where we calculated, using fixed so scrolling doesn't break it
            style={{ top: coords.top, left: coords.left }}
            className="pointer-events-none fixed z-9999 ml-3 -translate-y-1/2"
          >
            <div className="relative rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-white shadow-lg dark:bg-white dark:text-neutral-900">
              {ToolTipMessage}

              {/* Tooltip Tail/Arrow pointing left */}
              <div className="absolute top-1/2 -left-1 h-2.5 w-2.5 -translate-y-1/2 rotate-45 rounded-sm bg-neutral-900 dark:bg-white" />
            </div>
          </div>
        </ClientPortal>
      )}
    </>
  );
};

export default DashboardSidebar;
