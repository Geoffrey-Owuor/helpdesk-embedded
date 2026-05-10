"use client";

import {
  AlertCircle,
  Bug,
  Hash,
  Layers,
  LogIn,
  Mail,
  Terminal,
} from "lucide-react";
import { useState } from "react";
import { useAlertStore } from "@/store/useAlertStore";
import { useMutation } from "@tanstack/react-query";
import { ApiHandler } from "@/utils/ApiHandler";

type Severity = "low" | "medium" | "high" | "critical";
type BugCategory =
  | "ui"
  | "performance"
  | "auth"
  | "data"
  | "notification"
  | "other";

interface BugFormState {
  title: string;
  category: BugCategory | "";
  severity: Severity | "";
  steps: string;
  expected: string;
  actual: string;
  browserOs: string;
  extras: string;
}

const severityOptions: { value: Severity; label: string; color: string }[] = [
  {
    value: "low",
    label: "Low",
    color:
      "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900",
  },
  {
    value: "medium",
    label: "Medium",
    color:
      "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900",
  },
  {
    value: "high",
    label: "High",
    color:
      "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-900",
  },
  {
    value: "critical",
    label: "Critical",
    color:
      "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900",
  },
];

const categoryOptions: {
  value: BugCategory;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "ui",
    label: "UI / Visual",
    icon: <Layers className="h-3.5 w-3.5" />,
  },
  {
    value: "performance",
    label: "Performance",
    icon: <Terminal className="h-3.5 w-3.5" />,
  },
  {
    value: "auth",
    label: "Auth / Login",
    icon: <LogIn className="h-3.5 w-3.5" />,
  },
  {
    value: "data",
    label: "Data / Content",
    icon: <Hash className="h-3.5 w-3.5" />,
  },
  {
    value: "notification",
    label: "Notifications",
    icon: <Mail className="h-3.5 w-3.5" />,
  },
  {
    value: "other",
    label: "Other",
    icon: <AlertCircle className="h-3.5 w-3.5" />,
  },
];

const inputClass =
  "w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-600 dark:focus:border-neutral-600 dark:focus:ring-neutral-800 transition-colors";

const labelClass =
  "mb-1.5 block text-sm font-medium text-neutral-700 dark:text-neutral-300";

const BugReport = () => {
  const [form, setForm] = useState<BugFormState>({
    title: "",
    category: "",
    severity: "",
    steps: "",
    expected: "",
    actual: "",
    browserOs: "",
    extras: "",
  });

  const set = (key: keyof BugFormState, val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  // Zustand State
  const triggerAlert = useAlertStore((state) => state.triggerAlert);

  // Placeholder submit — logic handled later
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitReport(form);
  };

  // Mutation function
  const { mutate: submitReport, isPending: loading } = useMutation({
    mutationFn: async (form: BugFormState) =>
      ApiHandler("/api/bug-report", "POST", form),
    onSuccess: async (response) => {
      const data = await response.json();

      if (!response.ok) {
        triggerAlert("error", data.message);
      } else {
        triggerAlert("success", data.message);

        // Clear form data on success
        setForm({
          title: "",
          category: "",
          severity: "",
          steps: "",
          expected: "",
          actual: "",
          browserOs: "",
          extras: "",
        });
      }
    },
    onError: (error) => {
      if (error instanceof Error) {
        console.error("Error while trying to submit a bug report:", error);
        triggerAlert("error", error.message);
      }
    },
  });

  return (
    <div id="bug-report" className="scroll-mt-24">
      {/* Section header */}
      <div className="mb-10">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
          <Bug className="h-3.5 w-3.5" />
          Quality & Feedback
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl dark:text-white">
          Report a Bug
        </h2>
        <p className="mt-3 max-w-xl text-base text-neutral-500 dark:text-neutral-400">
          Found something broken? Tell us what happened. The more detail you
          provide, the faster we can diagnose and fix it.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="bug-title" className={labelClass}>
            Bug Title <span className="text-red-500">*</span>
          </label>
          <input
            id="bug-title"
            type="text"
            required
            placeholder="e.g. Dashboard doesn't load after login"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Category + Severity side by side */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Category */}
          <div>
            <span className={labelClass}>
              Category <span className="text-red-500">*</span>
            </span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {categoryOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set("category", opt.value)}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                    form.category === opt.value
                      ? "border-neutral-900 bg-neutral-950 text-white dark:border-white dark:bg-white dark:text-neutral-950"
                      : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:border-neutral-700"
                  }`}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Severity */}
          <div>
            <span className={labelClass}>
              Severity <span className="text-red-500">*</span>
            </span>
            <div className="grid grid-cols-2 gap-2">
              {severityOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set("severity", opt.value)}
                  className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-all ${
                    form.severity === opt.value
                      ? opt.color + " shadow-sm"
                      : "border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Steps to reproduce */}
        <div>
          <label htmlFor="bug-steps" className={labelClass}>
            Steps to Reproduce <span className="text-red-500">*</span>
          </label>
          <textarea
            id="bug-steps"
            required
            rows={4}
            placeholder={`1. Go to the dashboard\n2. Click on "New Issue"\n3. Submit the form\n4. See error`}
            value={form.steps}
            onChange={(e) => set("steps", e.target.value)}
            className={`${inputClass} resize-none font-mono`}
          />
        </div>

        {/* Expected vs Actual */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="bug-expected" className={labelClass}>
              Expected Behaviour <span className="text-red-500">*</span>
            </label>
            <textarea
              id="bug-expected"
              required
              rows={3}
              placeholder="What should have happened?"
              value={form.expected}
              onChange={(e) => set("expected", e.target.value)}
              className={`${inputClass} resize-none`}
            />
          </div>
          <div>
            <label htmlFor="bug-actual" className={labelClass}>
              Actual Behaviour <span className="text-red-500">*</span>
            </label>
            <textarea
              id="bug-actual"
              required
              rows={3}
              placeholder="What actually happened instead?"
              value={form.actual}
              onChange={(e) => set("actual", e.target.value)}
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>

        {/* Browser / OS */}
        <div>
          <label htmlFor="bug-browser" className={labelClass}>
            Browser & Operating System
          </label>
          <input
            id="bug-browser"
            type="text"
            placeholder="e.g. Chrome 124 on Windows 11 / Safari on macOS Sonoma"
            value={form.browserOs}
            onChange={(e) => set("browserOs", e.target.value)}
            className={inputClass}
          />
          <p className="mt-1.5 text-xs text-neutral-400 dark:text-neutral-600">
            Helps us reproduce the issue in the same environment.
          </p>
        </div>

        {/* Additional context */}
        <div>
          <label htmlFor="bug-extras" className={labelClass}>
            Additional Context
          </label>
          <textarea
            id="bug-extras"
            rows={3}
            placeholder="Error messages, console logs, screenshots descriptions, frequency of occurrence…"
            value={form.extras}
            onChange={(e) => set("extras", e.target.value)}
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between gap-4 border-t border-neutral-100 pt-4 dark:border-neutral-900">
          <p className="text-xs text-neutral-400 dark:text-neutral-600">
            Fields marked <span className="text-red-500">*</span> are required.
          </p>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
          >
            <Bug className="h-4 w-4" />
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BugReport;
