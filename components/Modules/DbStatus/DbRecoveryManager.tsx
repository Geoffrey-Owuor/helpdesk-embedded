"use client";

import { useEffect } from "react";
import { useDbStore } from "@/store/useDbStore";

export function DbRecoveryManager() {
  const status = useDbStore((state) => state.status);
  const triggerCheck = useDbStore((state) => state.triggerCheck);

  useEffect(() => {
    // Only poll if we KNOW the system is down
    if (status !== "degraded") return;

    const interval = setInterval(() => {
      console.log("🔄 System degraded: Attempting to verify recovery...");
      triggerCheck();
    }, 30000); // Check every 30s instead of 10s (less aggressive)

    return () => clearInterval(interval);
  }, [status, triggerCheck]);

  return null; // This component renders nothing
}
