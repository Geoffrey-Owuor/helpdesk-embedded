"use client";

import { useEffect, useId, useRef, RefObject } from "react";
import { isTopModal, useModalStackStore } from "@/store/useModalStackStore";

const FOCUSABLE_SELECTOR =
  "a[href], area[href], input, select, textarea, button, iframe, [tabindex], [contenteditable], summary";

export const useFocusTrapping = (
  modalRef: RefObject<HTMLElement | null>,
  modalOpen: boolean,
  closeModal: () => void,
): void => {
  const id = useId();

  // Callers often pass an inline arrow; keep the latest in a ref so a re-render
  // doesn't re-run the effect below (which would steal focus on every keystroke)
  const closeRef = useRef(closeModal);
  useEffect(() => {
    closeRef.current = closeModal;
  }, [closeModal]);

  useEffect(() => {
    if (!modalOpen) return;

    const { push, remove } = useModalStackStore.getState();
    push(id);

    const previousFocus = document.activeElement as HTMLElement | null;

    // Filter out elements that the browser will actually skip
    const getFocusableElements = (
      element: Element | null | undefined = modalRef.current,
    ): HTMLElement[] => {
      if (!element) return [];

      return Array.from(
        element.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((el) => {
        const isRemoved =
          el.hasAttribute("disabled") ||
          el.getAttribute("aria-hidden") === "true";
        const isHidden = el.offsetWidth === 0 && el.offsetHeight === 0;
        const isTabIdxMinusOne = el.getAttribute("tabindex") === "-1";

        return !isRemoved && !isHidden && !isTabIdxMinusOne;
      });
    };

    // Portal content mounts a tick after open, so retry for a few frames
    let frame = 0;
    let attempts = 0;
    const focusFirst = () => {
      const first = getFocusableElements()[0];
      if (first) first.focus();
      else if (attempts++ < 10) frame = requestAnimationFrame(focusFirst);
    };
    const timer = setTimeout(focusFirst, 0);

    const handleKeyDown = (e: KeyboardEvent) => {
      // A modal opened on top of this one owns the keyboard
      if (!isTopModal(id)) return;

      if (e.key === "Escape") {
        closeRef.current();
        return;
      }

      if (e.key === "Tab") {
        // Re-calculate focusable elements on every TAB
        // to account for dynamic changes (like buttons becoming disabled)
        const currentFocusable = getFocusableElements();
        if (currentFocusable.length === 0) return;

        // Visible alerts (AlertLayer) sit outside the modal but stay reachable:
        // the cycle runs through the modal, then the alerts, then back around
        const alertLayer = document.querySelector("[data-alert-layer]");
        const alertFocusable = getFocusableElements(alertLayer);
        const active = document.activeElement;

        const firstElement = currentFocusable[0];
        const lastElement = currentFocusable[currentFocusable.length - 1];
        const firstAlert = alertFocusable[0];
        const lastAlert = alertFocusable[alertFocusable.length - 1];
        const focusInModal = modalRef.current?.contains(active);
        const focusInAlerts = alertLayer?.contains(active);

        // Inside the modal or between alerts the browser's own order applies
        let target: HTMLElement | undefined;
        if (e.shiftKey) {
          if (active === firstAlert) target = lastElement;
          else if (active === firstElement || (!focusInModal && !focusInAlerts))
            target = lastAlert ?? lastElement;
        } else {
          if (active === lastElement) target = firstAlert ?? firstElement;
          else if (active === lastAlert || (!focusInModal && !focusInAlerts))
            target = firstElement;
        }

        if (target) {
          e.preventDefault();
          target.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", handleKeyDown);
      remove(id);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [modalOpen, modalRef, id]);
};
