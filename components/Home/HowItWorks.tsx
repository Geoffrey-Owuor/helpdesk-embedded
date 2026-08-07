"use client";

import Link from "next/link";
import {
  ArrowRight,
  BotMessageSquare,
  MessageSquareText,
  Route,
  PencilLine,
  CircleCheckBig,
} from "lucide-react";
import { useLoadingStore } from "@/store/useLoadingStore";
import IssueStatusFormatter from "../Modules/IssuesData/IssueStatusFormatter";

const steps = [
  {
    icon: PencilLine,
    title: "Describe the problem",
    body: "Use Quick Create without signing in, or the New Issue form on your dashboard. Pick a department and issue type, describe what happened, and attach any supporting files.",
  },
  {
    icon: Route,
    title: "We route it for you",
    body: "Your department and issue type decide who picks it up - the auto-assignment bot hands it to the right agent and stamps it with a reference and a priority before it ever hits a queue.",
  },
  {
    icon: CircleCheckBig,
    title: "Follow it to resolution",
    body: "Watch the status move in real time, comment on the thread to add context, and get an email every time an agent picks it up, updates it, or resolves it.",
  },
];

const lifecycle = ["open", "in progress", "resolved", "closed"];

const HowItWorks = () => {
  const setLoadingLine = useLoadingStore((state) => state.setLoadingLine);

  return (
    <section id="how-it-works" className="custom:px-8 scroll-mt-20 px-4 pb-16">
      {/* Header */}
      <div className="mb-12 flex flex-col items-center text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-semibold tracking-widest text-neutral-500 uppercase dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
          <BotMessageSquare className="h-3.5 w-3.5" />
          How it works
        </div>
        <h2 className="mb-3 text-3xl font-semibold tracking-tight text-balance text-neutral-900 sm:text-4xl dark:text-white">
          Three steps from stuck to sorted
        </h2>
        <p className="max-w-2xl text-base text-pretty text-neutral-600 dark:text-neutral-400">
          No forms to chase, no inbox to dig through. Submit once and HelpDesk
          takes care of the routing, the reminders, and the paper trail.
        </p>
      </div>

      {/* Steps */}
      <div className="relative grid gap-6 md:grid-cols-3">
        {/* Connecting line behind the cards (desktop only) */}
        <div
          aria-hidden
          className="absolute top-11 right-[16%] left-[16%] hidden h-px overflow-hidden bg-neutral-200 md:block dark:bg-neutral-800"
        >
          <div className="animate-flowRight h-full w-1/4 bg-linear-to-r from-transparent via-blue-500 to-transparent" />
        </div>

        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div
              key={step.title}
              className="group relative flex flex-col rounded-2xl border border-neutral-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-xl hover:shadow-neutral-900/5 dark:border-neutral-800 dark:bg-neutral-900/20 dark:hover:border-neutral-700 dark:hover:shadow-black/40"
            >
              {/* Icon badge */}
              <div className="relative mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-600 transition-colors group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-blue-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300 dark:group-hover:border-blue-900/60 dark:group-hover:bg-blue-950/40 dark:group-hover:text-blue-400">
                <Icon className="h-5 w-5" />
              </div>

              <span className="mb-1.5 font-mono text-xs text-neutral-400 dark:text-neutral-600">
                Step {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-white">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                {step.body}
              </p>
            </div>
          );
        })}
      </div>

      {/* Lifecycle strip */}
      <div className="mt-6 flex flex-col gap-5 rounded-2xl border border-neutral-200 bg-neutral-50/60 p-6 lg:flex-row lg:items-center lg:justify-between dark:border-neutral-800 dark:bg-neutral-900/30">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-white">
            <MessageSquareText className="h-4 w-4 text-blue-500" />
            You always know where it stands
          </h3>
          <p className="mt-1.5 max-w-xl text-sm text-neutral-600 dark:text-neutral-400">
            Every issue carries a color-coded status and an aging badge, so a
            request that has been sitting too long is impossible to miss.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {lifecycle.map((status, index) => (
            <div key={status} className="flex items-center gap-2">
              <IssueStatusFormatter status={status} />
              {index < lifecycle.length - 1 && (
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-neutral-300 dark:text-neutral-700" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Deep links into the manual */}
      <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm">
        <Link
          href="/manual#user-manual"
          onClick={() => setLoadingLine(true)}
          className="group inline-flex items-center gap-1.5 font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Read the full walkthrough
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
        <Link
          href="/manual#color-codes"
          onClick={() => setLoadingLine(true)}
          className="group inline-flex items-center gap-1.5 font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
        >
          Understand the color codes
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </section>
  );
};

export default HowItWorks;
