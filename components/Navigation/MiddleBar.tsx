"use client";

import { useState, useEffect } from "react";
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
  SlidersHorizontal,
} from "lucide-react";
import { useLoadingStore } from "@/store/useLoadingStore";
import ClientPortal from "../Modules/ClientPortal";
import SearchArea from "./SearchArea";

const MiddleBar = () => {
  const [isOpen, setIsOpen] = useState(false);

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

      // Close when a user presses the escape key
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }

      if (
        ["INPUT", "TEXTAREA"].includes(target.tagName) ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === "/") {
        e.preventDefault(); // Prevent typing the '/' character
        setIsOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // --- Navigation Helper ---
  const handleNavigation = (path: string) => {
    setIsOpen(false); // Close dropdown on navigate
    if (pathname === path) return;
    setLoadingLine(true);
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

      <div className="w-full max-w-md px-8">
        {/* Changed from div to button to be semantically correct and focusable */}
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="relative flex h-10 w-full cursor-pointer items-center rounded-xl border border-neutral-200 bg-white pr-4 pl-10 text-sm text-neutral-400 transition-colors hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900/50 dark:hover:border-neutral-700"
        >
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4.5 w-4.5 text-neutral-400 dark:text-neutral-500" />
          </div>
          <span className="inline-flex flex-1 items-center text-left">
            Press{" "}
            <kbd className="mx-2 rounded-md border border-neutral-300 bg-neutral-100 px-2 py-0.5 text-xs font-semibold text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
              /
            </kbd>{" "}
            to toggle...
          </span>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <SlidersHorizontal className="h-4.5 w-4.5 text-neutral-400 dark:text-neutral-500" />
          </div>
        </button>
      </div>

      {/* ── DROPDOWN PANEL ── */}
      {isOpen && (
        <ClientPortal>
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-3 dark:bg-black/80"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_16px_40px_-12px_rgba(0,0,0,0.15)] dark:border-neutral-800 dark:bg-neutral-950 dark:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.5)]"
            >
              {/* Section 1: Quick Links (Rounded Pills) */}
              <div className="p-4">
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

              {/* Section 2: Search Area */}
              <SearchArea closeBar={() => setIsOpen(false)} />
            </div>
          </div>
        </ClientPortal>
      )}
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
