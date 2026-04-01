import { create } from "zustand";

export type DbStatus = "ok" | "degraded" | "checking";

interface DbStore {
  status: DbStatus;
  triggerCheck: () => Promise<void>;
  setStatus: (status: DbStatus) => void;
}

export const useDbStore = create<DbStore>((set, get) => ({
  status: "degraded", // Assume OK by default

  setStatus: (status) => set({ status }),

  triggerCheck: async () => {
    // Prevent multiple simultaneous checks
    if (get().status === "checking") return;

    set({ status: "checking" });

    try {
      const res = await fetch("/api/healthcheck", { cache: "no-store" });
      if (res.ok) {
        set({ status: "ok" });
      } else {
        set({ status: "degraded" });
      }
    } catch {
      set({ status: "degraded" });
    }
  },
}));
