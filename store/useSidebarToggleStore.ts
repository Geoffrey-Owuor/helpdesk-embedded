"use client";

import { createContext, useContext } from "react";
import { createStore, useStore, type StoreApi } from "zustand";
import {
  DashboardPreferences,
  PREFERENCE_COOKIES,
  writePreferenceCookie,
} from "@/lib/DashboardPreferences";

type SidebarToggleProps = {
  showSidebar: boolean;
  setShowSidebar: (status: boolean) => void;
  showMobileSidebar: boolean;
  setShowMobileSidebar: (status: boolean) => void;
};

// Seeded per request from the sidebar cookie so the server renders the rail
// the way the user left it (see StoreProviders)
export const createSidebarToggleStore = (preferences: DashboardPreferences) =>
  createStore<SidebarToggleProps>()((set) => ({
    showSidebar: preferences.showSidebar,
    setShowSidebar: (status) => {
      set({ showSidebar: status });
      writePreferenceCookie(PREFERENCE_COOKIES.showSidebar, status);
    },
    // Only the desktop rail preference is remembered; the mobile overlay always starts closed
    showMobileSidebar: false,
    setShowMobileSidebar: (status) => set({ showMobileSidebar: status }),
  }));

export const SidebarToggleStoreContext =
  createContext<StoreApi<SidebarToggleProps> | null>(null);

export const useSidebarToggleStore = <T>(
  selector: (state: SidebarToggleProps) => T,
): T => {
  const store = useContext(SidebarToggleStoreContext);
  if (!store) {
    throw new Error("useSidebarToggleStore must be used within StoreProviders");
  }
  return useStore(store, selector);
};
