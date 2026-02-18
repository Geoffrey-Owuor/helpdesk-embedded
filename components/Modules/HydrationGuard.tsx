"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

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
      <div className="fixed inset-0 z-9999 flex items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-black/80">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-12 w-12 animate-spin text-neutral-900 dark:text-neutral-100" />
          <span className="text-sm font-semibold text-neutral-500">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
