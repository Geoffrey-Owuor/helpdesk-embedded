import { create } from "zustand";

// Defining types
interface QuickCreateState {
  isOpen: boolean;

  // actions
  openQuickCreate: () => void;
  closeQuickCreate: () => void;
  toggleQuickCreate: () => void;
}

// Creating the store - lets any homepage section (hero, CTA band, the floating
// button, or the Ctrl + Q shortcut) drive the single Quick Create modal instance
export const useQuickCreateStore = create<QuickCreateState>()((set) => ({
  isOpen: false,

  openQuickCreate: () => set({ isOpen: true }),
  closeQuickCreate: () => set({ isOpen: false }),
  toggleQuickCreate: () => set((state) => ({ isOpen: !state.isOpen })),
}));
