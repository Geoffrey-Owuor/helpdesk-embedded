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
      title="Toggle Theme"
      className="inline-flex items-center justify-center rounded-full p-2 text-neutral-700 hover:bg-neutral-200 dark:text-neutral-300 dark:hover:bg-neutral-800"
      aria-label="Toggle Theme"
    >
      {/* Placeholder keeps layout stable during SSR */}
      <span className="h-5 w-5" aria-hidden>
        <Sun className="block h-5 w-5 dark:hidden" />
        <Moon className="hidden h-5 w-5 dark:block" />
      </span>
    </button>
  );
};

export default ThemeToggle;
