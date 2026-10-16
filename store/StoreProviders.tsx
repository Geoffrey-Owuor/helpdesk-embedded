"use client";

import { useState } from "react";
import { DashboardPreferences } from "@/lib/DashboardPreferences";
import { createSearchStore, SearchStoreContext } from "./useSearchStore";
import {
  createSidebarToggleStore,
  SidebarToggleStoreContext,
} from "./useSidebarToggleStore";

// Creates the cookie-backed preference stores once per dashboard session,
// seeded with the values the server read, so server and client render alike
export const StoreProviders = ({
  preferences,
  children,
}: {
  preferences: DashboardPreferences;
  children: React.ReactNode;
}) => {
  const [searchStore] = useState(() => createSearchStore(preferences));
  const [sidebarStore] = useState(() => createSidebarToggleStore(preferences));

  return (
    <SearchStoreContext.Provider value={searchStore}>
      <SidebarToggleStoreContext.Provider value={sidebarStore}>
        {children}
      </SidebarToggleStoreContext.Provider>
    </SearchStoreContext.Provider>
  );
};
