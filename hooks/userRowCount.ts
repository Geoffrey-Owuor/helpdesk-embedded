"use client";

import { useEffect, useState, useMemo } from "react";

const MOBILE_ROWS = [6, 12, 24, 48, 96, 192];
const DESKTOP_ROWS = [8, 14, 26, 50, 98, 194];

const BREAKPOINT_QUERY = "(min-width: 1280px)";

export const useRowCount = () => {
  // null = not yet determined (SSR safe)
  const [isLargeScreen, setIsLargeScreen] = useState<boolean | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState<number>(MOBILE_ROWS[0]);

  const rowsArray = useMemo(
    () => (isLargeScreen ? DESKTOP_ROWS : MOBILE_ROWS),
    [isLargeScreen],
  );

  useEffect(() => {
    const media = window.matchMedia(BREAKPOINT_QUERY);

    const applyScreenSize = (isLarge: boolean) => {
      setIsLargeScreen((prev) => {
        // Only update if the large/small classification actually changed
        if (prev === isLarge) return prev;

        setRowsPerPage((currentVal) => {
          const oldArray = isLarge ? MOBILE_ROWS : DESKTOP_ROWS;
          const newArray = isLarge ? DESKTOP_ROWS : MOBILE_ROWS;
          const currentIndex = oldArray.indexOf(currentVal);
          const safeIndex = currentIndex !== -1 ? currentIndex : 0;
          return newArray[safeIndex];
        });

        return isLarge;
      });
    };

    // Single synchronous init — no double Promise.resolve microtasks
    applyScreenSize(media.matches);

    const handleChange = (e: MediaQueryListEvent) => applyScreenSize(e.matches);
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  return { rowsPerPage, rowsArray, setRowsPerPage };
};
