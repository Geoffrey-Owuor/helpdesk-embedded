import { create } from "zustand";

type SidebarToggleProps = {
  showSidebar: boolean;
  setShowSidebar: (status: boolean) => void;
};

export const useSidebarToggleStore = create<SidebarToggleProps>()((set) => ({
  showSidebar: true,
  setShowSidebar: (status) => set({ showSidebar: status }),
}));
