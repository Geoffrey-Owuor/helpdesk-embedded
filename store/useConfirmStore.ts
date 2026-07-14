import { create } from "zustand";

type DialogProps = {
  title: string;
  description: string;
  onConfirm: () => Promise<void>;
};

interface ConfirmStore {
  // states
  showDialog: boolean;
  title: string;
  description: string;
  onConfirm: () => Promise<void>;

  //actions
  triggerDialog: ({ title, description, onConfirm }: DialogProps) => void;
  hideDialog: () => void;
}

// creating the store
export const useConfirmStore = create<ConfirmStore>()((set) => ({
  // initial states
  showDialog: false,
  title: "",
  description: "",
  onConfirm: async () => {},

  // Actions
  triggerDialog: ({ title, description, onConfirm }) =>
    set({
      showDialog: true,
      title: title,
      description: description,
      onConfirm: onConfirm,
    }),

  hideDialog: () => set({ showDialog: false }),
}));
