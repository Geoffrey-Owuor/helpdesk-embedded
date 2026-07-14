import { create } from "zustand";

type ActiveTab = "articles" | "post";

type ActiveTabProps = {
  activeTab: ActiveTab;
  setActiveTab: (status: ActiveTab) => void;
};

export const useActiveTabStore = create<ActiveTabProps>()((set) => ({
  activeTab: "articles",
  setActiveTab: (status) => set({ activeTab: status }),
}));
