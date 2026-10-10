import { create } from "zustand";

// Ids of the modals currently open, in the order they were opened. Only the
// last one (the topmost) handles Escape and Tab trapping, so closing a confirm
// dialog doesn't also close the form underneath it.
type ModalStackProps = {
  stack: string[];
  push: (id: string) => void;
  remove: (id: string) => void;
};

export const useModalStackStore = create<ModalStackProps>()((set) => ({
  stack: [],
  push: (id) =>
    set((state) => ({ stack: [...state.stack.filter((s) => s !== id), id] })),
  remove: (id) =>
    set((state) => ({ stack: state.stack.filter((s) => s !== id) })),
}));

export const isTopModal = (id: string) => {
  const { stack } = useModalStackStore.getState();
  return stack[stack.length - 1] === id;
};
