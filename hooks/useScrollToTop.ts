import { useEffect } from "react";
import { usePathname } from "next/navigation";

export const useScrollToTop = (containerId: string = "main-content") => {
  const pathname = usePathname();

  useEffect(() => {
    const container = document.getElementById(containerId);
    if (container) {
      container.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [pathname, containerId]);
};
