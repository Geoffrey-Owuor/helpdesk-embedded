"use client";
import { Menu, CirclePlus, Bot } from "lucide-react";
import Link from "next/link";
import ThemeToggle from "../Themes/ThemeToggle";
import { useState } from "react";
import { abbreviateUserName } from "@/public/assets";
import { useUser } from "@/contexts/UserContext";
import UserInfoCard from "../Modules/UserInfoCard";
import MobileSideBar from "./MobileSideBar";
import { DashBoardLogo } from "../Modules/DashBoardLogo";

const DashboardHeader = () => {
  // Get the user information
  const user = useUser();
  const [isUserCardOpen, setIsUserCardOpen] = useState(false);
  const [sideBarOpen, setSideBarOpen] = useState(false);
  return (
    <>
      <MobileSideBar
        sideBarOpen={sideBarOpen}
        setSideBarOpen={setSideBarOpen}
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
            <button className="hidden items-center gap-2 rounded-full bg-blue-600 px-2 py-2 text-white hover:bg-blue-700 sm:flex md:rounded-xl md:py-1.5">
              <CirclePlus />
              <span className="hidden md:flex">New Issue</span>
            </button>
            <Link
              href="/automations"
              className="hidden items-center gap-2 rounded-full px-2 py-2 hover:bg-neutral-200 sm:flex md:rounded-xl md:py-1.5 dark:hover:bg-neutral-800"
            >
              <Bot />
              <span className="hidden md:flex">Automations</span>
            </Link>
            <ThemeToggle />
            <div className="relative">
              <button
                onClick={() => setIsUserCardOpen(true)}
                className="relative cursor-pointer rounded-full bg-neutral-200 p-1.5 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-900"
              >
                <span className="font-semibold">
                  {abbreviateUserName(user?.username)}
                </span>
              </button>
              {/* Show the user info card */}
              <UserInfoCard
                user={user}
                isUserCardOpen={isUserCardOpen}
                closeUserCard={() => setIsUserCardOpen(false)}
              />
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};

export default DashboardHeader;
