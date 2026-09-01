"use client";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ShieldCheck,
  Wand2,
  Zap,
} from "lucide-react";
import { DbStatus, useDbStore } from "@/store/useDbStore";
import { useEffect, useState } from "react";
import { AppVersion } from "@/public/assets";
import DashboardSkeleton from "./DashboardSkeleton";
import { useQuickCreateStore } from "@/store/useQuickCreateStore";
import { useLoadingStore } from "@/store/useLoadingStore";

const featureTicks = [
  { icon: CheckCircle2, label: "Easy Submission" },
  { icon: Wand2, label: "Intuitive Interface" },
  { icon: ShieldCheck, label: "SSO Ready" },
];

const Hero = () => {
  const [fullUrl, setFullUrl] = useState("");

  const status = useDbStore((state) => state.status);
  const triggerCheck = useDbStore((state) => state.triggerCheck);
  const openQuickCreate = useQuickCreateStore((state) => state.openQuickCreate);
  const setLoadingLine = useLoadingStore((state) => state.setLoadingLine);

  useEffect(() => {
    triggerCheck();
  }, [triggerCheck]);

  useEffect(() => {
    // Set full url
    Promise.resolve().then(() => setFullUrl(window.location.href));
  }, []);

  const colorsMapping: Record<DbStatus, string> = {
    checking: "bg-green-500",
    degraded: "bg-amber-500",
    ok: "bg-green-500",
  };
  const showButton = fullUrl !== process.env.NEXT_PUBLIC_BASE_URL;
  return (
    <section className="relative overflow-hidden pt-10 pb-16">
      {/* ── Ambient backdrop ── */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="custom:px-8 relative h-full px-4">
          {/* Grid lines, faded out towards the edges */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(to right, var(--home-grid-line) 1px, transparent 1px), linear-gradient(to bottom, var(--home-grid-line) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
              maskImage:
                "radial-gradient(ellipse 75% 60% at 50% 0%, #000 40%, transparent 100%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 75% 60% at 50% 0%, #000 40%, transparent 100%)",
            }}
          />
          {/* Soft blue glow behind the headline */}
          <div className="animate-ambientDrift absolute -top-40 left-1/2 h-120 w-180 -translate-x-1/2 rounded-full bg-blue-500/10 blur-[110px] dark:bg-blue-500/15" />
        </div>
      </div>

      <div className="custom:px-8 relative w-full px-4">
        <div className="mx-auto max-w-3xl text-center">
          {/* Version badge — links through to the changelog */}
          <Link
            href="/changelog"
            onClick={() => setLoadingLine(true)}
            className="animate-fadeUp group mb-8 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white/70 py-1 pr-2 pl-3 text-sm text-neutral-600 shadow-sm backdrop-blur transition-colors hover:border-neutral-300 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-400 dark:hover:border-neutral-700 dark:hover:text-white"
          >
            <span
              className={`flex h-2 w-2 shrink-0 rounded-full ${colorsMapping[status]}`}
            />
            HelpDesk {AppVersion}
            <span className="h-3.5 w-px bg-neutral-200 dark:bg-neutral-700" />
            <span className="inline-flex items-center gap-1 font-medium text-neutral-900 dark:text-white">
              What&apos;s new
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>

          {/* Headline */}
          <h1
            className="animate-fadeUp text-4xl font-bold tracking-tight text-balance text-neutral-950 sm:text-6xl dark:text-white"
            style={{ animationDelay: "80ms" }}
          >
            Every issue, one place. <br />
            <span className="bg-linear-to-r from-neutral-500 via-neutral-400 to-neutral-500 bg-clip-text text-transparent dark:from-neutral-400 dark:via-neutral-500 dark:to-neutral-400">
              Every update, within reach.
            </span>
          </h1>

          {/* Subheadline */}
          <p
            className="animate-fadeUp mx-auto mt-6 max-w-2xl text-lg text-pretty text-neutral-600 dark:text-neutral-400"
            style={{ animationDelay: "140ms" }}
          >
            Don&apos;t let an issue slow you down. Tell us what&apos;s wrong -
            we&apos;ll route it to the right person, keep you posted by email,
            and track it through to resolution.
          </p>

          {/* CTAs */}
          <div
            className="animate-fadeUp mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
            style={{ animationDelay: "200ms" }}
          >
            <Link
              href="/login"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-neutral-950 px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-neutral-800 sm:w-auto dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
            >
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            {fullUrl && showButton && (
              <button
                onClick={openQuickCreate}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-8 py-3.5 text-sm font-medium text-neutral-950 transition-colors hover:bg-neutral-50 sm:w-auto dark:border-neutral-800 dark:bg-transparent dark:text-white dark:hover:bg-neutral-900"
              >
                <Zap className="h-4 w-4 text-blue-500" />
                Submit an issue
              </button>
            )}
          </div>

          {/* Shortcut hint */}
          {fullUrl && showButton && (
            <p
              className="animate-fadeUp mt-4 text-xs text-neutral-500 dark:text-neutral-500"
              style={{ animationDelay: "240ms" }}
            >
              No account needed - just press{" "}
              <kbd className="rounded-md border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 font-mono text-[11px] text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
                Ctrl
              </kbd>{" "}
              +{" "}
              <kbd className="rounded-md border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 font-mono text-[11px] text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
                Q
              </kbd>{" "}
              to start
            </p>
          )}

          {/* Feature Ticks */}
          <div
            className="animate-fadeUp mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-neutral-500 dark:text-neutral-500"
            style={{ animationDelay: "300ms" }}
          >
            {featureTicks.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon className="h-4 w-4" /> {label}
              </div>
            ))}
          </div>
        </div>

        {/* Abstract Dashboard Visual */}
        <div className="animate-fadeUp" style={{ animationDelay: "380ms" }}>
          <DashboardSkeleton />
        </div>

        {/* Scroll affordance */}
        <div className="mt-10 flex justify-center">
          <a
            href="#how-it-works"
            className="group inline-flex flex-col items-center gap-1 text-xs font-medium text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-500 dark:hover:text-white"
          >
            See how it works
            <ChevronDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
