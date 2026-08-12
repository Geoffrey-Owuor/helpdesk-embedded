import { create } from "zustand";
import { AnalyticsInsightResult } from "@/lib/ai/Schemas";

interface AnalyticsAiState {
  // States
  result: AnalyticsInsightResult | null;
  // A fingerprint of the filters + summary data the current `result` was
  // generated from. AiInsightPanel compares this against a freshly computed
  // fingerprint of the current data to decide whether the cached result is
  // still valid, or whether to prompt the user to regenerate instead of
  // silently calling the AI again on every background refetch.
  fingerprint: string | null;
  generatedAt: string | null;

  // Actions
  setResult: (fingerprint: string, result: AnalyticsInsightResult) => void;
  clear: () => void;
}

export const useAnalyticsAiStore = create<AnalyticsAiState>()((set) => ({
  result: null,
  fingerprint: null,
  generatedAt: null,

  setResult: (fingerprint, result) =>
    set({
      result,
      fingerprint,
      generatedAt: new Date().toISOString(),
    }),

  clear: () =>
    set({
      result: null,
      fingerprint: null,
      generatedAt: null,
    }),
}));
