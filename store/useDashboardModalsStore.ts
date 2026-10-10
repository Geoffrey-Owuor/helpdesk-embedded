import { create } from "zustand";

// Dashboard-wide modals, mounted once in DashboardLayoutShell and opened from
// the header, sidebar, mobile sidebar or the search bar
type DashboardModalsProps = {
  isIssueModalOpen: boolean;
  setIsIssueModalOpen: (status: boolean) => void;
  toggleIssueModal: () => void;
  isAdminPanelOpen: boolean;
  setIsAdminPanelOpen: (status: boolean) => void;
  isUserSettingsOpen: boolean;
  setIsUserSettingsOpen: (status: boolean) => void;
};

export const useDashboardModalsStore = create<DashboardModalsProps>()(
  (set) => ({
    isIssueModalOpen: false,
    setIsIssueModalOpen: (status) => set({ isIssueModalOpen: status }),
    toggleIssueModal: () =>
      set((state) => ({ isIssueModalOpen: !state.isIssueModalOpen })),
    isAdminPanelOpen: false,
    setIsAdminPanelOpen: (status) => set({ isAdminPanelOpen: status }),
    isUserSettingsOpen: false,
    setIsUserSettingsOpen: (status) => set({ isUserSettingsOpen: status }),
  }),
);
