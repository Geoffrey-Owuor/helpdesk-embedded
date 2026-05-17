"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@/contexts/UserContext";
import MainIssueModal from "../Modules/IssueModals/MainIssueModal";
import AdminPanel from "./AdminFunctions/AdminPanel";
import {
  Search,
  LayoutDashboard,
  CirclePlus,
  Bot,
  ShieldPlus,
  ShieldUser,
  NotebookPen,
  ChevronLeft,
} from "lucide-react";
import { useLoadingStore } from "@/store/useLoadingStore";

const MiddleBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  //   States for opening the admin panel and new issue
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const { role, isSuper } = useUser();
  const setLoadingLine = useLoadingStore((state) => state.setLoadingLine);

  // --- Keyboard & Click Outside Listeners ---
  useEffect(() => {
    // Handle '/' to open, 'Escape' to close
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if the user is typing in a text input or textarea somewhere else
      const target = e.target as HTMLElement;
      if (
        ["INPUT", "TEXTAREA"].includes(target.tagName) ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === "/") {
        e.preventDefault(); // Prevent typing the '/' character
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    // Handle clicking outside the component to close it
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // --- Navigation Helper ---
  const handleNavigation = (path: string) => {
    if (pathname === path) return;
    setLoadingLine(true);
    setIsOpen(false); // Close dropdown on navigate
    router.push(path);
  };

  return (
    <>
      {/* Main Issue Modal */}
      {isIssueModalOpen && (
        <MainIssueModal
          isOpen={isIssueModalOpen}
          setIsOpen={setIsIssueModalOpen}
        />
      )}

      {/* Admin Panel */}
      <AdminPanel
        showAdminPanel={isAdminPanelOpen}
        setShowAdminPanel={setIsAdminPanelOpen}
      />

      <div
        className="relative flex flex-1 items-center justify-center px-8"
        ref={containerRef}
      >
        {/* ── TRIGGER BUTTON ── */}
        <div className="relative w-full max-w-lg">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
          </div>

          {/* Changed from div to button to be semantically correct and focusable */}
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="flex h-10 w-full cursor-pointer items-center rounded-xl border border-neutral-200 bg-white pr-4 pl-10 text-sm text-neutral-400 transition-colors hover:border-neutral-300 focus:border-neutral-400 focus:outline-none dark:border-neutral-800 dark:bg-neutral-900/50 dark:hover:border-neutral-700"
          >
            <span className="flex-1 text-left">Quick actions & search...</span>
            <kbd className="hidden items-center gap-1 rounded border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-500 sm:flex dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
              Press /
            </kbd>
          </button>
        </div>

        {/* ── DROPDOWN PANEL ── */}
        {isOpen && (
          <div className="animate-in fade-in slide-in-from-top-2 absolute top-[calc(100%+8px)] z-50 w-full max-w-lg overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_16px_40px_-12px_rgba(0,0,0,0.15)] dark:border-neutral-800 dark:bg-neutral-950 dark:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.5)]">
            <div className="layout-scrollbar max-h-[70vh] overflow-y-auto p-4">
              {/* Section 1: Quick Links (Rounded Pills) */}
              <div className="mb-6">
                <h3 className="mb-3 text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                  Quick Navigation
                </h3>
                <div className="flex flex-wrap gap-2">
                  <PillButton
                    icon={<LayoutDashboard size={14} />}
                    label="Home"
                    onClick={() => handleNavigation("/dashboard")}
                  />

                  {/* TODO: To trigger this modal from here, you either need to pass `setIsIssueModalOpen` as a prop down to this header, OR move `isIssueModalOpen` to a global Zustand store. */}
                  <PillButton
                    icon={<CirclePlus size={14} />}
                    label="New Issue"
                    onClick={() => {
                      setIsIssueModalOpen(true);
                      setIsOpen(false);
                    }}
                    accent
                  />

                  <PillButton
                    icon={<Bot size={14} />}
                    label="Automate"
                    onClick={() => handleNavigation("/dashboard/automations")}
                  />

                  <PillButton
                    icon={<NotebookPen size={14} />}
                    label="Articles"
                    onClick={() => handleNavigation("/dashboard/articles")}
                  />

                  {isSuper && (
                    <PillButton
                      icon={<ShieldPlus size={14} />}
                      label="Super Admin"
                      onClick={() => handleNavigation("/dashboard/superadmin")}
                    />
                  )}

                  {/* Trigger opening of the admin panel */}
                  {role === "admin" && (
                    <PillButton
                      icon={<ShieldUser size={14} />}
                      label="Admin Panel"
                      onClick={() => {
                        setIsAdminPanelOpen(true);
                        setIsOpen(false);
                      }}
                    />
                  )}

                  <PillButton
                    icon={<ChevronLeft size={14} />}
                    label="Go Back"
                    onClick={() => {
                      router.back();
                      setIsOpen(false);
                    }}
                  />
                </div>
              </div>

              {/* Section 2: Search Placeholder */}
              <div>
                <h3 className="mb-3 text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                  Search
                </h3>
                {/* TODO: Wire up actual search functionality and input later */}
                <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/50">
                  <p className="text-sm text-neutral-400 dark:text-neutral-500">
                    Search functionality coming soon...
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// ─── Subcomponent: Pill Button ───────────────────────────────────────────────

type PillButtonProps = {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  accent?: boolean; // Used to highlight primary actions like "New Issue"
};

const PillButton = ({
  icon,
  label,
  onClick,
  accent = false,
}: PillButtonProps) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium transition-all active:scale-95 ${
      accent
        ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40"
        : "border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400 dark:hover:bg-neutral-900"
    } `}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default MiddleBar;
