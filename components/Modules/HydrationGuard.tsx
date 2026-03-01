"use client";

import { useState, useEffect } from "react";

export default function HydrationGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    Promise.resolve().then(() => setMounted(true));
  }, []);

  if (!mounted) {
    return (
      <div className="fixed inset-0 z-9999 flex items-center justify-center bg-white dark:bg-black">
        {/* Tailwind border illusion */}
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-900 dark:border-neutral-700 dark:border-t-neutral-100" />
      </div>
    );
  }

  return <>{children}</>;
}
