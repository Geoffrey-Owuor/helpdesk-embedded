import SkeletonBox from "@/components/Skeletons/SkeletonBox";

// Mirrors IssueHeader + IssueDetailBody. The analytics mirror swaps the pin
// button and action toolbar for its breadcrumb links.
const IssueDetailsSkeleton = ({
  variant = "issue",
}: {
  variant?: "issue" | "analytics";
}) => {
  const isAnalytics = variant === "analytics";

  return (
    <div className="mx-auto py-6 md:py-4">
      {/* --- HEADER SECTION SKELETON --- */}
      <div className="mb-6 flex flex-col gap-3">
        {/* Breadcrumbs - back to analytics / go to issue */}
        {isAnalytics && (
          <div className="flex flex-wrap items-center gap-3">
            <SkeletonBox className="h-5 w-32 rounded-full!" />
            <SkeletonBox className="h-5 w-24 rounded-full!" />
          </div>
        )}

        {/* Identity row - reference, date, pin/refresh */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <SkeletonBox className="h-5 w-24" />
            <SkeletonBox className="h-1 w-1 rounded-full!" />
            <SkeletonBox className="h-4 w-36" />
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {!isAnalytics && (
              <SkeletonBox className="h-9 w-9 rounded-full! sm:h-8 sm:w-8" />
            )}
            <SkeletonBox className="h-9 w-9 rounded-full! sm:h-8 sm:w-8" />
          </div>
        </div>

        {/* Title */}
        <SkeletonBox className="h-7 w-3/4 max-w-xl sm:h-8" />

        {/* State row - status, priority, relative time */}
        <div className="flex flex-wrap items-center gap-2">
          <SkeletonBox className="h-6.5 w-22 rounded-lg!" />
          <SkeletonBox className="h-6.5 w-22 rounded-lg!" />
          <SkeletonBox className="h-6 w-28 rounded-lg!" />
        </div>

        {/* Action toolbar - triage | collaborate (Reopen only shows on finished issues) */}
        {!isAnalytics && (
          <div className="flex flex-wrap items-center gap-2 border-t border-neutral-200 pt-3 dark:border-neutral-800">
            <SkeletonBox className="h-9 w-26 rounded-lg! sm:h-8" />
            <SkeletonBox className="h-9 w-24 rounded-lg! sm:h-8" />
            <span className="mx-1 hidden h-5 w-px bg-neutral-200 sm:block dark:bg-neutral-800" />
            <SkeletonBox className="hidden h-8 w-20 rounded-lg! sm:block" />
            <SkeletonBox className="hidden h-8 w-27 rounded-lg! sm:block" />
          </div>
        )}
      </div>

      {/* --- DETAILS GRID SKELETON (3 Cards) --- */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {[1, 2, 3].map((index) => (
          <div
            key={index}
            className="flex flex-col rounded-xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-950"
          >
            {/* Card Header */}
            <div className="mb-4 flex items-center gap-2 border-b border-neutral-100 pb-3 dark:border-neutral-800/50">
              <SkeletonBox className="h-8 w-8 rounded-full!" />
              <SkeletonBox className="h-4 w-32" />
            </div>

            {/* Card Content Blocks */}
            <div className="flex flex-col gap-5">
              <div>
                <SkeletonBox className="mb-1.5 h-3 w-24" />
                <SkeletonBox className="h-4.5 w-40" />
              </div>
              <div>
                <SkeletonBox className="mb-1.5 h-3 w-24" />
                {index === 3 ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <SkeletonBox className="h-7.5 w-32 rounded-full!" />
                    <SkeletonBox className="h-7.5 w-24 rounded-full!" />
                  </div>
                ) : (
                  <SkeletonBox className="h-4.5 w-32" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- DESCRIPTION & REMARKS SKELETON --- */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[1, 2].map((index) => (
          <div
            key={index}
            className="rounded-xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-950"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SkeletonBox className="h-8 w-8 rounded-full!" />
                <SkeletonBox className="h-5 w-28" />
              </div>
              {index === 1 && <SkeletonBox className="h-8 w-8 rounded-full!" />}
            </div>

            {/* Paragraph Lines */}
            <div className="space-y-3">
              <SkeletonBox className="h-3.5 w-full" />
              <SkeletonBox className="h-3.5 w-full" />
              <SkeletonBox className="h-3.5 w-11/12" />
              <SkeletonBox className="h-3.5 w-3/4" />
            </div>
          </div>
        ))}
      </div>

      {/* --- BOTTOM GRID: COMMENTS + METADATA SKELETON --- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Comments Section */}
        <div className="rounded-xl border border-neutral-200 p-6 shadow-xs dark:border-neutral-800">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <SkeletonBox className="h-8 w-8 rounded-full!" />
                <SkeletonBox className="h-5 w-36" />
              </div>
              <SkeletonBox className="ml-2 h-3.5 w-28" />
            </div>
            <div className="flex items-center gap-4">
              <SkeletonBox className="h-9 w-9 rounded-xl" />
              <SkeletonBox className="h-9 w-32 rounded-xl" />
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-start gap-4">
                {/* Avatar */}
                <SkeletonBox className="h-8 w-8 shrink-0 rounded-full!" />

                {/* Comment Bubble */}
                <div className="min-w-0 flex-1 rounded-2xl rounded-tl-none bg-neutral-100 px-5 py-4 dark:bg-neutral-900/80">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <SkeletonBox className="h-4 w-40" /> {/* Name/email */}
                    <SkeletonBox className="h-3 w-24" /> {/* Date */}
                  </div>
                  <div className="space-y-2">
                    <SkeletonBox className="h-3 w-full" />
                    <SkeletonBox className="h-3 w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary / Other Metadata card */}
        <div className="flex flex-col rounded-xl border-t-2 border-black dark:border-white">
          <div className="flex items-center justify-between p-6">
            <div className="inline-flex items-center gap-2">
              <SkeletonBox className="h-8 w-8 rounded-full!" />
              <SkeletonBox className="h-5 w-32" />
            </div>
            <SkeletonBox className="hidden h-3.5 w-28 sm:inline-flex" />
          </div>

          {/* Rows */}
          <div className="flex flex-col divide-y divide-neutral-100 px-6 dark:divide-neutral-800">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <SkeletonBox className="h-3.5 w-24" />
                <SkeletonBox className="h-3.5 w-32" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueDetailsSkeleton;
