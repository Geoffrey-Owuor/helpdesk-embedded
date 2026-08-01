"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Bug, Mail, Star, Zap } from "lucide-react";
import { useLoadingStore } from "@/store/useLoadingStore";
import { useQuickCreateStore } from "@/store/useQuickCreateStore";

const secondaryLinks = [
  { href: "/manual#bug-report", label: "Report a bug", icon: Bug },
  { href: "/it-team", label: "Meet the IT team", icon: Star },
];

const ExploreCta = () => {
  const [fullUrl, setFullUrl] = useState("");
  const setLoadingLine = useLoadingStore((state) => state.setLoadingLine);
  const openQuickCreate = useQuickCreateStore((state) => state.openQuickCreate);

  useEffect(() => {
    // Set full url
    Promise.resolve().then(() => setFullUrl(window.location.href));
  }, []);

  const showButton = fullUrl !== process.env.NEXT_PUBLIC_BASE_URL;
  return (
    <section className="custom:px-8 px-4 pb-20">
      <div className="relative overflow-hidden rounded-3xl bg-neutral-950 px-6 py-14 sm:px-12 dark:bg-white">
        {/* Ambient glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 left-1/2 h-80 w-160 -translate-x-1/2 rounded-full bg-blue-500/25 blur-[100px] dark:bg-blue-500/20"
        />

        <div className="relative mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl dark:text-neutral-950">
            Something broken? Don&apos;t sit on it.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-pretty text-neutral-400 dark:text-neutral-600">
            It takes under a minute to log an issue - and the sooner it is in
            the system, the sooner it is somebody&apos;s job to fix it.
          </p>

          {/* Primary actions */}
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {showButton && fullUrl && (
              <button
                onClick={openQuickCreate}
                className="group inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-neutral-950 transition-colors hover:bg-neutral-200 sm:w-auto dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-800"
              >
                <Zap className="h-4 w-4 text-blue-500" />
                Submit an issue now
              </button>
            )}
            <Link
              href="/register"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full border border-neutral-800 px-8 py-3.5 text-sm font-medium text-white transition-colors hover:bg-neutral-900 sm:w-auto dark:border-neutral-300 dark:text-neutral-950 dark:hover:bg-neutral-100"
            >
              Create an account
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Secondary links */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm">
            {secondaryLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setLoadingLine(true)}
                className="inline-flex items-center gap-1.5 text-neutral-400 transition-colors hover:text-white dark:text-neutral-600 dark:hover:text-neutral-950"
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            ))}
            <a
              href="mailto:helpdesk@hotpoint.co.ke"
              className="inline-flex items-center gap-1.5 text-neutral-400 transition-colors hover:text-white dark:text-neutral-600 dark:hover:text-neutral-950"
            >
              <Mail className="h-3.5 w-3.5" />
              Email IT directly
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExploreCta;
