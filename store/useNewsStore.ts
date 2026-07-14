import { create } from "zustand";

type NewsProps = {
  showNews: boolean;
  setShowNews: (status: boolean) => void;
};

export const useNewsStore = create<NewsProps>()((set) => ({
  showNews: false,
  setShowNews: (status) => set({ showNews: status }),
}));
