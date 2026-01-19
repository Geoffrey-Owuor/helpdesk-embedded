import ClientPortal from "./ClientPortal";
import { Loader2 } from "lucide-react";

export const LogoutOverlay = () => {
  const content = (
    <div className="fixed inset-0 z-9999 flex h-screen items-center justify-center bg-white dark:bg-neutral-950">
      {/* Container to align the spinner and text horizontally */}
      <div className="flex items-center space-x-2">
        {/* The Lucide Loader spinner */}
        <Loader2
          className="h-9 w-9 animate-spin text-neutral-900 dark:text-white"
          aria-label="loading"
        />

        {/* The text, styled for dark and light modes */}
        <span className="text-xl text-neutral-900 dark:text-white">
          Logging out...
        </span>
      </div>
    </div>
  );

  return <ClientPortal>{content}</ClientPortal>;
};
