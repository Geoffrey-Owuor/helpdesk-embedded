"use client";
import {
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  ReactNode,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Check, LucideIcon } from "lucide-react";

export type ActionMenuItem = {
  key: string;
  label: string;
  icon?: LucideIcon;
  onSelect: () => void;
  disabled?: boolean;
  // Shows a tick - used to mark the current value in a picker
  checked?: boolean;
  tone?: "danger";
  // Draws a line above the item, to separate groups of actions
  dividerBefore?: boolean;
};

const GAP = 8;
const EDGE = 8;

// A button that opens a list of items - used for the issue header's status
// and priority pickers, its "more actions" menus and the issue list's actions.
// Portaled to <body> with fixed positioning, so a scrolling table can't clip
// it, and it opens upwards when it doesn't fit below the button. Follows the
// WAI-ARIA menu button pattern: focus moves into the menu on open, arrow
// keys/Home/End move between items, Escape returns focus to the button.
export const ActionMenu = ({
  trigger,
  triggerClassName,
  ariaLabel,
  heading,
  items,
  align = "left",
}: {
  trigger: ReactNode;
  triggerClassName: (isOpen: boolean) => string;
  ariaLabel: string;
  heading?: string;
  items: ActionMenuItem[];
  align?: "left" | "right";
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  // Place the menu beside the button before it paints, then focus its first item
  useLayoutEffect(() => {
    const button = buttonRef.current?.getBoundingClientRect();
    const menu = menuRef.current;
    if (!isOpen || !button || !menu) return;

    const { offsetWidth: width, offsetHeight: height } = menu;
    const fitsBelow =
      button.bottom + GAP + height <= window.innerHeight - EDGE;
    const fitsAbove = button.top - GAP - height >= EDGE;
    const top =
      fitsBelow || !fitsAbove
        ? Math.min(button.bottom + GAP, window.innerHeight - height - EDGE)
        : button.top - GAP - height;
    const left = align === "right" ? button.right - width : button.left;

    menu.style.top = `${Math.max(EDGE, top)}px`;
    menu.style.left = `${Math.max(
      EDGE,
      Math.min(left, window.innerWidth - width - EDGE),
    )}px`;

    menu
      .querySelector<HTMLElement>('[role="menuitem"]:not([disabled])')
      ?.focus({ preventScroll: true });
  }, [isOpen, align]);

  // Close when pressing outside, on Escape, or when the page moves under it
  useEffect(() => {
    if (!isOpen) return;

    const close = () => setIsOpen(false);
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        !menuRef.current?.contains(target) &&
        !buttonRef.current?.contains(target)
      ) {
        close();
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        buttonRef.current?.focus();
      }
    };
    const handleScroll = (event: Event) => {
      // A long menu scrolling its own items isn't the page moving
      if (!menuRef.current?.contains(event.target as Node)) close();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", close);
    };
  }, [isOpen]);

  const handleSelect = (item: ActionMenuItem) => {
    setIsOpen(false);
    // Back on the button first, so a modal this opens restores focus to it
    buttonRef.current?.focus();
    item.onSelect();
  };

  const handleMenuKeyDown = (event: ReactKeyboardEvent) => {
    const entries = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>(
        '[role="menuitem"]:not([disabled])',
      ) ?? [],
    );
    const current = entries.indexOf(document.activeElement as HTMLElement);
    const focusAt = (index: number) =>
      entries[(index + entries.length) % entries.length]?.focus();

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        focusAt(current + 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        focusAt(current - 1);
        break;
      case "Home":
        event.preventDefault();
        focusAt(0);
        break;
      case "End":
        event.preventDefault();
        focusAt(entries.length - 1);
        break;
      case "Tab":
        // The menu sits at the end of <body>: carry on from the button instead
        setIsOpen(false);
        buttonRef.current?.focus();
        break;
    }
  };

  const handleButtonKeyDown = (event: ReactKeyboardEvent) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setIsOpen(true);
    }
  };

  // Clicks bubble through portals too, and a menu may sit in a clickable row
  const stopPropagation = (event: ReactMouseEvent) => event.stopPropagation();

  return (
    <div className="w-fit">
      <button
        ref={buttonRef}
        type="button"
        aria-label={ariaLabel}
        title={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        onClick={(event) => {
          event.stopPropagation();
          setIsOpen(!isOpen);
        }}
        onKeyDown={handleButtonKeyDown}
        className={triggerClassName(isOpen)}
      >
        {trigger}
      </button>

      {/* Only ever open after a click, so document.body exists; a direct
          portal (not ClientPortal) mounts in time for the position effect */}
      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            aria-label={ariaLabel}
            onClick={stopPropagation}
            onKeyDown={handleMenuKeyDown}
            className="small-scrollbar fixed top-0 left-0 z-90 max-h-80 min-w-48 overflow-y-auto rounded-xl border border-neutral-300 bg-white p-1 shadow-xl shadow-neutral-200/50 dark:border-neutral-700 dark:bg-neutral-950 dark:shadow-none"
          >
            {heading && (
              <div className="px-2 py-2 text-xs font-semibold text-neutral-500 uppercase">
                {heading}
              </div>
            )}
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.key}>
                  {item.dividerBefore && (
                    <div
                      role="separator"
                      className="mx-2 my-1 h-px bg-neutral-200 dark:bg-neutral-800"
                    />
                  )}
                  <button
                    type="button"
                    role="menuitem"
                    tabIndex={-1}
                    onClick={() => handleSelect(item)}
                    disabled={item.disabled}
                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm whitespace-nowrap outline-none hover:bg-neutral-100 focus-visible:bg-neutral-100 disabled:opacity-50 dark:hover:bg-neutral-900 dark:focus-visible:bg-neutral-900 ${
                      item.tone === "danger"
                        ? "text-red-700 dark:text-red-400"
                        : "text-neutral-700 dark:text-neutral-300"
                    }`}
                  >
                    {Icon && <Icon className="h-4 w-4 shrink-0" />}
                    <span className="flex-1">{item.label}</span>
                    {item.checked && (
                      <Check className="h-4 w-4 text-blue-600" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>,
          document.body,
        )}
    </div>
  );
};
