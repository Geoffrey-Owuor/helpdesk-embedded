"use client";
import {
  Menu,
  CirclePlus,
  Bot,
  Home,
  ChevronLeft,
  ShieldUser,
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
import { useLoadingLine } from "@/contexts/LoadingLineContext";
import AdminPanel from "./AdminFunctions/AdminPanel";

const DashboardHeader = () => {
  // Get the user information
  const { username, role } = useUser();
  const [isUserCardOpen, setIsUserCardOpen] = useState(false);
  const [sideBarOpen, setSideBarOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const userButtonRef = useRef<HTMLButtonElement>(null);
  const { setLoadingLine } = useLoadingLine();
  const pathname = usePathname();
  const router = useRouter();

  const handleRouteChange = (route: string) => {
    if (route === pathname) return;
    setLoadingLine(true);
  };

  return (
    <>
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

      <div className={`fixed top-0 right-0 left-0 z-50`}>
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSideBarOpen(true)}
              className="rounded-full p-2 hover:bg-neutral-200 sm:hidden dark:hover:bg-neutral-800"
            >
              <Menu />
            </button>
            <DashBoardLogo />
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsIssueModalOpen(true)}
              className="hidden items-center gap-2 rounded-full bg-blue-700 px-2 py-2 text-sm text-white hover:bg-blue-800 sm:flex md:rounded-xl md:px-3"
            >
              <CirclePlus className="h-4.5 w-4.5" />
              <span className="hidden md:inline-flex">New Issue</span>
            </button>

            {/* Admin Functionality */}
            {role === "admin" && (
              <button
                onClick={() => setShowAdminPanel((prev) => !prev)}
                className="hidden items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm transition-all hover:bg-neutral-50 md:flex dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-900"
              >
                <ShieldUser className="h-5 w-5 text-neutral-500" />
                <span className="custom:inline-flex hidden text-neutral-700 dark:text-neutral-300">
                  Admin Panel
                </span>
              </button>
            )}

            <Link
              href="/dashboard/automations"
              onClick={() => handleRouteChange("/dashboard/automations")}
              className="custom:rounded-xl custom:px-3 hidden items-center gap-2 rounded-full px-2 py-2 text-sm hover:bg-neutral-200 sm:flex dark:hover:bg-neutral-800"
            >
              <Bot className="h-5 w-5" />
              <span className="custom:inline-flex hidden">Automations</span>
            </Link>
            {/* Back button */}
            <button
              onClick={() => router.back()}
              title="Go back"
              className="rounded-full p-2 transition-colors duration-200 hover:bg-neutral-200 dark:hover:bg-neutral-800"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <Link
              href="/dashboard"
              onClick={() => handleRouteChange("/dashboard")}
              className="rounded-full p-2 transition-colors duration-200 hover:bg-neutral-200 dark:hover:bg-neutral-800"
            >
              <Home className="h-4.5 w-4.5" />
            </Link>
            <div className="w-10">
              <ThemeToggle />
            </div>
            <div className="relative">
              <button
                ref={userButtonRef}
                onClick={() => setIsUserCardOpen((prev) => !prev)}
                className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
              >
                <span className="text-xs font-semibold">
                  {abbreviateUserName(username)}
                </span>
              </button>
              {/* Show the user info card */}
              <UserInfoCard
                isUserCardOpen={isUserCardOpen}
                closeUserCard={() => setIsUserCardOpen(false)}
                triggerRef={userButtonRef} //passing the ref to the child
              />
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};

export default DashboardHeader;
