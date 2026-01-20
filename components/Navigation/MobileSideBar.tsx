"use client";

import Link from "next/link";
import { DashBoardLogo } from "../Modules/DashBoardLogo";
import { Dispatch, SetStateAction } from "react";
import { CirclePlus, Bot, X } from "lucide-react";

type MobileSideBarProps = {
  sideBarOpen: boolean;

  setSideBarOpen: Dispatch<SetStateAction<boolean>> | ((open: boolean) => void);
};

const MobileSideBar = ({ sideBarOpen, setSideBarOpen }: MobileSideBarProps) => {
  return (
    <div
      className={`fixed inset-0 z-70 flex ${
        sideBarOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      {/* Sidebar backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 transition-opacity duration-300 ease-in-out ${
          sideBarOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => setSideBarOpen(false)}
      />

      {/* Sidebar panel */}
      <aside
        className={`relative z-10 flex w-64 flex-col gap-6 bg-white px-6 py-4 shadow-sm transition-transform duration-300 ease-in-out dark:bg-neutral-900 ${
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
            onClick={() => {
              console.log("New Issue Triggered");
              setSideBarOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-lg bg-blue-600 p-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <CirclePlus />
            <span>New Issue</span>
          </button>

          {/* Link: Automations */}
          <Link
            href="/automations"
            onClick={() => setSideBarOpen(false)}
            className="flex w-full items-center gap-2 rounded-lg p-2 text-sm font-semibold hover:bg-neutral-200 dark:hover:bg-neutral-800"
          >
            <Bot />
            <span>Automations</span>
          </Link>
        </nav>
      </aside>
    </div>
  );
};

export default MobileSideBar;
