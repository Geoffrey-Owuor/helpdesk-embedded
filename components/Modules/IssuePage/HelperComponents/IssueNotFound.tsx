"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileQuestion, LayoutDashboard } from "lucide-react";

// Shown when an issue fetch 404s - the server collapses "doesn't exist" and
// "not visible to you" into one response, so the copy covers both.
export const IssueNotFound = ({
  backHref,
  backLabel,
}: {
  backHref: string;
  backLabel: string;
}) => {
  const router = useRouter();

  return (
    <div className="mx-auto my-12 flex w-full max-w-md flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50/50 p-8 dark:border-neutral-800 dark:bg-neutral-900/20">
      {/* Icon */}
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800/80">
        <FileQuestion className="h-6 w-6 text-neutral-400 dark:text-neutral-500" />
      </div>

      {/* Title & Context */}
      <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
        Issue/Page not found
      </h2>
      <p className="mt-2 text-center text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
        We couldn&apos;t find the issue/page you are looking for. It may have
        been deleted, the URL might be incorrect, or you might not have access.
      </p>

      {/* Actions */}
      <div className="mt-8 flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <button
          onClick={() => router.back()}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900 sm:w-auto dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </button>

        <Link
          href={backHref}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 sm:w-auto dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          <LayoutDashboard className="h-4 w-4" />
          {backLabel}
        </Link>
      </div>
    </div>
  );
};
