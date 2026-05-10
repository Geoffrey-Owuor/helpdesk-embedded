import { dateFormatter } from "@/public/assets";
import Link from "next/link";
import HomeNavBar from "../Navigation/HomeNavBar";
import { ArrowLeft, GitCommitHorizontal, RotateCcw } from "lucide-react";
import Footer from "./Footer";
import SkeletonBox from "../Skeletons/SkeletonBox";
import { Suspense } from "react";
import {
  fetchedChangelogData,
  refetchChangelogData,
} from "@/serverActions/GetChangeLogData";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
export interface ChangelogData {
  changelog_id: number;
  changelog_type: string;
  changelog_updated_at: string;
  changelog_title: string;
  changelog_description: string;
}

const ChangelogTypes: Record<string, string> = {
  feature:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400",
  fix: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-400",
  improvement:
    "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-400",
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/** Converts a changelog title into a URL-safe anchor id */
const toId = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

// ─────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────

// ─────────────────────────────────────────────
// Changelog Entry Skeleton
// ─────────────────────────────────────────────

const ChangelogEntrySkeleton = () => {
  return (
    <>
      {Array.from({ length: 8 }).map((_, index) => (
        <article
          key={index}
          className="scroll-mt-24 rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950"
        >
          {/* Meta row */}
          <div className="mb-5.25 flex flex-wrap items-center gap-3">
            {/* TypePill skeleton - pill shaped */}
            <SkeletonBox className="h-6 w-20 rounded-full" />
            {/* Date skeleton */}
            <SkeletonBox className="h-6 w-24 rounded-md" />
          </div>

          {/* Title skeleton */}
          <SkeletonBox className="h-5 w-3/4 max-w-100 rounded-md" />

          {/* Divider - keep the actual divider structural styling */}
          <div className="my-4 h-px bg-neutral-100 dark:bg-neutral-800" />

          {/* Description skeleton - multiple lines to simulate a paragraph */}
          <div className="flex flex-col gap-3">
            <SkeletonBox className="my-1.5 h-4 w-full rounded-md" />
          </div>
        </article>
      ))}
    </>
  );
};

// ─────────────────────────────────────────────
// TOC Skeleton
// ─────────────────────────────────────────────

const TOCSkeleton = () => {
  return (
    <>
      {/* Title Skeleton ("On this page") */}
      <SkeletonBox className="mb-3 ml-1 h-3 w-20 rounded-md" />

      {/* Links Skeleton */}
      <nav className="flex flex-col gap-0.5">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="flex items-start gap-2 px-3 py-1.5">
            {/* The bullet point */}
            <SkeletonBox className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full" />

            {/* The link text - varied widths for realism */}
            <SkeletonBox
              className={`mt-0.5 h-4 rounded-md ${
                index % 2 === 0 ? "w-3/4" : "w-1/2"
              }`}
            />
          </div>
        ))}
      </nav>
    </>
  );
};

export const ChangelogTypePill = ({ type }: { type: string }) => {
  const typeColor = ChangelogTypes[type];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${typeColor} px-2.5 py-0.5 text-xs font-medium`}
    >
      <GitCommitHorizontal className="h-3.5 w-3.5" />
      {type}
    </span>
  );
};

// ─────────────────────────────────────────────
// Table of Contents (desktop only)
// ─────────────────────────────────────────────

const TableOfContents = ({ items }: { items: ChangelogData[] }) => (
  <aside className="hidden shrink-0 lg:block lg:w-56">
    <div className="sticky top-20">
      {/* Identity card */}
      <div className="mb-5 overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
        <div className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-xs font-medium text-neutral-500 transition-colors hover:border-neutral-300 hover:text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900/50 dark:text-neutral-400 dark:hover:border-neutral-600 dark:hover:text-white"
            >
              <ArrowLeft className="h-3 w-3" />
              Back to home
            </Link>

            <button
              onClick={refetchChangelogData}
              title="Refresh"
              className="rounded-full bg-neutral-100 p-2 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <GitCommitHorizontal className="h-4 w-4 shrink-0 text-blue-400 dark:text-blue-500" />
            <span className="font-mono text-base font-semibold tracking-tight text-neutral-900 dark:text-white">
              Changelog
            </span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
            A running log of updates, fixes, and improvements to IssueDesk.
          </p>
        </div>
      </div>

      {/* TOC links */}
      {items.length === 0 ? (
        <>
          <p className="mb-2 px-1 text-xs font-semibold tracking-widest text-neutral-400 uppercase dark:text-neutral-600">
            On this page
          </p>
          <div className="px-3 py-4 text-sm text-neutral-500 italic dark:text-neutral-500">
            No current entries available for this release.
          </div>
        </>
      ) : (
        <Suspense fallback={<TOCSkeleton />}>
          <p className="mb-2 px-1 text-xs font-semibold tracking-widest text-neutral-400 uppercase dark:text-neutral-600">
            On this page
          </p>
          <nav className="flex flex-col gap-0.5">
            {items.map((entry) => (
              <a
                key={entry.changelog_id}
                href={`#${toId(entry.changelog_title)}`}
                className="group flex items-start gap-2 rounded-xl px-3 py-1.5 text-sm text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-900 dark:hover:bg-neutral-900 dark:hover:text-white"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-300 transition-colors group-hover:bg-neutral-500 dark:bg-neutral-700 dark:group-hover:bg-neutral-400" />
                <span className="line-clamp-2 leading-snug">
                  {entry.changelog_title}
                </span>
              </a>
            ))}
          </nav>
        </Suspense>
      )}
    </div>
  </aside>
);

// ─────────────────────────────────────────────
// Changelog Entry
// ─────────────────────────────────────────────

const ChangelogEntry = ({ entry }: { entry: ChangelogData }) => {
  const anchorId = toId(entry.changelog_title);

  return (
    <article
      id={anchorId}
      className="scroll-mt-24 rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950"
    >
      {/* Meta row */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <ChangelogTypePill type={entry.changelog_type} />
        <time className="font-mono text-sm text-neutral-400 dark:text-neutral-600">
          {dateFormatter(entry.changelog_updated_at)}
        </time>
      </div>

      {/* Title */}
      <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white">
        {entry.changelog_title}
      </h2>

      {/* Divider */}
      <div className="my-4 h-px bg-neutral-100 dark:bg-neutral-800" />

      {/* Description */}
      <p className="text-sm leading-7 whitespace-pre-line text-neutral-600 dark:text-neutral-400">
        {entry.changelog_description}
      </p>
    </article>
  );
};

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

const ChangeLog = async () => {
  const changelogs = await fetchedChangelogData();

  return (
    <main className="layout-scrollbar home-container h-screen overflow-y-auto scroll-smooth bg-white dark:bg-neutral-950">
      <HomeNavBar />
      <div className="custom:px-8 mx-auto mb-8 max-w-6xl px-4 py-6 2xl:max-w-7xl">
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-16">
          {/* Sidebar TOC */}
          <TableOfContents items={changelogs} />

          {/* Main content */}
          <div className="min-w-0 flex-1">
            {/* Mobile-only page header (TOC card is hidden on mobile) */}
            <div className="mb-8 lg:hidden">
              <Link
                href="/"
                className="mb-4 inline-flex items-center gap-1.5 text-sm text-neutral-500 transition-colors hover:text-neutral-900 dark:hover:text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to app
              </Link>
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 dark:text-white">
                    Changelog
                  </h1>
                  <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                    A running log of updates, fixes, and improvements to Issue
                    Desk.
                  </p>
                </div>
                <button
                  onClick={refetchChangelogData}
                  title="Refresh"
                  className="hidden rounded-full bg-neutral-100 p-2 hover:bg-neutral-200 sm:block dark:bg-neutral-900 dark:hover:bg-neutral-800"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* States */}
            {changelogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-200 py-20 dark:border-neutral-800">
                <GitCommitHorizontal className="mb-3 h-8 w-8 text-neutral-300 dark:text-neutral-700" />
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  No changelog entries yet.
                </p>
                <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-600">
                  Check back soon for updates.
                </p>
              </div>
            ) : (
              <Suspense fallback={<ChangelogEntrySkeleton />}>
                <div className="space-y-6">
                  {changelogs.map((entry) => (
                    <ChangelogEntry key={entry.changelog_id} entry={entry} />
                  ))}
                </div>
              </Suspense>
            )}
          </div>
        </div>
      </div>
      {/* Footer */}
      <Footer />
    </main>
  );
};

export default ChangeLog;
