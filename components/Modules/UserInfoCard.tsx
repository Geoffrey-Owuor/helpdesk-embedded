"use client";

import { Settings, LogOut, Shield } from "lucide-react";
import apiClient from "@/lib/AxiosClient";
import { useRouter } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import { usePromiseOverlay } from "@/contexts/PromiseOverlayContext";
import { useEffect, RefObject } from "react";

type UserCardProps = {
  isUserCardOpen: boolean;
  closeUserCard: () => void;
  openUserSettings: () => void;
  triggerRef: RefObject<HTMLElement | null>;
};

const UserInfoCard = ({
  isUserCardOpen,
  closeUserCard,
  openUserSettings,
  triggerRef,
}: UserCardProps) => {
  const router = useRouter();

  const { role, username, email } = useUser();
  const { setPromiseOverlayInfo } = usePromiseOverlay();

  //Automatically close user card when a user clicks outside
  useEffect(() => {
    if (!isUserCardOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      )
        closeUserCard();
    };

    window.addEventListener("mousedown", handleClickOutside);

    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [isUserCardOpen, closeUserCard, triggerRef]);

  const handleLogout = async () => {
    setPromiseOverlayInfo({
      loading: true,
      overlaytext: "Logging out",
    });
    try {
      await apiClient.post("/logout");
      // Redirect to login and refresh the page state
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed", error);
      setPromiseOverlayInfo({
        loading: false,
        overlaytext: "",
      });
    }
  };

  if (!isUserCardOpen) return null;

  return (
    <div className="absolute top-full right-0 z-50 mt-2 w-45 origin-top-right rounded-xl border border-neutral-300 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-950">
      {/* Header Section: Avatar & Name */}
      <div className="flex items-center gap-3 border-b border-neutral-100 p-4 dark:border-neutral-800">
        <div className="flex min-w-0 flex-col">
          <p className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {username}
          </p>
          <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
            {email}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-2">
        <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
          <Shield size={16} className="text-blue-500" />
          <span className="tracking-wider uppercase">{role}</span>
        </div>
        <button
          onClick={() => {
            openUserSettings();
            closeUserCard();
          }}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-900"
        >
          <Settings size={16} />
          Settings
        </button>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          <LogOut size={16} />
          Log out
        </button>
      </div>
    </div>
  );
};

export default UserInfoCard;
