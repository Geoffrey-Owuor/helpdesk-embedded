"use client";

import { useEffect, RefObject } from "react";

export const useFocusTrapping = (
  modalRef: RefObject<HTMLElement | null>,
  modalOpen: boolean,
  closeModal: () => void,
): void => {
  useEffect(() => {
    if (!modalOpen) return;

    const timer = setTimeout(() => {
      const element = modalRef.current;
      if (!element) return;

      const previousFocus = document.activeElement as HTMLElement | null;

      const getFocusableElements = (): HTMLElement[] => {
        const selector =
          "a[href], area[href], input, select, textarea, button, iframe, [tabindex], [contenteditable], summary";

        const elements = Array.from(
          element.querySelectorAll<HTMLElement>(selector),
        );

        // Filter out elements that the browser will actually skip
        return elements.filter((el) => {
          const isRemoved =
            el.hasAttribute("disabled") ||
            el.getAttribute("aria-hidden") === "true";
          const isHidden = el.offsetWidth === 0 && el.offsetHeight === 0; // Check if visible
          const isTabIdxMinusOne = el.getAttribute("tabindex") === "-1";

          return !isRemoved && !isHidden && !isTabIdxMinusOne;
        });
      };

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      focusableElements[0].focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          closeModal();
          return;
        }

        if (e.key === "Tab") {
          // Re-calculate focusable elements on every TAB
          // to account for dynamic changes (like buttons becoming disabled)
          const currentFocusable = getFocusableElements();
          const firstElement = currentFocusable[0];
          const lastElement = currentFocusable[currentFocusable.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      };

      document.addEventListener("keydown", handleKeyDown);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        if (previousFocus?.focus) previousFocus.focus();
      };
    }, 0);

    return () => clearTimeout(timer);
  }, [modalOpen, closeModal, modalRef]);
};
