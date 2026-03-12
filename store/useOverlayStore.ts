import { create } from "zustand";

type OverlayText =
  | "Loading"
  | "Updating"
  | "Deleting"
  | "Logging out"
  | "Reassigning"
  | "Adding"
  | "";

interface OverlayStore {
  // states
  loading: boolean;
  overlaytext: OverlayText;

  // actions
  showOverlay: (text: OverlayText) => void;
  hideOverlay: () => void;
}

// creating the store
export const useOverlayStore = create<OverlayStore>()((set) => ({
  // states
  loading: false,
  overlaytext: "",

  //actions
  showOverlay: (text) =>
    set({
      loading: true,
      overlaytext: text,
    }),

  hideOverlay: () =>
    set({
      loading: false,
      overlaytext: "",
    }),
}));
