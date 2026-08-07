"use client";

import { MessageCirclePlus, Keyboard } from "lucide-react";
import { useState, useEffect } from "react";
import QuickCreateModal from "./QuickCreateModal";
import { useQuickCreateStore } from "@/store/useQuickCreateStore";

const QuickCreateButton = () => {
  const [fullUrl, setFullUrl] = useState("");

  // Modal state lives in the store so the hero/CTA buttons can open it too
  const isModalOpen = useQuickCreateStore((state) => state.isOpen);
  const closeQuickCreate = useQuickCreateStore(
    (state) => state.closeQuickCreate,
  );
  const toggleQuickCreate = useQuickCreateStore(
    (state) => state.toggleQuickCreate,
  );

  // --- Keyboard Shortcut Listener ---
  useEffect(() => {
    //Return if in an external domain
    if (window.location.href === process.env.NEXT_PUBLIC_BASE_URL) return;

    // Set full url
    Promise.resolve().then(() => setFullUrl(window.location.href));

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if the user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        ["INPUT", "TEXTAREA"].includes(target.tagName) ||
        target.isContentEditable
      ) {
        return;
      }
      // Listen for Ctrl + Q
      if (e.ctrlKey && e.key.toLowerCase() === "q") {
        e.preventDefault(); // Prevent any default browser behavior
        toggleQuickCreate();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleQuickCreate]);

  const showButton = fullUrl !== process.env.NEXT_PUBLIC_BASE_URL;

  return (
    <>
      {/* Quick Create Modal */}
      {isModalOpen && (
        <QuickCreateModal
          isOpen={isModalOpen}
          setIsOpen={() => closeQuickCreate()}
        />
      )}

      {fullUrl && showButton && (
        <button
          onClick={toggleQuickCreate}
          aria-label="Quick create issue"
          // Positioned fixed at the bottom right.
          // active:scale-90 creates the zoom-in-out click animation.
          className="group fixed right-6 bottom-6 z-50 flex cursor-pointer items-center justify-center rounded-full bg-blue-600 p-4 text-white shadow-xl shadow-blue-600/30 transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-600/40 sm:right-8 sm:bottom-8 dark:shadow-blue-500/20 dark:hover:bg-blue-700 dark:hover:shadow-blue-600/20"
        >
          {/* ── TOOLTIP ── */}
          <div className="pointer-events-none absolute -top-9 right-0 flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-all duration-200 group-hover:-translate-y-1 group-hover:opacity-100 dark:bg-white dark:text-neutral-900">
            <Keyboard
              size={14}
              className="shrink-0 text-neutral-400 dark:text-neutral-500"
            />
            <span>Ctrl + Q</span>
            {/* Tooltip Tail/Arrow */}
            <div className="absolute right-6 -bottom-1 h-2.5 w-2.5 rotate-45 rounded-sm bg-neutral-900 dark:bg-white" />
          </div>

          {/* Text Container
        - Placed *before* the icon so it expands towards the left.
        - max-w-0 and opacity-0 hide it initially.
        - On group-hover, max-w increases and it fades in.
      */}
          <span className="max-w-0 overflow-hidden text-[15px] font-semibold tracking-wide whitespace-nowrap opacity-0 transition-all duration-200 ease-in-out group-hover:mr-3 group-hover:max-w-30 group-hover:opacity-100">
            Quick create
          </span>

          {/* Center Icon */}
          <MessageCirclePlus size={24} className="shrink-0" />
        </button>
      )}
    </>
  );
};

export default QuickCreateButton;
