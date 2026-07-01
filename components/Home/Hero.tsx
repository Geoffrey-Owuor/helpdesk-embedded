"use client";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Wand2 } from "lucide-react";
import { DbStatus, useDbStore } from "@/store/useDbStore";
import { useEffect } from "react";
import { AppVersion } from "@/public/assets";
import DashboardSkeleton from "./DashboardSkeleton";

const Hero = () => {
  const status = useDbStore((state) => state.status);
  const triggerCheck = useDbStore((state) => state.triggerCheck);

  useEffect(() => {
    triggerCheck();
  }, [triggerCheck]);

  const colorsMapping: Record<DbStatus, string> = {
    checking: "bg-green-500",
    degraded: "bg-amber-500",
    ok: "bg-green-500",
  };

  return (
    <section className="flex h-full items-center justify-center overflow-hidden py-16">
      <div className="custom:px-8 w-full px-4">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-neutral-50 px-3 py-1 text-sm text-neutral-600 dark:bg-neutral-900/50 dark:text-neutral-400">
            <span
              className={`flex h-2 w-2 rounded-full ${colorsMapping[status]}`}
            ></span>
            HelpDesk {AppVersion}
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-bold tracking-tight text-neutral-950 sm:text-6xl dark:text-white">
            Every issue, one place. <br />
            <span className="text-neutral-500 dark:text-neutral-400">
              Every update, within reach.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-600 dark:text-neutral-400">
            Don&apos;t let an issue slow you down. Tell us what&apos;s wrong -
            we&apos;ll take it from there.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/login"
              className="w-full rounded-full bg-neutral-950 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800 sm:w-auto dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
            >
              Get Started
            </Link>
            <Link
              href="/manual"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-neutral-200 px-8 py-3.5 text-sm font-medium text-neutral-950 hover:bg-neutral-50 sm:w-auto dark:border-neutral-800 dark:text-white dark:hover:bg-neutral-900"
            >
              View Manual <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Feature Ticks */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-neutral-500 dark:text-neutral-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Easy Submission
            </div>
            <div className="flex items-center gap-2">
              <Wand2 className="h-4 w-4" /> Intuitive Interface
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" /> SSO Ready
            </div>
          </div>
        </div>

        {/* Abstract Dashboard Visual */}
        <DashboardSkeleton />
      </div>
    </section>
  );
};

export default Hero;
