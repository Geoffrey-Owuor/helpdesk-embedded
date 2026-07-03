"use client";
import { useState, useEffect } from "react";

// A hook to detect whether an app is running in iframe mode or not

export const useIsEmbedd = (): boolean => {
  const [isEmbedded, setIsEmbedded] = useState<boolean>(false);

  useEffect(() => {
    // Ensure we are in a browser environment
    if (typeof window !== "undefined") {
      try {
        // If window.self does not equal window.top, the app is in an iframe
        Promise.resolve().then(() => setIsEmbedded(window.self !== window.top));
      } catch (error) {
        // Cross-origin security restrictions mean we are definitely embedded
        console.error(
          "Error while trying to check if app is running in embedd mode:",
          error,
        );
        Promise.resolve().then(() => setIsEmbedded(true));
      }
    }
  }, []);

  return isEmbedded;
};
