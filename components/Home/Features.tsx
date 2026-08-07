"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Bot,
  LayoutDashboard,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useLoadingStore } from "@/store/useLoadingStore";
import IssuePriorityFormatter from "../Modules/IssuesData/IssuePriorityFormatter";

const priorities = ["Critical", "High", "Medium", "Low"];

const cards = [
  {
    icon: Bot,
    title: "Auto-assignment",
    body: "Each department and issue type maps to an owner, so submissions land with the agent who can actually fix them.",
    href: "/manual#issues-docs",
    linkLabel: "Browse issue types",
  },
  {
    icon: Mail,
    title: "Email that keeps up",
    body: "A confirmation the moment you submit, then a note whenever an agent is assigned, comments, or resolves your issue.",
    href: "/manual#user-manual",
    linkLabel: "See what gets sent",
  },
  {
    icon: BookOpen,
    title: "Knowledge base",
    body: "Articles and FAQs written by the people who support the systems - often the fastest answer is already there.",
    href: "/articles",
    linkLabel: "Search the articles",
  },
  {
    icon: ShieldCheck,
    title: "Sign in your way",
    body: "Email and password, Microsoft Entra ID single sign-on, or straight through from the portal you are already using.",
    href: "/login",
    linkLabel: "Go to sign in",
  },
];

const Features = () => {
  const setLoadingLine = useLoadingStore((state) => state.setLoadingLine);

  return (
    <section id="features" className="custom:px-8 scroll-mt-20 px-4 pb-16">
      {/* Header */}
      <div className="mb-12 flex flex-col items-center text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-semibold tracking-widest text-neutral-500 uppercase dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
          <Sparkles className="h-3.5 w-3.5" />
          What you get
        </div>
        <h2 className="mb-3 text-3xl font-semibold tracking-tight text-balance text-neutral-900 sm:text-4xl dark:text-white">
          Built around how support actually happens
        </h2>
        <p className="max-w-2xl text-base text-pretty text-neutral-600 dark:text-neutral-400">
          One place to raise a problem, one place to check on it, and a trail
          you can point back to when someone asks what happened.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Feature card — dashboard (spans the full row) */}
        <div className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 transition-all duration-300 hover:border-neutral-300 hover:shadow-xl hover:shadow-neutral-900/5 md:col-span-2 md:p-8 dark:border-neutral-800 dark:bg-neutral-900/20 dark:hover:border-neutral-700 dark:hover:shadow-black/40">
          {/* Accent line on hover */}
          <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-blue-500 to-indigo-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
            <div className="flex-1">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-neutral-900 dark:text-white">
                A dashboard that answers &quot;where is my issue?&quot;
              </h3>
              <p className="max-w-xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                Filter by status, priority, department, agent, or date. Every
                issue gets a department reference you can quote, a priority you
                can read at a glance, and a comment thread that keeps the whole
                conversation in one place.
              </p>
              <Link
                href="/login"
                className="group/link mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Open your dashboard
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-0.5" />
              </Link>
            </div>

            {/* Priority legend visual */}
            <div className="w-full shrink-0 rounded-xl border border-neutral-200 bg-neutral-50/70 p-5 lg:w-64 dark:border-neutral-800 dark:bg-neutral-950/50">
              <p className="mb-4 text-[10px] font-semibold tracking-widest text-neutral-400 uppercase dark:text-neutral-600">
                Priority at a glance
              </p>
              <div className="flex flex-wrap gap-2.5">
                {priorities.map((priority) => (
                  <IssuePriorityFormatter key={priority} priority={priority} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Remaining feature cards */}
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              onClick={() => setLoadingLine(true)}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-xl hover:shadow-neutral-900/5 dark:border-neutral-800 dark:bg-neutral-900/20 dark:hover:border-neutral-700 dark:hover:shadow-black/40"
            >
              <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-blue-500 to-indigo-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-600 transition-colors group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-blue-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300 dark:group-hover:border-blue-900/60 dark:group-hover:bg-blue-950/40 dark:group-hover:text-blue-400">
                <Icon className="h-5 w-5" />
              </div>

              <h3 className="mb-2 text-lg font-semibold text-neutral-900 dark:text-white">
                {card.title}
              </h3>
              <p className="flex-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                {card.body}
              </p>

              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-900 dark:text-white">
                {card.linkLabel}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default Features;
