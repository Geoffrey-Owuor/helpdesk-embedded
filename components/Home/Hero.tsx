"use client";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Zap } from "lucide-react";

const Hero = () => {
  return (
    <section className="custom:pt-40 custom:pb-24 overflow-hidden pt-32 pb-16">
      <div className="custom:px-8 px-4">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
            <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
            Internal Issue Tracking v1.0
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-bold tracking-tight text-neutral-950 sm:text-6xl dark:text-white">
            Centralized issues. <br />
            <span className="text-neutral-500 dark:text-neutral-400">
              Clear ownership.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-600 dark:text-neutral-400">
            Easily submit the issue you are facing, track its progress, and get
            timely updates until it&apos;s resolved.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/register"
              className="w-full rounded-full bg-neutral-950 px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-neutral-800 sm:w-auto dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
            >
              Get Started
            </Link>
            <Link
              href="/manual"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-neutral-200 px-8 py-3.5 text-sm font-medium text-neutral-950 transition-colors hover:bg-neutral-50 sm:w-auto dark:border-neutral-800 dark:text-white dark:hover:bg-neutral-900"
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
              <ShieldCheck className="h-4 w-4" /> SSO Ready
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" /> Real-time Updates
            </div>
          </div>
        </div>

        {/* Abstract Dashboard Visual */}
        <div className="relative mx-auto mt-16 max-w-5xl">
          <div className="rounded-xl border border-neutral-200 bg-neutral-100/50 p-2 dark:border-neutral-800 dark:bg-neutral-900/50">
            <div className="flex aspect-video flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-950">
              {/* Mock Window Header */}
              <div className="flex h-10 items-center gap-2 border-b border-neutral-100 bg-neutral-50 px-4 dark:border-neutral-800 dark:bg-neutral-900">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400/80"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-400/80"></div>
                  <div className="h-3 w-3 rounded-full bg-green-400/80"></div>
                </div>
              </div>
              {/* Mock Content Placeholder */}
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-neutral-300 dark:text-neutral-700">
                <p className="font-mono text-sm">Dashboard Preview Interface</p>
                <div className="mt-4 w-3/4 space-y-3">
                  <div className="h-4 w-full animate-pulse rounded bg-neutral-100 dark:bg-neutral-800"></div>
                  <div className="h-4 w-2/3 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800"></div>
                  <div className="h-4 w-1/2 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
