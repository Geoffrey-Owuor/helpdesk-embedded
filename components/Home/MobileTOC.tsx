"use client";
import { Menu, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toId, ChangelogData } from "./ChangeLog";

// ─────────────────────────────────────────────
// Mobile Table of Contents
// ─────────────────────────────────────────────

const MobileTOC = ({ items }: { items: ChangelogData[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [stuck, setStuck] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cachedRef = containerRef.current;
    if (!cachedRef) return;

    // The rootMargin maps to your 'top-18' class (72px).
    // We offset it by -73px so the observer triggers exactly when it hits that sticky threshold.
    const observer = new IntersectionObserver(
      ([entry]) => {
        // intersectionRatio < 1 means the element has crossed our sticky boundary limit
        setStuck(entry.intersectionRatio < 1);
      },
      {
        threshold: [1],
        rootMargin: "-73px 0px 0px 0px",
      },
    );

    observer.observe(cachedRef);

    return () => {
      if (cachedRef) observer.unobserve(cachedRef);
    };
  }, []);

  // 2. Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If the dropdown is open and the click target is NOT inside our main container, close it
      if (
        isOpen &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    // Listen to mousedown globally
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]); // Re-run when isOpen changes so we aren't running logic unnecessarily when closed

  if (items.length === 0) return null;

  return (
    <div ref={containerRef} className="sticky top-18 my-4 block lg:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center gap-2 rounded-full bg-neutral-900 ${stuck ? "px-2" : "px-4"} py-2 text-sm font-semibold text-white transition-all duration-200 dark:bg-white dark:text-black`}
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        <span className={`${stuck ? "hidden" : ""}`}>Table of Contents</span>
      </button>

      {isOpen && (
        <div className="layout-scrollbar absolute top-full right-0 left-0 z-30 mt-2 flex max-h-60 flex-col overflow-y-auto rounded-xl bg-neutral-900 px-1 dark:bg-white">
          {items.map((entry) => (
            <a
              key={entry.changelog_id}
              href={`#${toId(entry.changelog_title)}`}
              onClick={() => setIsOpen(false)} // Close menu when a link is clicked
              className="group flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm text-neutral-200 transition-colors dark:text-neutral-600"
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-300 transition-colors dark:bg-neutral-700" />
              <span className="line-clamp-2 leading-snug">
                {entry.changelog_title}
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default MobileTOC;
