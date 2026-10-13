import { create } from "zustand";

// pending: navigation started, line still hidden in case the route arrives quickly
// visible: line is showing and creeping forward
// finishing: route arrived, line fills to 100% and fades out
type LoadingLinePhase = "idle" | "pending" | "visible" | "finishing";

// Defining types
interface LoadingLineState {
  phase: LoadingLinePhase;

  // Called for every route change (see instrumentation-client.ts) and before full page loads
  startLoadingLine: () => void;
  // Called once the new URL has rendered
  finishLoadingLine: () => void;
}

// Only show the line for routes that take longer than this to arrive
const SHOW_DELAY_MS = 150;
// Clear the line if a navigation never completes (failed, cancelled or redirected back to the same URL)
const SAFETY_TIMEOUT_MS = 15000;
// Matches the fill + fade transition in LoadingLine.tsx
const FINISH_DURATION_MS = 400;

let showTimer: ReturnType<typeof setTimeout> | undefined;
let safetyTimer: ReturnType<typeof setTimeout> | undefined;
let hideTimer: ReturnType<typeof setTimeout> | undefined;

const clearTimers = () => {
  clearTimeout(showTimer);
  clearTimeout(safetyTimer);
  clearTimeout(hideTimer);
};

// Creating the store
export const useLoadingStore = create<LoadingLineState>()((set, get) => ({
  // Initial state
  phase: "idle",

  // Actions
  startLoadingLine: () => {
    clearTimers();
    safetyTimer = setTimeout(
      () => get().finishLoadingLine(),
      SAFETY_TIMEOUT_MS,
    );

    // A new navigation (or a redirect) while the line is on screen carries on from where the bar is
    const { phase } = get();
    if (phase === "visible" || phase === "finishing") {
      set({ phase: "visible" });
      return;
    }

    set({ phase: "pending" });
    showTimer = setTimeout(() => set({ phase: "visible" }), SHOW_DELAY_MS);
  },

  finishLoadingLine: () => {
    const { phase } = get();
    if (phase === "idle" || phase === "finishing") return;

    clearTimers();

    // The route arrived before the line appeared, so there is nothing to animate
    if (phase === "pending") {
      set({ phase: "idle" });
      return;
    }

    set({ phase: "finishing" });
    hideTimer = setTimeout(() => set({ phase: "idle" }), FINISH_DURATION_MS);
  },
}));
