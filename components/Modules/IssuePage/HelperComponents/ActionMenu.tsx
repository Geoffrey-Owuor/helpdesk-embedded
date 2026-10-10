"use client";
import { ReactNode, useEffect, useRef, useState } from "react";
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
};

// A button that opens a list of items - used for the issue header's status
// and priority pickers and its "more actions" menus.
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
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the menu when clicking outside it or pressing Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleSelect = (item: ActionMenuItem) => {
    setIsOpen(false);
    item.onSelect();
  };

  return (
    <div className="relative w-fit" ref={menuRef}>
      <button
        type="button"
        aria-label={ariaLabel}
        title={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className={triggerClassName(isOpen)}
      >
        {trigger}
      </button>

      {isOpen && (
        <div
          role="menu"
          className={`default-scrollbar absolute top-full z-20 mt-2 max-h-80 min-w-48 overflow-y-auto rounded-xl border border-neutral-300 bg-white p-1 shadow-xl shadow-neutral-200/50 dark:border-neutral-700 dark:bg-neutral-950 dark:shadow-none ${
            align === "right" ? "right-0 origin-top-right" : "left-0 origin-top-left"
          }`}
        >
          {heading && (
            <div className="px-2 py-2 text-xs font-semibold text-neutral-500 uppercase">
              {heading}
            </div>
          )}
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                type="button"
                role="menuitem"
                onClick={() => handleSelect(item)}
                disabled={item.disabled}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-neutral-100 disabled:opacity-50 dark:hover:bg-neutral-900 ${
                  item.tone === "danger"
                    ? "text-red-700 dark:text-red-400"
                    : "text-neutral-700 dark:text-neutral-300"
                }`}
              >
                {Icon && <Icon className="h-4 w-4 shrink-0" />}
                <span className="flex-1">{item.label}</span>
                {item.checked && <Check className="h-4 w-4 text-blue-600" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
