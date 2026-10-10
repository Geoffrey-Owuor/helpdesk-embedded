"use client";
import {
  CirclePlus,
  ChevronLeft,
  ShieldUser,
  ShieldPlus,
  LayoutDashboard,
  NotebookPen,
  Keyboard,
  CircleQuestionMark,
  HousePlug,
  ChartColumnBig,
} from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import MobileSideBar from "./MobileSideBar";
import { usePathname, useRouter } from "next/navigation";
import { useLoadingStore } from "@/store/useLoadingStore";
import ClientPortal from "../Modules/ClientPortal";
import { useSidebarToggleStore } from "@/store/useSidebarToggleStore";
import { useDashboardModalsStore } from "@/store/useDashboardModalsStore";
import { DashBoardLogo } from "../Modules/DashBoardLogo";
import { useIsEmbedd } from "@/hooks/useIsEmbedd";
import { hasFeatureAccess, FEATURES } from "@/lib/FeatureAccess";

const DashboardSidebar = () => {
  const { role, isSuper, specialAccess } = useUser();
  const showSidebar = useSidebarToggleStore((state) => state.showSidebar);
  const showMobileSidebar = useSidebarToggleStore(
    (state) => state.showMobileSidebar,
  );
  const setShowMobileSidebar = useSidebarToggleStore(
    (state) => state.setShowMobileSidebar,
  );
  const setIsIssueModalOpen = useDashboardModalsStore(
    (state) => state.setIsIssueModalOpen,
  );
  const toggleIssueModal = useDashboardModalsStore(
    (state) => state.toggleIssueModal,
  );
  const setIsAdminPanelOpen = useDashboardModalsStore(
    (state) => state.setIsAdminPanelOpen,
  );

  const isEmbedded = useIsEmbedd();

  // New Issue Keyboard Shortcut Listener
  useEffect(() => {
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
        toggleIssueModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleIssueModal]);

  const setLoadingLine = useLoadingStore((state) => state.setLoadingLine);
  const pathname = usePathname();
  const router = useRouter();

  // Determine which link to highlight
  const highlightLink = (path: string) => path === pathname;

  const handleRouteChange = (route: string) => {
    if (route === pathname) return;

    setLoadingLine(true);
  };

  return (
    <>
      {/* Mobile overlay sidebar (opened from the topbar menu button) */}
      <MobileSideBar
        handleRouteChange={handleRouteChange}
        highlightLink={highlightLink}
        sideBarOpen={showMobileSidebar}
        setSideBarOpen={setShowMobileSidebar}
      />

      {/* Left rail — desktop only; shows/hides instantly (no animation) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 hidden w-20 flex-col items-center pb-2 ${showSidebar ? "custom:flex" : ""}`}
      >
        {/* Logo — top-2 + h-14 lines it up with the in-panel topbar */}
        <div className="mt-2 flex h-14 w-full shrink-0 items-center justify-center">
          <DashBoardLogo />
        </div>

        <div className="mx-auto mb-2 w-full px-2">
          {/* Home */}
          <SidebarLink
            href="/dashboard"
            icon={<LayoutDashboard className="h-5 w-5" />}
            label="Home"
            isActive={highlightLink("/dashboard")}
            onClick={() => handleRouteChange("/dashboard")}
            showToolTip={true}
            ToolTipMessage="Dashboard"
          />
        </div>

        {/* Nav items — grow to fill space */}
        <nav className="sidebar-nav mb-2 flex w-full flex-1 flex-col items-center gap-1.5 overflow-y-auto mask-[linear-gradient(to_bottom,transparent_0%,black_24px,black_calc(100%-24px),transparent_100%)] px-2">
          {/* New Issue */}
          <SidebarButton
            onClick={() => setIsIssueModalOpen(true)}
            icon={<CirclePlus className="h-5 w-5" />}
            label="New Issue"
            showToolTip={true}
            showTooltipIcon={true}
            ToolTipMessage="Ctrl + Q"
          />

          {/* Super Admin */}
          {isSuper && (
            <SidebarLink
              href="/dashboard/superadmin"
              icon={<ShieldPlus className="h-5 w-5" />}
              label="Super"
              isActive={highlightLink("/dashboard/superadmin")}
              onClick={() => handleRouteChange("/dashboard/superadmin")}
              showToolTip={true}
              ToolTipMessage="Super Admin"
            />
          )}

          {/* Issues Analytics */}
          {hasFeatureAccess({ role, specialAccess }, FEATURES.ANALYTICS) && (
            <SidebarLink
              href="/dashboard/analytics"
              icon={<ChartColumnBig className="h-5 w-5" />}
              label="Analytics"
              isActive={highlightLink("/dashboard/analytics")}
              onClick={() => handleRouteChange("/dashboard/analytics")}
              showToolTip={true}
              ToolTipMessage="Issues Analytics"
            />
          )}

          {/* Admin Panel */}
          {role === "admin" && (
            <SidebarButton
              onClick={() => setIsAdminPanelOpen(true)}
              icon={<ShieldUser className="h-5 w-5" />}
              label="Admin"
              showToolTip={true}
              ToolTipMessage="Admin Panel"
            />
          )}

          {/* Articles Page */}
          <SidebarLink
            href="/dashboard/articles"
            icon={<NotebookPen className="h-5 w-5" />}
            label="Articles"
            isActive={highlightLink("/dashboard/articles")}
            onClick={() => handleRouteChange("/dashboard/articles")}
            showToolTip={true}
            ToolTipMessage="Articles Hub"
          />
        </nav>

        {/* The back button */}
        <div className="mt-auto w-full px-2">
          <div className="flex w-full flex-col items-center justify-center gap-1.5">
            {/* The main hub link - uses a tag to avoid basePath issues */}
            {!isEmbedded && (
              <SidebarIconLink
                href="/dashboard"
                nativeAnchor={true}
                icon={<HousePlug className="h-5 w-5" />}
                label="Apps Hub"
              />
            )}
            {/* Back */}
            <SidebarButton
              onClick={() => router.back()}
              icon={<ChevronLeft className="h-5 w-5" />}
              label="Back"
              iconOnly={true}
              showToolTip={true}
              showTooltipIcon={true}
              ToolTipMessage="Back · Ctrl + ←"
            />
            <SidebarIconLink
              href="/manual"
              openInNewTab={true}
              icon={<CircleQuestionMark className="h-5 w-5" />}
              label="User Manual"
            />
          </div>
        </div>
      </aside>
    </>
  );
};

// ─── Small helpers ────────────────────────────────────────────────────────────

// Round icon-only buttons used by the rail's bottom group (Hub, Back, user manual)
const ICON_BUTTON_CLASSES =
  "rounded-full p-2 text-neutral-600 transition-colors hover:bg-neutral-200 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200";

// Tracks hover and the trigger's right-edge midpoint so the tooltip can be portaled out of the rail's overflow
const useRailTooltip = <T extends HTMLElement>(enabled: boolean) => {
  const [isHovered, setIsHovered] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const ref = useRef<T>(null);

  const onMouseEnter = () => {
    if (!enabled) return;

    // Calculate exactly where the trigger is on the screen right now
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setCoords({
        top: rect.top + rect.height / 2, // Vertical center of the trigger
        left: rect.right, // Right edge of the trigger
      });
    }
    setIsHovered(true);
  };

  const onMouseLeave = () => setIsHovered(false);

  return { ref, isHovered, coords, onMouseEnter, onMouseLeave };
};

type RailTooltipProps = {
  coords: { top: number; left: number };
  message: string;
  showKeyboardIcon?: boolean;
};

// ── TOOLTIP (Rendered via Portal to escape the overflow trap) ──
const RailTooltip = ({
  coords,
  message,
  showKeyboardIcon = false,
}: RailTooltipProps) => (
  <ClientPortal>
    <div
      // Position it exactly where we calculated, using fixed so scrolling doesn't break it
      style={{ top: coords.top, left: coords.left }}
      className="pointer-events-none fixed z-9999 ml-3 -translate-y-1/2"
    >
      <div className="relative flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-white shadow-lg dark:bg-white dark:text-neutral-900">
        {showKeyboardIcon && (
          <Keyboard
            size={14}
            className="shrink-0 text-neutral-400 dark:text-neutral-500"
          />
        )}
        {message}

        {/* Tooltip Tail/Arrow pointing left */}
        <div className="absolute top-1/2 -left-1 h-2.5 w-2.5 -translate-y-1/2 rotate-45 rounded-sm bg-neutral-900 dark:bg-white" />
      </div>
    </div>
  </ClientPortal>
);

type SidebarButtonProps = {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  iconOnly?: boolean;
  showTooltipIcon?: boolean;
  showToolTip?: boolean;
  ToolTipMessage?: string;
};

const SidebarButton = ({
  onClick,
  icon,
  label,
  iconOnly = false,
  showTooltipIcon = false,
  showToolTip = false,
  ToolTipMessage,
}: SidebarButtonProps) => {
  const { ref, isHovered, coords, onMouseEnter, onMouseLeave } =
    useRailTooltip<HTMLButtonElement>(showToolTip);

  return (
    <>
      <button
        ref={ref}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        aria-label={label}
        className={
          iconOnly
            ? ICON_BUTTON_CLASSES
            : "flex w-full flex-col items-center gap-1 rounded-2xl py-2.5 text-[11px] font-semibold text-neutral-600 transition-colors hover:bg-neutral-200 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
        }
      >
        {icon}
        {!iconOnly && <span>{label}</span>}
      </button>

      {showToolTip && ToolTipMessage && isHovered && (
        <RailTooltip
          coords={coords}
          message={ToolTipMessage}
          showKeyboardIcon={showTooltipIcon}
        />
      )}
    </>
  );
};

type SidebarLinkProps = {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick?: () => void;
  showToolTip?: boolean;
  ToolTipMessage?: string;
};

const SidebarLink = ({
  href,
  icon,
  label,
  isActive,
  onClick,
  showToolTip = false,
  ToolTipMessage,
}: SidebarLinkProps) => {
  const { ref, isHovered, coords, onMouseEnter, onMouseLeave } =
    useRailTooltip<HTMLAnchorElement>(showToolTip);

  return (
    <>
      <Link
        ref={ref}
        href={href}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={`flex w-full flex-col items-center gap-1 ${isActive ? "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200" : "text-neutral-600 hover:bg-neutral-200 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"} rounded-2xl py-2.5 text-[11px] font-semibold`}
      >
        {icon}
        <span>{label}</span>
      </Link>

      {showToolTip && ToolTipMessage && isHovered && (
        <RailTooltip coords={coords} message={ToolTipMessage} />
      )}
    </>
  );
};

type SidebarIconLinkProps = {
  href: string;
  icon: React.ReactNode;
  label: string;
  // Plain <a> that bypasses basePath (e.g. the Apps Hub at the site root)
  nativeAnchor?: boolean;
  openInNewTab?: boolean;
};

// Round icon-only link with a rail tooltip; the label doubles as the tooltip and aria-label
const SidebarIconLink = ({
  href,
  icon,
  label,
  nativeAnchor = false,
  openInNewTab = false,
}: SidebarIconLinkProps) => {
  const { ref, isHovered, coords, onMouseEnter, onMouseLeave } =
    useRailTooltip<HTMLAnchorElement>(true);

  const linkProps = {
    ref,
    href,
    onMouseEnter,
    onMouseLeave,
    "aria-label": label,
    className: ICON_BUTTON_CLASSES,
    ...(openInNewTab && { target: "_blank", rel: "noopener noreferrer" }),
  };

  return (
    <>
      {nativeAnchor ? (
        <a {...linkProps}>{icon}</a>
      ) : (
        <Link {...linkProps}>{icon}</Link>
      )}

      {isHovered && <RailTooltip coords={coords} message={label} />}
    </>
  );
};

export default DashboardSidebar;
