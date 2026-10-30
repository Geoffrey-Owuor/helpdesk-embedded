"use client";
import {
  ChevronLeft,
  Keyboard,
  CircleQuestionMark,
  HousePlug,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useUser } from "@/contexts/UserContext";
import MobileSideBar from "./MobileSideBar";
import SidebarMoreMenu from "./SidebarMoreMenu";
import { usePathname, useRouter } from "next/navigation";
import ClientPortal from "../Modules/ClientPortal";
import { useSidebarToggleStore } from "@/store/useSidebarToggleStore";
import { useDashboardModalsStore } from "@/store/useDashboardModalsStore";
import { DashBoardLogo } from "../Modules/DashBoardLogo";
import { useIsEmbedd } from "@/hooks/useIsEmbedd";
import { hubUrl } from "@/lib/basePath";
import {
  DashboardNavAction,
  NEW_ISSUE_HREF,
  DashboardNavItem,
  HOME_NAV_ITEM,
  getDashboardNavGroups,
  isNavItemActive,
} from "@/lib/dashboardNav";

// Keyboard focus ring for rail items, offset from the page background
const FOCUS_RING_CLASSES =
  "outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50 dark:focus-visible:ring-white dark:focus-visible:ring-offset-neutral-950";

const railItemClass = (highlighted: boolean) =>
  `flex w-full shrink-0 flex-col items-center gap-1 rounded-2xl py-2.5 text-[11px] font-semibold transition-colors ${FOCUS_RING_CLASSES} ${
    highlighted
      ? "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
      : "text-neutral-600 hover:bg-neutral-200 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
  }`;

// Matches the list's gap-1.5
const RAIL_GAP_PX = 6;

const DashboardSidebar = () => {
  const user = useUser();
  const showSidebar = useSidebarToggleStore((state) => state.showSidebar);
  const showMobileSidebar = useSidebarToggleStore(
    (state) => state.showMobileSidebar,
  );
  const setShowMobileSidebar = useSidebarToggleStore(
    (state) => state.setShowMobileSidebar,
  );
  const setIsAdminPanelOpen = useDashboardModalsStore(
    (state) => state.setIsAdminPanelOpen,
  );

  const isEmbedded = useIsEmbedd();

  const pathname = usePathname();
  const router = useRouter();

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
        router.push(NEW_ISSUE_HREF);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  const runAction = (action: DashboardNavAction) => {
    if (action === "adminPanel") setIsAdminPanelOpen(true);
  };

  const items = getDashboardNavGroups(user).flatMap((group) => group.items);

  // How many items fit the rail's height; the rest go into More, which takes
  // the next slot. All items render until the first measurement.
  const [visibleCount, setVisibleCount] = useState(items.length);
  const spaceRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const itemHeightRef = useRef(0);
  const itemCount = items.length;

  useLayoutEffect(() => {
    const space = spaceRef.current;
    if (!space) return;

    const measure = () => {
      // Every rail item has the same height; remember it for when none show.
      // A hidden rail measures 0, so keep the last real height.
      const firstItem = listRef.current?.firstElementChild as HTMLElement;
      if (firstItem?.offsetHeight) {
        itemHeightRef.current = firstItem.offsetHeight;
      }
      const itemHeight = itemHeightRef.current;
      if (!itemHeight) return;

      const fits = Math.floor(
        (space.clientHeight + RAIL_GAP_PX) / (itemHeight + RAIL_GAP_PX),
      );
      setVisibleCount(fits >= itemCount ? itemCount : Math.max(fits - 1, 0));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(space);
    return () => observer.disconnect();
    // Re-measure when the rail is shown again (it's display:none while hidden)
  }, [itemCount, showSidebar]);

  const visibleItems = items.slice(0, visibleCount);
  const overflowItems = items.slice(visibleCount);

  return (
    <>
      {/* Mobile overlay sidebar (opened from the topbar menu button) */}
      <MobileSideBar
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

        <nav
          aria-label="Main"
          className="mb-2 flex min-h-0 w-full flex-1 flex-col gap-1.5 overflow-hidden px-2 pt-1"
        >
          <RailItem
            item={HOME_NAV_ITEM}
            isActive={isNavItemActive(HOME_NAV_ITEM, pathname)}
            onAction={runAction}
          />
          <div
            aria-hidden="true"
            className="mx-3 my-0.5 h-px shrink-0 bg-neutral-200 dark:bg-neutral-800"
          />

          {/* Measured: the space left under Home */}
          <div ref={spaceRef} className="flex min-h-0 flex-1 flex-col">
            <ul ref={listRef} className="flex flex-col gap-1.5">
              {visibleItems.map((item) => (
                <li key={item.key}>
                  <RailItem
                    item={item}
                    isActive={isNavItemActive(item, pathname)}
                    onAction={runAction}
                  />
                </li>
              ))}
              {overflowItems.length > 0 && (
                <li>
                  <SidebarMoreMenu
                    items={overflowItems}
                    pathname={pathname}
                    onAction={runAction}
                    buttonClassName={railItemClass}
                  />
                </li>
              )}
            </ul>
          </div>
        </nav>

        {/* The back button */}
        <div className="w-full shrink-0 px-2">
          <div className="flex w-full flex-col items-center justify-center gap-1.5">
            {/* The Apps Hub (NEXT_PUBLIC_HUB_URL) - a plain <a>, since it's outside basePath */}
            {!isEmbedded && hubUrl && (
              <SidebarIconLink
                href={hubUrl}
                nativeAnchor={true}
                icon={<HousePlug className="h-5 w-5" />}
                label="Apps Hub"
              />
            )}
            {/* Back */}
            <SidebarIconButton
              onClick={() => router.back()}
              icon={<ChevronLeft className="h-5 w-5" />}
              label="Back"
              tooltip="Back · Ctrl + ←"
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
const ICON_BUTTON_CLASSES = `rounded-full p-2 text-neutral-600 transition-colors hover:bg-neutral-200 hover:text-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 ${FOCUS_RING_CLASSES}`;

// Shows the tooltip on hover and keyboard focus, at the trigger's right-edge
// midpoint so it can be portaled out of the rail's overflow
const useRailTooltip = () => {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(
    null,
  );

  const show = (e: React.SyntheticEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({ top: rect.top + rect.height / 2, left: rect.right });
  };
  const hide = () => setCoords(null);

  return {
    coords,
    handlers: {
      onMouseEnter: show,
      onMouseLeave: hide,
      onFocus: (e: React.FocusEvent<HTMLElement>) => {
        // Keyboard focus only, not the focus a click leaves behind
        if (e.currentTarget.matches(":focus-visible")) show(e);
      },
      onBlur: hide,
    },
  };
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

// A rail entry: a page link, or a button that opens a dashboard modal
const RailItem = ({
  item,
  isActive,
  onAction,
}: {
  item: DashboardNavItem;
  isActive: boolean;
  onAction: (action: DashboardNavAction) => void;
}) => {
  const { coords, handlers } = useRailTooltip();
  const tooltip = item.shortcut
    ? `${item.label} · ${item.shortcut}`
    : item.label;

  const content = (
    <>
      <item.Icon className="h-5 w-5" />
      <span className="max-w-full truncate px-1">{item.shortLabel}</span>
    </>
  );

  return (
    <>
      {item.kind === "link" ? (
        <Link
          href={item.href}
          aria-label={item.label}
          aria-current={isActive ? "page" : undefined}
          {...handlers}
          className={railItemClass(isActive)}
        >
          {content}
        </Link>
      ) : (
        <button
          type="button"
          aria-label={item.label}
          aria-keyshortcuts={item.shortcut?.replace(/ \+ /g, "+")}
          onClick={() => onAction(item.action)}
          {...handlers}
          className={railItemClass(false)}
        >
          {content}
        </button>
      )}

      {coords && (
        <RailTooltip
          coords={coords}
          message={tooltip}
          showKeyboardIcon={!!item.shortcut}
        />
      )}
    </>
  );
};

type SidebarIconButtonProps = {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  tooltip: string;
};

// Round icon-only button with a rail tooltip showing its shortcut
const SidebarIconButton = ({
  onClick,
  icon,
  label,
  tooltip,
}: SidebarIconButtonProps) => {
  const { coords, handlers } = useRailTooltip();

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        {...handlers}
        className={ICON_BUTTON_CLASSES}
      >
        {icon}
      </button>

      {coords && (
        <RailTooltip coords={coords} message={tooltip} showKeyboardIcon />
      )}
    </>
  );
};

type SidebarIconLinkProps = {
  href: string;
  icon: React.ReactNode;
  label: string;
  // Plain <a> that bypasses basePath (e.g. the Apps Hub)
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
  const { coords, handlers } = useRailTooltip();

  const linkProps = {
    href,
    ...handlers,
    "aria-label": openInNewTab ? `${label} (opens in a new tab)` : label,
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

      {coords && <RailTooltip coords={coords} message={label} />}
    </>
  );
};

export default DashboardSidebar;
