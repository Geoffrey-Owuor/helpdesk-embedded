"use client";

import { Settings, LogOut, Shield } from "lucide-react";
import apiClient from "@/lib/AxiosClient";
import { useUser } from "@/contexts/UserContext";
import { useOverlayStore } from "@/store/useOverlayStore";
import { useEffect, RefObject } from "react";
import { useIsEmbedd } from "@/hooks/useIsEmbedd";

type UserCardProps = {
  isUserCardOpen: boolean;
  openDownwards: boolean;
  closeUserCard: () => void;
  openUserSettings: () => void;
  triggerRef: RefObject<HTMLElement | null>;
};

const UserInfoCard = ({
  isUserCardOpen,
  openDownwards,
  closeUserCard,
  openUserSettings,
  triggerRef,
}: UserCardProps) => {
  const { role, username, email } = useUser();

  const isEmbedded = useIsEmbedd();

  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const hideOverlay = useOverlayStore((state) => state.hideOverlay);

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
    showOverlay("Logging out");
    try {
      await apiClient.post("/logout");

      // Notify other tabs to redirect to login
      const authChannel = new BroadcastChannel("auth_session_sync");
      authChannel.postMessage({ action: "LOGOUT" });
      authChannel.close();

      // Redirect to login and refresh the page state
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed", error);
      hideOverlay();
    }
  };

  if (!isUserCardOpen) return null;

  return (
    <div
      className={`absolute ${openDownwards ? "top-full right-0 mt-2 origin-top-right" : "bottom-full left-0 mb-2 origin-bottom-left"} z-50 w-45 rounded-xl border border-neutral-300 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-950`}
    >
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

        {!isEmbedded && (
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            <LogOut size={16} />
            Log out
          </button>
        )}
      </div>
    </div>
  );
};

export default UserInfoCard;
