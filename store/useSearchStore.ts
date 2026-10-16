"use client";

import { createContext, useContext } from "react";
import { createStore, useStore, type StoreApi } from "zustand";
import {
  DashboardPreferences,
  PREFERENCE_COOKIES,
  writePreferenceCookie,
} from "@/lib/DashboardPreferences";

// Defining the state interface
interface SearchState {
  superAdminFilter: boolean;
  agentAdminFilter: string;
  isTableView: boolean;
}

// Defining the actions interface
interface SearchActions {
  setSuperAdminFilter: (value: boolean) => void;
  setAgentAdminFilter: (value: string) => void;
  setIsTableView: (value: boolean) => void;
}

type SearchStore = SearchState & SearchActions;

// One store per request/session, seeded from the preference cookies the
// dashboard layout read on the server (see StoreProviders). A module-level
// store would be shared by every request on the server.
export const createSearchStore = (preferences: DashboardPreferences) =>
  createStore<SearchStore>()((set) => ({
    // Initial State
    superAdminFilter: preferences.superAdminFilter,
    agentAdminFilter: preferences.agentAdminFilter,
    isTableView: preferences.isTableView,

    // Actions (setters) also remember the choice for the next server render
    setAgentAdminFilter: (agentAdminFilter) => {
      set({ agentAdminFilter });
      writePreferenceCookie(PREFERENCE_COOKIES.agentAdminFilter, agentAdminFilter);
    },
    setSuperAdminFilter: (superAdminFilter) => {
      set({ superAdminFilter });
      writePreferenceCookie(PREFERENCE_COOKIES.superAdminFilter, superAdminFilter);
    },
    setIsTableView: (isTableView) => {
      set({ isTableView });
      writePreferenceCookie(PREFERENCE_COOKIES.isTableView, isTableView);
    },
  }));

export const SearchStoreContext = createContext<StoreApi<SearchStore> | null>(
  null,
);

export const useSearchStore = <T>(selector: (state: SearchStore) => T): T => {
  const store = useContext(SearchStoreContext);
  if (!store) {
    throw new Error("useSearchStore must be used within StoreProviders");
  }
  return useStore(store, selector);
};
