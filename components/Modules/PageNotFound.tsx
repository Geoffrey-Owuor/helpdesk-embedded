"use client";
import HomePagesLogo from "@/components/Modules/HomePagesLogo";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ThemeToggle from "../Themes/ThemeToggle";

const PageNotFound = () => {
  const router = useRouter();
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-6 py-5 sm:px-10">
        <HomePagesLogo />
        <ThemeToggle />
      </header>

      {/* Main content */}
      <main className="relative z-20 flex flex-1 flex-col items-center justify-center px-6 text-center">
        {/* Large ghost 404 */}
        <div className="relative mb-2 select-none">
          <span
            className="text-[clamp(7rem,22vw,16rem)] leading-none font-black tracking-tighter text-neutral-300 dark:text-neutral-800"
            aria-hidden="true"
          >
            404
          </span>
          {/* Overlay rule line */}
          <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 -rotate-20 bg-neutral-300 dark:bg-neutral-800" />
        </div>

        {/* Message block */}
        <div className="mt-6 max-w-sm space-y-3">
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white">
            Page not found
          </h1>
          <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved. Double-check the URL, or contact the admin.
          </p>
        </div>

        {/* CTAs */}
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="inline-flex h-9 items-center rounded-lg bg-neutral-900 px-5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            Go to dashboard
          </Link>
          <button
            onClick={() => router.back()}
            className="inline-flex h-9 items-center rounded-lg border border-neutral-200 bg-white px-5 text-sm font-medium text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            Go back
          </button>
        </div>
      </main>

      {/* Bottom status bar */}
      <footer className="relative z-20 flex items-center justify-center gap-2 px-6 py-5 sm:px-10">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs dark:border-neutral-800 dark:bg-neutral-900">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
          Error 404 · Issue Desk
        </span>
      </footer>
    </div>
  );
};

export default PageNotFound;
