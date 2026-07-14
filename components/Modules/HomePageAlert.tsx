"use client";

import { X, BookOpen, ArrowRight } from "lucide-react";
import { useEffect, useCallback, useState, useRef } from "react";
import Link from "next/link";
import { useLoadingStore } from "@/store/useLoadingStore";
import { usePathname } from "next/navigation";

interface HomePageAlertProps {
  isOpen: boolean;
  onClose: () => void;
}

const HomePageAlert = ({ isOpen, onClose }: HomePageAlertProps) => {
  const setLoadingLine = useLoadingStore((state) => state.setLoadingLine);
  const pathname = usePathname();
  const [isClosing, setIsClosing] = useState(false);

  // Keep a mutable ref of the open state to access inside the cleanup function
  const isOpenRef = useRef(isOpen);

  // Sync the ref whenever isOpen changes
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false); // reset isClosing after it animates out
    }, 200); // Matches the CSS animation duration
  }, [onClose]);

  // Auto close after 15 seconds
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOpen) {
      timer = setTimeout(handleClose, 15000);
    }
    return () => {
      clearTimeout(timer);
      // If the component unmounts while it is still supposed to be open,
      // force the parent state to close so it doesn't linger on return.
      if (isOpenRef.current) {
        onClose();
      }
    };
  }, [isOpen, handleClose, onClose]);

  // Don't render anything if there's no alert and we aren't currently animating out
  if (!isOpen && !isClosing) return null;

  return (
    // Container: Floating bottom left with responsive widths
    <div
      className={`fixed right-4 bottom-4 left-4 z-9999 transition-all duration-200 sm:right-auto sm:bottom-6 sm:left-6 sm:w-auto sm:max-w-sm sm:min-w-85 ${
        isClosing
          ? "animate-slideDown opacity-0"
          : "animate-slideUp opacity-100"
      }`}
    >
      {/* Neutral Themed Card  */}
      <div className="relative flex items-start gap-3 overflow-hidden rounded-2xl bg-neutral-950 p-4 dark:bg-white">
        {/* Left Accent Line (Blue for Info/Guidance) */}
        <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-blue-600 dark:bg-blue-500" />

        {/* Icon Avatar */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-900/30 dark:bg-blue-50">
          <BookOpen className="h-5 w-5 text-blue-400 dark:text-blue-600" />
        </div>

        {/* Content Area */}
        <div className="flex flex-1 flex-col pt-0.5">
          {/* Title */}
          <h3 className="text-sm font-semibold tracking-tight text-white dark:text-neutral-900">
            Not sure where to start?
          </h3>

          {/* Message */}
          <p className="mt-1 text-[13px] leading-relaxed text-neutral-400 dark:text-neutral-600">
            Check out our comprehensive user manual to understand how to log
            issues, track progress, and navigate HelpDesk.
          </p>

          {/* CTA Link */}

          <Link
            href="/manual"
            onClick={() => {
              // Showing the loading line logic
              if (pathname === "/manual") return;

              setLoadingLine(true);
              handleClose();
            }} // Closes the alert when the user clicks the link
            className="group mt-3 inline-flex w-fit items-center gap-1.5 text-[13px] font-semibold text-blue-400 transition-colors hover:text-blue-300 dark:text-blue-600 dark:hover:text-blue-700"
          >
            Read the Manual
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="shrink-0 rounded-full p-1.5 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white active:scale-95 dark:hover:bg-neutral-100 dark:hover:text-neutral-900"
          aria-label="Close alert"
        >
          <X className="h-4 w-4" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

export default HomePageAlert;
