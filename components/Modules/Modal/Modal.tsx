"use client";

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import ClientPortal from "../ClientPortal";
import { useFocusTrapping } from "@/hooks/useFocusTrapping";

// Shared modal shell. Below the sm breakpoint:
//   - "sheet"  (forms, long content) fills the screen, header/footer pinned
//   - "dialog" (short prompts) docks to the bottom as a sheet in thumb reach
// From sm up both are a centred card capped at `size`.

type ModalSize = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";

const SIZES: Record<ModalSize, string> = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-xl",
  "2xl": "sm:max-w-2xl",
  "3xl": "sm:max-w-3xl",
  "4xl": "sm:max-w-4xl",
};

// Matches the longest exit animation in globals.css (.modal-panel[data-closing])
const EXIT_DURATION_MS = 200;

const cx = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(" ");

type ModalContextValue = {
  titleId: string;
  onClose: () => void;
};

const ModalContext = createContext<ModalContextValue | null>(null);

const useModalContext = () => {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("Modal parts must be rendered inside <Modal>");
  return ctx;
};

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  variant?: "sheet" | "dialog";
  size?: ModalSize;
  // Close on backdrop tap. Leave off for forms so a stray tap can't discard input.
  dismissible?: boolean;
  // Background of the panel: "muted" (neutral-50) or "default" (white)
  tone?: "default" | "muted";
  // Fixed height from sm up (e.g. tabbed panels that shouldn't jump between tabs)
  fixedHeight?: boolean;
  className?: string;
};

export const Modal = ({
  open,
  onClose,
  children,
  variant = "sheet",
  size = "lg",
  dismissible = false,
  tone = "default",
  fixedHeight = false,
  className,
}: ModalProps) => {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const pressedBackdrop = useRef(false);
  const titleId = useId();

  // Stay mounted for the exit animation after `open` turns false
  const [present, setPresent] = useState(open);
  if (open && !present) setPresent(true);
  const closing = present && !open;

  useEffect(() => {
    if (!closing) return;
    const timer = setTimeout(() => setPresent(false), EXIT_DURATION_MS);
    return () => clearTimeout(timer);
  }, [closing]);

  useFocusTrapping(panelRef, open, onClose);

  if (!present) return null;

  return (
    <ClientPortal>
      <ModalContext.Provider value={{ titleId, onClose }}>
        <div
          data-closing={closing || undefined}
          className="modal-backdrop fixed inset-0 z-100 flex items-end justify-center bg-black/60 sm:items-center sm:p-4 dark:bg-black/80"
          onPointerDown={(e) => {
            pressedBackdrop.current = e.target === e.currentTarget;
          }}
          onClick={(e) => {
            // Only when both press and release land on the backdrop, so a text
            // selection dragged out of the panel doesn't close it
            if (
              dismissible &&
              !closing &&
              pressedBackdrop.current &&
              e.target === e.currentTarget
            ) {
              onClose();
            }
            pressedBackdrop.current = false;
          }}
        >
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            data-closing={closing || undefined}
            data-variant={variant}
            className={cx(
              "modal-panel relative flex w-full flex-col overflow-hidden border-neutral-200 shadow-2xl dark:border-neutral-800",
              tone === "muted"
                ? "bg-neutral-50 dark:bg-neutral-950"
                : "bg-white dark:bg-neutral-950",
              variant === "sheet"
                ? cx(
                    "h-dvh pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] sm:rounded-2xl sm:border sm:pt-0 sm:pb-0",
                    fixedHeight ? "sm:h-[90dvh]" : "sm:h-auto sm:max-h-[90dvh]",
                  )
                : "max-h-[90dvh] rounded-t-2xl border-t pb-[env(safe-area-inset-bottom)] sm:rounded-2xl sm:border sm:pb-0",
              SIZES[size],
              className,
            )}
          >
            {children}
          </div>
        </div>
      </ModalContext.Provider>
    </ClientPortal>
  );
};

type ModalHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  // Extra controls rendered before the close button (e.g. a refresh button)
  actions?: ReactNode;
  hideClose?: boolean;
  bordered?: boolean;
  className?: string;
};

export const ModalHeader = ({
  title,
  description,
  icon,
  actions,
  hideClose = false,
  bordered = true,
  className,
}: ModalHeaderProps) => {
  const { titleId, onClose } = useModalContext();

  return (
    <div
      className={cx(
        "flex shrink-0 items-center justify-between gap-3 py-2 pr-2 pl-4 sm:py-3 sm:pr-4 sm:pl-6",
        bordered && "border-b border-neutral-200 dark:border-neutral-800",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-3 py-1">
        {icon}
        <div className="min-w-0">
          <h2
            id={titleId}
            className="text-lg font-semibold text-neutral-900 dark:text-neutral-100"
          >
            {title}
          </h2>
          {description && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {actions}
        {!hideClose && (
          <ModalIconButton label="Close" icon={X} onClick={onClose} />
        )}
      </div>
    </div>
  );
};

// For custom layouts that skip ModalHeader: still labels the dialog
export const ModalTitle = ({
  className,
  ...props
}: ComponentPropsWithoutRef<"h2">) => {
  const { titleId } = useModalContext();
  return <h2 id={titleId} className={className} {...props} />;
};

// Round icon button sized for touch (44px on phones, 36px from sm up)
export const ModalIconButton = ({
  label,
  icon: Icon,
  className,
  ...props
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
} & Omit<ComponentPropsWithoutRef<"button">, "children">) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    className={cx(
      "inline-flex size-11 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 sm:size-9 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100",
      className,
    )}
    {...props}
  >
    <Icon className="h-5 w-5" />
  </button>
);

export const ModalBody = ({
  className,
  padded = true,
  ...props
}: ComponentPropsWithoutRef<"div"> & { padded?: boolean }) => (
  <div
    className={cx(
      "layout-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain",
      padded && "px-4 py-4 sm:px-6 sm:py-5",
      className,
    )}
    {...props}
  />
);

// Buttons stretch to equal widths on phones for easier tapping; pass
// stretch={false} for footers that mix links/text with a button
export const ModalFooter = ({
  className,
  bordered = true,
  stretch = true,
  ...props
}: ComponentPropsWithoutRef<"div"> & {
  bordered?: boolean;
  stretch?: boolean;
}) => (
  <div
    className={cx(
      "flex shrink-0 items-center justify-end gap-2 px-4 py-3 sm:px-6",
      stretch && "*:flex-1 *:justify-center sm:*:flex-none",
      bordered && "border-t border-neutral-200 dark:border-neutral-800",
      className,
    )}
    {...props}
  />
);

// A form that spans body + footer while keeping the body scrollable
export const ModalForm = ({
  className,
  ...props
}: ComponentPropsWithoutRef<"form">) => (
  <form className={cx("flex min-h-0 flex-1 flex-col", className)} {...props} />
);
