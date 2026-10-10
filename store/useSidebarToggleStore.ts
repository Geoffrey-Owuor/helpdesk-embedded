import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type SidebarToggleProps = {
  showSidebar: boolean;
  setShowSidebar: (status: boolean) => void;
  showMobileSidebar: boolean;
  setShowMobileSidebar: (status: boolean) => void;
};

export const useSidebarToggleStore = create<SidebarToggleProps>()(
  persist(
    (set) => ({
      showSidebar: true,
      setShowSidebar: (status) => set({ showSidebar: status }),
      showMobileSidebar: false,
      setShowMobileSidebar: (status) => set({ showMobileSidebar: status }),
    }),
    {
      name: "HelpDesk-sidebar-store",
      storage: createJSONStorage(() => localStorage),
      // Only the desktop rail preference is remembered; the mobile overlay always starts closed
      partialize: (state) => ({ showSidebar: state.showSidebar }),
    },
  ),
);
