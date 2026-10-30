"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { basePath } from "@/lib/basePath";
import { useConfirmStore } from "@/store/useConfirmStore";

type GuardMessage = { title: string; description: string };

// Asks before leaving a page with unsaved input. Covers in-app links (caught
// before <Link> handles the click, then followed with router.push once
// confirmed) and reloads, closing the tab or leaving the app (the browser's
// own beforeunload prompt). Next has no app-wide way to block router.push
// calls or the Back button, so those still leave without asking.
export function useUnsavedChangesGuard(
  isDirty: boolean,
  { title, description }: GuardMessage,
) {
  const router = useRouter();
  const triggerDialog = useConfirmStore((state) => state.triggerDialog);
  const hideDialog = useConfirmStore((state) => state.hideDialog);

  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    const handleClick = (e: MouseEvent) => {
      // New-tab clicks and other modifiers keep this page open
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
        return;

      const anchor =
        e.target instanceof Element ? e.target.closest("a[href]") : null;
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if ((anchor.target && anchor.target !== "_self") || anchor.download)
        return;

      const url = new URL(anchor.href);
      const inApp =
        url.origin === window.location.origin &&
        (!basePath ||
          url.pathname === basePath ||
          url.pathname.startsWith(`${basePath}/`));
      // Another site or app is a full page load - beforeunload asks then
      if (!inApp) return;
      // Same page (a #hash) doesn't lose anything
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      )
        return;

      e.preventDefault();
      e.stopPropagation(); // Keep <Link> from navigating

      const appPath = url.pathname.slice(basePath.length) || "/";
      triggerDialog({
        title,
        description,
        onConfirm: async () => {
          hideDialog();
          router.push(`${appPath}${url.search}${url.hash}`);
        },
      });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    // Capture phase on document runs before React's listeners on the root
    document.addEventListener("click", handleClick, true);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleClick, true);
    };
  }, [isDirty, title, description, router, triggerDialog, hideDialog]);
}
