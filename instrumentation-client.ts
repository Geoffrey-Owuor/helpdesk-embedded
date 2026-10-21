import { useLoadingStore } from "@/store/useLoadingStore";
import { basePath } from "@/lib/basePath";

// Runs for every App Router navigation: <Link>, router.push/replace and back/forward
export function onRouterTransitionStart(
  url: string,
  navigationType: "push" | "replace" | "traverse",
) {
  // Back/forward passes the URL after the browser has already moved to it, so there is nothing to compare
  if (navigationType !== "traverse") {
    // push/replace pass the href without the base path
    const target = new URL(
      url.startsWith("/") ? `${basePath}${url}` : url,
      window.location.href,
    );

    // Same-URL and hash-only navigations never change the pathname or search, so the line would never finish
    if (
      target.pathname === window.location.pathname &&
      target.search === window.location.search
    )
      return;
  }

  useLoadingStore.getState().startLoadingLine();
}
