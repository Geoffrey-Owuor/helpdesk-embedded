"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { Ellipsis } from "lucide-react";
import { createPortal } from "react-dom";
import {
  DashboardNavAction,
  DashboardNavItem,
  isNavItemActive,
} from "@/lib/dashboardNav";

// The desktop rail's overflow: the items that don't fit the window height,
// in a popover beside the rail. Portaled to <body>: the fixed rail is its own
// stacking context, so the content panel would paint over it. Follows the WAI-ARIA menu button pattern:
// focus moves into the menu on open, arrow keys/Home/End move between items,
// Escape returns focus to the button, Tab closes it.
const GAP = 12;
const EDGE = 8;

const SidebarMoreMenu = ({
  items,
  pathname,
  onAction,
  buttonClassName,
}: {
  items: DashboardNavItem[];
  pathname: string;
  onAction: (action: DashboardNavAction) => void;
  // The rail item's classes, highlighted while open or holding the current page
  buttonClassName: (highlighted: boolean) => string;
}) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const menuId = useId();

  const activeIndex = items.findIndex((item) =>
    isNavItemActive(item, pathname),
  );
  const hasActive = activeIndex !== -1;

  // Close on navigation (including one started from the menu itself)
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  // Fixed beside the button, so the rail's overflow clip can't cut it off,
  // and kept inside the viewport
  useLayoutEffect(() => {
    if (!open || !buttonRef.current || !menuRef.current) return;
    const button = buttonRef.current.getBoundingClientRect();
    const menuHeight = menuRef.current.offsetHeight;
    const top = Math.min(
      Math.max(EDGE, button.bottom - menuHeight),
      window.innerHeight - menuHeight - EDGE,
    );
    setPosition({ top, left: button.right + GAP });
    itemRefs.current[Math.max(activeIndex, 0)]?.focus();
  }, [open, activeIndex]);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (
        !menuRef.current?.contains(target) &&
        !buttonRef.current?.contains(target)
      ) {
        setOpen(false);
      }
    };
    const close = () => setOpen(false);
    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  const handleMenuKeyDown = (e: React.KeyboardEvent) => {
    const entries = itemRefs.current.filter(Boolean) as HTMLElement[];
    const current = entries.indexOf(document.activeElement as HTMLElement);
    const focusAt = (index: number) =>
      entries[(index + entries.length) % entries.length]?.focus();

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        focusAt(current + 1);
        break;
      case "ArrowUp":
        e.preventDefault();
        focusAt(current - 1);
        break;
      case "Home":
        e.preventDefault();
        focusAt(0);
        break;
      case "End":
        e.preventDefault();
        focusAt(entries.length - 1);
        break;
      case "Escape":
        e.preventDefault();
        // Don't let a dashboard modal's Escape handler see it too
        e.stopPropagation();
        setOpen(false);
        buttonRef.current?.focus();
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  };

  const handleButtonKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
    }
  };

  const itemClassName = (isActive: boolean) =>
    `flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-white ${
      isActive
        ? "bg-neutral-900 text-white dark:bg-white dark:text-black"
        : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 focus-visible:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white dark:focus-visible:bg-neutral-800"
    }`;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={
          hasActive ? `More (current: ${items[activeIndex].label})` : "More"
        }
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={handleButtonKeyDown}
        className={buttonClassName(hasActive || open)}
      >
        <Ellipsis className="h-5 w-5" />
        <span>More</span>
      </button>

      {/* Only ever open after a click, so document.body exists; a direct
          portal (not ClientPortal) mounts in time for the position effect */}
      {open &&
        createPortal(
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            aria-label="More pages"
            onKeyDown={handleMenuKeyDown}
            style={{ top: position.top, left: position.left }}
            className="fixed z-9998 w-60 rounded-2xl border border-neutral-200 bg-white p-1.5 shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
          >
            <p
              aria-hidden="true"
              className="px-3 pt-1.5 pb-1 text-[10px] font-bold tracking-[0.14em] text-neutral-500 uppercase"
            >
              More
            </p>
            {items.map((item, index) => {
              const isActive = index === activeIndex;
              const setRef = (el: HTMLElement | null) => {
                itemRefs.current[index] = el;
              };
              const content = (
                <>
                  <item.Icon className="h-4.5 w-4.5 shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  {item.shortcut && (
                    <kbd className="font-sans text-[11px] font-medium opacity-60">
                      {item.shortcut}
                    </kbd>
                  )}
                </>
              );

              if (item.kind === "link") {
                return (
                  <Link
                    key={item.key}
                    ref={setRef}
                    href={item.href}
                    role="menuitem"
                    tabIndex={-1}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => setOpen(false)}
                    className={itemClassName(isActive)}
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <button
                  key={item.key}
                  ref={setRef}
                  type="button"
                  role="menuitem"
                  tabIndex={-1}
                  onClick={() => {
                    setOpen(false);
                    onAction(item.action);
                  }}
                  className={itemClassName(false)}
                >
                  {content}
                </button>
              );
            })}
          </div>,
          document.body,
        )}
    </>
  );
};

export default SidebarMoreMenu;
