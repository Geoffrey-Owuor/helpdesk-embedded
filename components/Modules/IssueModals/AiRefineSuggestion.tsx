"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Sparkles, Check, X, Loader2, WandSparkles } from "lucide-react";
import { useAlertStore } from "@/store/useAlertStore";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";

type RefineResult = {
  title: string;
  description: string;
};

type AiRefineSuggestionProps = {
  title: string;
  description: string;
  // The parent modal supplies how the refine call is actually made (an
  // authenticated API route for the Main Issue Modal, an unauthenticated
  // server action for Quick Create) -- this component only cares about the
  // resulting { title, description }, and expects onRefine to throw on
  // failure so the same catch/alert handling works for both transports.
  onRefine: () => Promise<RefineResult>;
  onApply: (title: string, description: string) => void;
};

// Shared "Refine with AI" UI for both issue submission modals (Main Issue
// Modal and Quick Create), which SKILLS.md notes are functionally almost
// identical -- keeping this in one component avoids building the
// button/suggestion-card UI twice.
const AiRefineSuggestion = ({
  title,
  description,
  onRefine,
  onApply,
}: AiRefineSuggestionProps) => {
  const triggerAlert = useAlertStore((state) => state.triggerAlert);
  const [suggestion, setSuggestion] = useState<RefineResult | null>(null);

  // useMutation (not useQuery) because this is a one-off, user-triggered,
  // non-idempotent action that costs an API call -- we want an explicit
  // isPending/onSuccess/onError lifecycle, not TanStack Query's caching or
  // background-refetch behavior.
  const { mutate: runRefine, isPending } = useMutation({
    mutationFn: onRefine,
    onSuccess: (result) => setSuggestion(result),
    onError: (error) => triggerAlert("error", getApiErrorMessage(error)),
  });

  const canRefine = title.trim().length > 0 && description.trim().length > 0;

  // Nothing to show until both fields have content, unless we're already
  // displaying a previous suggestion.
  if (!canRefine && !suggestion) return null;

  return (
    <div className="flex flex-col gap-2">
      {!suggestion && (
        <button
          type="button"
          onClick={() => runRefine()}
          disabled={isPending}
          className="inline-flex w-fit items-center gap-1.5 rounded-xl border bg-neutral-900 px-3 py-2 text-xs font-semibold text-white hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
          {isPending ? "Refining..." : "Refine with AI"}
        </button>
      )}

      {suggestion && (
        <div className="relative overflow-hidden rounded-xl border border-violet-200 bg-violet-50/50 p-3 dark:border-violet-900/40 dark:bg-violet-900/10">
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-600 dark:bg-violet-800 dark:text-violet-200">
              <WandSparkles size={16} />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold text-violet-900 dark:text-violet-100">
                AI Suggestion
              </h4>
              <div className="mt-1.5 flex flex-col gap-1.5 text-xs text-violet-800 dark:text-violet-200">
                <p>
                  <span className="font-semibold">Title: </span>
                  {suggestion.title}
                </p>
                <p>
                  <span className="font-semibold">Description: </span>
                  {suggestion.description}
                </p>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onApply(suggestion.title, suggestion.description);
                    setSuggestion(null);
                  }}
                  className="inline-flex items-center gap-1 rounded-full bg-violet-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-violet-700"
                >
                  <Check size={12} />
                  Use this
                </button>
                <button
                  type="button"
                  onClick={() => setSuggestion(null)}
                  className="inline-flex items-center gap-1 rounded-full border border-violet-300 px-2.5 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-100 dark:border-violet-800 dark:text-violet-300 dark:hover:bg-violet-900/20"
                >
                  <X size={12} />
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiRefineSuggestion;
