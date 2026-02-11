"use client";

import Link from "next/link";
import { DashBoardLogo } from "../Modules/DashBoardLogo";
import { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import { CirclePlus, Bot, X, Home, ShieldUser } from "lucide-react";
import MainIssueModal from "../Modules/IssueModals/MainIssueModal";
import { useUser } from "@/contexts/UserContext";
import AdminPanel from "./AdminFunctions/AdminPanel";

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
  const { role } = useUser();
  const [showAdminOptions, setShowAdminOptions] = useState(false);

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
          className={`fixed inset-0 bg-black/30 dark:bg-black/60 ${
            sideBarOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setSideBarOpen(false)}
        />

        {/* Sidebar panel */}
        <aside
          className={`relative z-10 flex w-64 flex-col gap-6 border-r border-neutral-300 bg-white px-6 py-4 shadow-sm dark:border-neutral-900 dark:bg-neutral-950 ${
            sideBarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Logo Area and close button */}
          <div className="flex items-center justify-between">
            <DashBoardLogo isSideBarOpen={true} />
            <button onClick={() => setSideBarOpen(false)}>
              <X />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-4">
            {/* Button: New Issue */}
            <button
              onClick={handleNewIssueOpening}
              className="flex w-full items-center gap-2 rounded-xl bg-blue-700 p-2 text-sm font-semibold text-white transition hover:bg-blue-800"
            >
              <CirclePlus />
              <span>New Issue</span>
            </button>

            {/* Link: Homepage */}
            <Link
              href="/dashboard"
              onClick={() => handleMobileRouteChange("/dashboard")}
              className="flex w-full items-center gap-2 rounded-lg p-2 text-sm font-semibold hover:bg-neutral-200 dark:hover:bg-neutral-800"
            >
              <Home />
              <span>Home</span>
            </Link>

            {/* Link: Automations */}
            <Link
              href="/dashboard/automations"
              onClick={() => handleMobileRouteChange("/dashboard/automations")}
              className="flex w-full items-center gap-2 rounded-lg p-2 text-sm font-semibold hover:bg-neutral-200 dark:hover:bg-neutral-800"
            >
              <Bot />
              <span>Automations</span>
            </Link>

            {/* Admin functionality */}
            {role === "admin" && (
              <button
                onClick={handleAdminPanelOpening}
                className="flex w-full items-center gap-2 rounded-lg p-2 text-sm font-semibold hover:bg-neutral-200 dark:hover:bg-neutral-800"
              >
                <ShieldUser />
                <span>Admin Panel</span>
              </button>
            )}
          </nav>
        </aside>
      </div>
    </>
  );
};

export default MobileSideBar;
