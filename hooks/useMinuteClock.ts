"use client";
import { useSyncExternalStore } from "react";

const MINUTE = 60_000;

// One shared clock for every relative-time label on the page: a single timer
// that fires just after each minute boundary (so all labels change together)
// instead of an interval per badge. Background tabs throttle timers, so the
// clock also catches up as soon as the tab is visible again.
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setTimeout> | undefined;

const notify = () => listeners.forEach((listener) => listener());

const scheduleNextTick = () => {
  timer = setTimeout(
    () => {
      notify();
      scheduleNextTick();
    },
    MINUTE - (Date.now() % MINUTE) + 50,
  );
};

const handleVisibilityChange = () => {
  if (document.visibilityState === "visible") notify();
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  if (listeners.size === 1) {
    scheduleNextTick();
    document.addEventListener("visibilitychange", handleVisibilityChange);
  }

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    }
  };
};

// The current time floored to the minute - stable within a minute, so React
// only re-renders subscribers when the minute actually changes
const getSnapshot = () => Math.floor(Date.now() / MINUTE) * MINUTE;

// No clock on the server - callers render a placeholder until hydration
const getServerSnapshot = () => null;

// The current time (to the minute) that updates every minute, or null while
// server rendering/hydrating
export const useMinuteClock = () =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
