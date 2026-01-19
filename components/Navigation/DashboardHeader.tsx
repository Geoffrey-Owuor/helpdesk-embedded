"use client";
import Image from "next/image";
import { Menu, CirclePlus, CircleUserRound, Bot } from "lucide-react";
import Link from "next/link";
import ThemeToggle from "../Themes/ThemeToggle";
import { assets } from "@/public/assets";

const DashboardHeader = () => {
  return (
    <div className={`fixed top-0 right-0 left-0 z-50`}>
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <button className="rounded-full p-2 hover:bg-neutral-200 sm:hidden dark:hover:bg-neutral-800">
            <Menu />
          </button>
          <div className="flex items-center gap-0.5">
            <div className="h-8 w-8">
              <Image
                src={assets.issue_desk_image}
                alt="Issue Desk Logo"
                className="dark:invert"
              />
            </div>
            <span className="hidden text-xl font-semibold text-black sm:flex dark:text-white">
              Issue Desk
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="hidden items-center gap-2 rounded-full p-2 hover:bg-neutral-200 sm:flex md:rounded-xl dark:hover:bg-neutral-800">
            <CirclePlus />
            <span className="hidden md:flex">New Issue</span>
          </button>
          <Link
            href="/automations"
            className="hidden items-center gap-2 rounded-full p-2 hover:bg-neutral-200 sm:flex md:rounded-xl dark:hover:bg-neutral-800"
          >
            <Bot />
            <span className="hidden md:flex">Automations</span>
          </Link>
          <ThemeToggle />
          <button className="rounded-full p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800">
            <CircleUserRound />
          </button>
        </div>
      </nav>
    </div>
  );
};

export default DashboardHeader;
