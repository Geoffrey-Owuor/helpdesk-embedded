"use client";

import { useEffect, useState } from "react";

const HydrationGuard = ({ children }: { children: React.ReactNode }) => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    Promise.resolve().then(() => setHydrated(true));
  }, []);

  if (!hydrated) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-500 dark:border-neutral-700 dark:border-t-neutral-300" />
      </div>
    );
  }

  return <>{children}</>;
};

export default HydrationGuard;
