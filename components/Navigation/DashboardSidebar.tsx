"use client";
import {
  Menu,
  CirclePlus,
  Bot,
  ChevronLeft,
  ShieldUser,
  ShieldPlus,
  LayoutDashboard,
} from "lucide-react";
import Link from "next/link";
import ThemeToggle from "../Themes/ThemeToggle";
import { useState, useRef } from "react";
import { abbreviateUserName } from "@/public/assets";
import { useUser } from "@/contexts/UserContext";
import UserInfoCard from "../Modules/UserInfoCard";
import MobileSideBar from "./MobileSideBar";
import MainIssueModal from "../Modules/IssueModals/MainIssueModal";
import { DashBoardLogo } from "../Modules/DashBoardLogo";
import { usePathname, useRouter } from "next/navigation";
import { useLoadingStore } from "@/store/useLoadingStore";
import AdminPanel from "./AdminFunctions/AdminPanel";
import UserSettings from "./UserSettings/UserSettings";
import Notifications from "./Notifications/Notifications";

const DashboardSidebar = () => {
  const { username, role, isSuper } = useUser();
  const [sideBarOpen, setSideBarOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showUserSettings, setShowUserSettings] = useState(false);

  // splitting states and refs for mobile and desktop user icons to prevent race conditions
  const [isMobileUserCardOpen, setIsMobileUserCardOpen] = useState(false);
  const [isDesktopUserCardOpen, setIsDesktopUserCardOpen] = useState(false);

  const mobileUserDivRef = useRef<HTMLDivElement>(null);
  const desktopUserDivRef = useRef<HTMLDivElement>(null);

  const setLoadingLine = useLoadingStore((state) => state.setLoadingLine);
  const pathname = usePathname();
  const router = useRouter();

  const isHomeActive = pathname === "/dashboard";
  const isAutomationActive = pathname === "/dashboard/automations";
  const isSuperActive = pathname === "/dashboard/superadmin";

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
      <MainIssueModal
        isOpen={isIssueModalOpen}
        setIsOpen={setIsIssueModalOpen}
      />
      <AdminPanel
        showAdminPanel={showAdminPanel}
        setShowAdminPanel={setShowAdminPanel}
      />
      <UserSettings
        isUserSettingsOpen={showUserSettings}
        setIsUserSettingsOpen={setShowUserSettings}
      />

      {/* Mobile top bar — only visible on small screens */}
      <div className="custom:hidden fixed top-0 right-0 left-0 z-50 flex h-16 items-center justify-between px-4">
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

      {/* Left sidebar — visible on md+ screens */}
      <aside className="custom:flex fixed top-0 bottom-0 left-0 z-50 hidden w-20 flex-col items-center border-neutral-200 py-4 dark:border-neutral-800">
        {/* Logo at the top */}
        <div className="mb-6 flex items-center justify-center">
          <DashBoardLogo />
        </div>

        {/* Nav items — grow to fill space */}
        <nav className="sidebar-nav mb-2 flex w-full flex-1 flex-col items-center gap-1 px-2">
          {/* Home */}
          <SidebarLink
            href="/dashboard"
            icon={<LayoutDashboard className="h-5 w-5" />}
            label="Home"
            isActive={isHomeActive}
            onClick={() => handleRouteChange("/dashboard")}
          />

          {/* New Issue */}
          <SidebarButton
            onClick={() => setIsIssueModalOpen(true)}
            icon={<CirclePlus className="h-5 w-5" />}
            label="New Issue"
            highlight
          />

          {/* Automations */}
          <SidebarLink
            href="/dashboard/automations"
            icon={<Bot className="h-5 w-5" />}
            label="Automate"
            isActive={isAutomationActive}
            onClick={() => handleRouteChange("/dashboard/automations")}
          />

          {/* Super Admin */}
          {isSuper && (
            <SidebarLink
              href="/dashboard/superadmin"
              icon={<ShieldPlus className="h-5 w-5" />}
              label="Super"
              isActive={isSuperActive}
              onClick={() => handleRouteChange("/dashboard/superadmin")}
            />
          )}

          {/* Admin Panel */}
          {role === "admin" && (
            <SidebarButton
              onClick={() => setShowAdminPanel(true)}
              icon={<ShieldUser className="h-5 w-5" />}
              label="Admin"
            />
          )}

          {/* Back */}
          <SidebarButton
            onClick={() => router.back()}
            icon={<ChevronLeft className="h-5 w-5" />}
            label="Back"
          />
        </nav>

        {/* Bottom section: theme toggle + avatar */}
        <div className="mt-auto flex flex-col items-center gap-4">
          {/* The theme toggle */}
          <ThemeToggle />

          {/* The notification bell icon */}
          <Notifications />

          {/* User avatar */}
          <div
            className="relative flex flex-col items-center gap-1"
            ref={desktopUserDivRef}
          >
            <button
              onClick={() => setIsDesktopUserCardOpen((prev) => !prev)}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-neutral-900 text-white hover:bg-neutral-700 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            >
              <span className="text-xs font-semibold">
                {abbreviateUserName(username)}
              </span>
            </button>
            <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
              Profile
            </span>
            <UserInfoCard
              isUserCardOpen={isDesktopUserCardOpen}
              openDownwards={false}
              openUserSettings={() => setShowUserSettings(true)}
              closeUserCard={() => setIsDesktopUserCardOpen(false)}
              triggerRef={desktopUserDivRef}
            />
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
  highlight?: boolean;
};

const SidebarButton = ({
  onClick,
  icon,
  label,
  highlight,
}: SidebarButtonProps) => (
  <button
    onClick={onClick}
    className={`flex w-full flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-semibold text-neutral-600 transition-colors dark:text-neutral-400 ${
      highlight
        ? "hover:bg-neutral-900 hover:text-white dark:hover:bg-white dark:hover:text-black"
        : "hover:bg-neutral-200 dark:hover:bg-neutral-800"
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

type SidebarLinkProps = {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
};

const SidebarLink = ({
  href,
  icon,
  label,
  isActive,
  onClick,
}: SidebarLinkProps) => (
  <Link
    href={href}
    onClick={onClick}
    className={`flex w-full flex-col items-center gap-1 ${isActive ? "border-b-[1.5px] border-neutral-700 text-black dark:border-neutral-300 dark:text-white" : "text-neutral-600 dark:text-neutral-400"} rounded-xl px-1 py-2 text-[10px] font-semibold transition-colors duration-200 hover:bg-neutral-200 dark:hover:bg-neutral-800`}
  >
    {icon}
    <span>{label}</span>
  </Link>
);

export default DashboardSidebar;
