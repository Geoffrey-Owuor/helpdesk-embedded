"use client";

import { useEffect, useRef } from "react";
import { AuthJWTPayload } from "@/lib/Auth";
import { basePath } from "@/public/assets";

// Type definition for the BroadcastChannel message payload
interface AuthChannelMessage {
  action: "EMBEDLOGIN" | "EMBEDLOGOUT";
  userId?: string;
}

export function useAuthSync(user: AuthJWTPayload) {
  // FIX 1: Initialize with null to avoid calling Date.now() during render
  const lastCheckedRef = useRef<number | null>(null);

  useEffect(() => {
    const localUserId = user.userId;
    if (!localUserId) return;

    // Set the initial timestamp when the component mounts/user changes
    if (lastCheckedRef.current === null) {
      lastCheckedRef.current = Date.now();
    }

    // 1. Initialize Modern Cross-Tab communication channel
    const authChannel = new BroadcastChannel("embed_auth_session_sync");

    // FIX 2: Explicitly typed the event parameter using MessageEvent
    const handleCrossTabMessage = async (
      event: MessageEvent<AuthChannelMessage>,
    ) => {
      const { action, userId } = event.data;

      if (action === "EMBEDLOGOUT") {
        // Another tab logged out, immediately redirect
        window.location.href = `${basePath}/login`;
      } else if (action === "EMBEDLOGIN" && userId !== localUserId) {
        // Another tab logged in as a different user - reload page
        window.location.reload();
      }
    };

    authChannel.addEventListener("message", handleCrossTabMessage);

    // Cleanup listeners on unmount
    return () => {
      authChannel.removeEventListener("message", handleCrossTabMessage);
      authChannel.close();
    };
  }, [user]);
}
