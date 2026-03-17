"use client";

import { useEffect, useState, useMemo } from "react";

// Define the configurations outside the hook
const MOBILE_ROWS = [6, 12, 24, 48, 96, 192];
const DESKTOP_ROWS = [8, 14, 26, 50, 98, 194];

export const useRowCount = () => {
  const [isLargeScreen, setIsLargeScreen] = useState<boolean | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState(6);

  // Keep track of the current array for index lookups during resize
  const rowsArray = useMemo(() => {
    return isLargeScreen ? DESKTOP_ROWS : MOBILE_ROWS;
  }, [isLargeScreen]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 1279px)");

    const handleChange = (e: MediaQueryList | MediaQueryListEvent) => {
      const isNowSmall = e.matches;

      // 1. Determine which array we are moving FROM and TO
      const oldArray = isNowSmall ? DESKTOP_ROWS : MOBILE_ROWS;
      const newArray = isNowSmall ? MOBILE_ROWS : DESKTOP_ROWS;

      // 2. Find the index of the current selection in the old array
      // We use a functional update to get the latest rowsPerPage value
      setRowsPerPage((currentVal) => {
        const currentIndex = oldArray.indexOf(currentVal);

        // 3. Map that index to the new array
        // Fallback to index 0 if not found for some reason
        const safeIndex = currentIndex !== -1 ? currentIndex : 0;
        return newArray[safeIndex];
      });

      setIsLargeScreen(!isNowSmall);
    };

    // Initial Setup
    const initialIsSmall = media.matches;
    Promise.resolve().then(() => setIsLargeScreen(!initialIsSmall));
    Promise.resolve().then(() =>
      setRowsPerPage(initialIsSmall ? MOBILE_ROWS[0] : DESKTOP_ROWS[0]),
    );

    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  return { rowsPerPage, rowsArray, setRowsPerPage };
};
