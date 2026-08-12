"use client";

import { useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { Sparkles, RotateCw, Loader2 } from "lucide-react";
import apiClient from "@/lib/AxiosClient";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import { useAlertStore } from "@/store/useAlertStore";
import { useAnalyticsAiStore } from "@/store/useAnalyticsAiStore";
import { AnalyticsSummary } from "./types";
import { AnalyticsFilterParams } from "@/lib/analytics/buildAnalyticsIssuesFilter";

type AiInsightPanelProps = {
  summary: AnalyticsSummary | undefined;
  committedFilters: AnalyticsFilterParams | null;
};

// "Analyze with AI" for the analytics dashboard. Deliberately manual
// (mutation on click, not tied to the dashboard's TanStack Query refetch
// interval) so it never silently spends an AI call in the background --
// and it caches its last result against a fingerprint of the data it was
// generated from, so re-clicking with unchanged data is instant instead of
// calling the API again.
const AiInsightPanel = ({ summary, committedFilters }: AiInsightPanelProps) => {
  const triggerAlert = useAlertStore((state) => state.triggerAlert);
  const {
    result,
    fingerprint: cachedFingerprint,
    setResult,
  } = useAnalyticsAiStore();

  // What "the same data" means here: the active filters plus a handful of
  // top-line summary numbers. We don't fingerprint the full summary object
  // (breakdown array ordering can shift harmlessly) -- just enough to catch
  // a real change in what's being analyzed.
  const currentFingerprint = useMemo(() => {
    if (!summary) return null;
    return JSON.stringify({
      committedFilters,
      totalFiltered: summary.totalFiltered,
      reopenedCount: summary.reopenedCount,
      escalatedCount: summary.escalatedCount,
    });
  }, [committedFilters, summary]);

  const isStale = result !== null && currentFingerprint !== cachedFingerprint;

  const { mutate: analyze, isPending } = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post("/ai/analyze-summary", {
        summary,
        filters: committedFilters,
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (currentFingerprint) setResult(currentFingerprint, data);
    },
    onError: (error) => triggerAlert("error", getApiErrorMessage(error)),
  });

  if (!summary) return null;

  const buttonLabel = isPending
    ? "Analyzing..."
    : result
      ? "Regenerate insights"
      : "Summary Analysis";

  return (
    <div className="flex flex-col gap-3">
      {(!result || isStale) && (
        <button
          type="button"
          onClick={() => analyze()}
          disabled={isPending}
          className="inline-flex w-fit items-center gap-1.5 rounded-xl bg-neutral-900 px-3 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {buttonLabel}
        </button>
      )}

      {result && (
        <div className="relative overflow-hidden rounded-xl border border-violet-200 bg-violet-50/50 p-4 dark:border-violet-900/40 dark:bg-violet-900/10">
          <div className="flex items-start justify-between gap-3">
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600 dark:bg-violet-800 dark:text-violet-200">
                <Sparkles size={16} />
              </div>
              <h4 className="text-sm font-semibold text-violet-900 dark:text-violet-100">
                {result.headline}
              </h4>
            </div>

            {!isStale && (
              <button
                type="button"
                onClick={() => analyze()}
                disabled={isPending}
                title="Regenerate"
                className="shrink-0 rounded-lg p-1.5 text-violet-600 hover:bg-violet-100 disabled:opacity-50 dark:text-violet-300 dark:hover:bg-violet-900/30"
              >
                <RotateCw
                  className={`h-3.5 w-3.5 ${isPending ? "animate-spin" : ""}`}
                />
              </button>
            )}
          </div>

          {isStale && (
            <p className="mt-2 text-xs font-medium text-amber-600 dark:text-amber-400">
              Data has changed since this was generated — click &quot;Regenerate
              insights&quot; above for a fresh analysis.
            </p>
          )}

          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold tracking-wide text-violet-700 uppercase dark:text-violet-300">
                Insights
              </p>
              <ul className="mt-1.5 list-inside list-disc space-y-1 text-xs text-violet-800 dark:text-violet-200">
                {result.insights.map((insight, index) => (
                  <li key={index}>{insight}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wide text-violet-700 uppercase dark:text-violet-300">
                Recommendations
              </p>
              <ul className="mt-1.5 list-inside list-disc space-y-1 text-xs text-violet-800 dark:text-violet-200">
                {result.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiInsightPanel;
