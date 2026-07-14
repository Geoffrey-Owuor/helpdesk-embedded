import { basePath } from "@/public/assets";
import { create } from "zustand";

export type DbStatus = "ok" | "degraded" | "checking";

interface DbStore {
  status: DbStatus;
  triggerCheck: () => Promise<void>;
  setStatus: (status: DbStatus) => void;
}

export const useDbStore = create<DbStore>((set) => ({
  status: "ok", //Optimistic that the systems are normal

  setStatus: (status) => set({ status }),

  triggerCheck: async () => {
    set({ status: "checking" });

    try {
      const res = await fetch(`${basePath}/api/healthcheck`, {
        cache: "no-store",
      });
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
