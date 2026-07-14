"use client";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThemeToggle = () => {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    Promise.resolve().then(() => setMounted(true));
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }
      if (e.key === "d" || e.key === "D") {
        setTheme(isDark ? "light" : "dark");
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [setTheme, isDark]);

  return (
    <button
      onClick={() => mounted && setTheme(isDark ? "light" : "dark")}
      className="group relative inline-flex items-center justify-center rounded-full p-2 text-neutral-700 hover:bg-neutral-200 dark:text-neutral-300 dark:hover:bg-neutral-800"
      aria-label="Toggle Theme"
    >
      {/* ── TOOLTIP (Now at the Bottom) ── */}
      <div className="pointer-events-none absolute top-full left-1/2 z-50 mt-2 -translate-x-1/2 -translate-y-2 opacity-0 transition-all duration-200 ease-out group-hover:translate-y-0 group-hover:opacity-100">
        <div className="relative flex items-center gap-2 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-white shadow-lg dark:bg-white dark:text-neutral-900">
          <span>Toggle Mode</span>
          <kbd className="rounded border border-neutral-600 px-1.25 text-xs font-semibold text-neutral-300 dark:border-neutral-400 dark:text-neutral-600">
            D
          </kbd>

          {/* Tooltip Tail/Arrow pointing UP */}
          <div className="absolute -top-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 rounded-sm bg-neutral-900 dark:bg-white" />
        </div>
      </div>

      {/* Placeholder keeps layout stable during SSR */}
      <span className="h-5 w-5" aria-hidden>
        <Sun className="block h-5 w-5 dark:hidden" />
        <Moon className="hidden h-5 w-5 dark:block" />
      </span>
    </button>
  );
};

export default ThemeToggle;
