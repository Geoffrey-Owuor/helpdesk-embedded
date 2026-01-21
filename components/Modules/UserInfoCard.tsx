"use client";

import { AuthJWTPayload } from "@/lib/Auth";
import { Settings, LogOut, Shield } from "lucide-react";
import apiClient from "@/lib/AxiosClient";
import { useRouter } from "next/navigation";
import { PromiseOverlay } from "./Overlays";
import { useState, useEffect, useRef } from "react";

type UserCardProps = {
  user: AuthJWTPayload | null;
  isUserCardOpen: boolean;
  closeUserCard: () => void;
};

const UserInfoCard = ({
  user,
  isUserCardOpen,
  closeUserCard,
}: UserCardProps) => {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const userCardRef = useRef<HTMLDivElement>(null);

  //Automatically close user card when a user clicks outside
  useEffect(() => {
    if (!isUserCardOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        userCardRef.current &&
        !userCardRef.current.contains(event.target as Node)
      )
        closeUserCard();
    };

    window.addEventListener("mousedown", handleClickOutside);

    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [isUserCardOpen, closeUserCard]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await apiClient.post("/logout");
      // Redirect to login and refresh the page state
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed", error);
      setIsLoggingOut(false);
    }
  };

  if (!isUserCardOpen || !user) return null;

  return (
    <>
      {isLoggingOut && <PromiseOverlay overlaytext="Logging out" />}
      <div
        ref={userCardRef}
        className="absolute top-full right-0 z-50 mt-2 w-45 origin-top-right rounded-xl border border-neutral-200 bg-white shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
      >
        {/* Header Section: Avatar & Name */}
        <div className="flex items-center gap-3 border-b border-neutral-100 p-4 dark:border-neutral-800">
          <div className="flex min-w-0 flex-col">
            <p className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {user.username}
            </p>
            <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
              {user.email}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-2">
          <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
            <Shield size={16} className="text-blue-500" />
            <span className="tracking-wider uppercase">{user.role}</span>
          </div>
          <button
            onClick={() => console.log("Navigate to settings")}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            <Settings size={16} />
            Settings
          </button>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </div>
    </>
  );
};

export default UserInfoCard;
