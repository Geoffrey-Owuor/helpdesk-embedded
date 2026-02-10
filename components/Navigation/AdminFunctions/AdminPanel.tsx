"use client";

import { useUser } from "@/contexts/UserContext";
import { ChevronDown, ShieldUser, Bug, UserRoundPlus } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const AdminPanel = () => {
  const [showAdminOptions, setShowAdminOptions] = useState(false);
  const { role } = useUser();

  // Reference for the dropdown container
  const menuRef = useRef<HTMLDivElement>(null);

  // Toggle function
  const toggleDropdown = () => setShowAdminOptions((prev) => !prev);

  // Handle clicking outside of the menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowAdminOptions(false);
      }
    };

    if (showAdminOptions) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showAdminOptions]);

  if (role !== "admin") return null;

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={toggleDropdown}
        className={`hidden items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm transition-all md:flex dark:bg-neutral-950 ${
          showAdminOptions
            ? "border-blue-500 ring-2 ring-blue-500/20"
            : "border-neutral-200 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
        }`}
      >
        <ShieldUser className="h-5 w-5 text-neutral-500" />
        <span className="custom:inline-flex hidden text-neutral-700 dark:text-neutral-300">
          Admin Panel
        </span>
        <ChevronDown
          className={`h-4 w-4 text-neutral-400 transition-transform duration-200 ${
            showAdminOptions ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {showAdminOptions && (
        <div className="absolute top-full right-0 z-50 mt-2 w-48 origin-top-right rounded-xl border border-neutral-300 bg-white p-1.5 shadow-lg focus:outline-none dark:border-neutral-700 dark:bg-neutral-950">
          <div className="space-y-1">
            <button
              onClick={() => {
                /* Your logic here */ setShowAdminOptions(false);
              }}
              className="flex w-full items-center gap-2 rounded-lg p-2 text-sm text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-900"
            >
              <Bug className="h-4 w-4" />
              <span>Add Issue Type</span>
            </button>

            <button
              onClick={() => {
                /* Your logic here */ setShowAdminOptions(false);
              }}
              className="flex w-full items-center gap-2 rounded-lg p-2 text-sm text-neutral-600 transition-colors hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-900"
            >
              <UserRoundPlus className="h-4 w-4" />
              <span>Add Agent</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
