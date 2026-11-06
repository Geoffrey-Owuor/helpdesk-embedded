import SkeletonBox from "./SkeletonBox";

// Reuse widths for table
const colWidths = {
  ref: "w-24 shrink-0",
  status: "w-24 shrink-0",
  type: "w-26 shrink-0",
  priority: "w-20 shrink-0",
  submitter: "w-32 shrink-0",
  time: "w-24 shrink-0",
  date: "w-32 shrink-0",
  subDept: "w-32 shrink-0",
  targetDept: "w-32 shrink-0",
  agent: "w-32 shrink-0",
  title: "w-50 shrink-0",
  desc: "w-80 shrink-0",
};

// Pinned to the scroller's right edge, like the table's actions column. The
// card colour is opaque, so cells that scroll under it stay hidden.
const stickyActionsClass =
  "sticky right-0 z-10 flex w-20 shrink-0 items-center justify-center self-stretch bg-gray-50 dark:bg-neutral-950";

const IssuesDataSkeleton = ({
  isTableView,
  // Whether the viewer is likely to have row actions. Regular users rarely do,
  // and showing the column only for it to vanish would shift the layout.
  showActions = true,
}: {
  isTableView: boolean;
  showActions?: boolean;
}) => {
  return (
    <div>
      {isTableView ? (
        /* --- Table View Skeleton --- */
        // Same card and scroller as TableViewData: the padding is on the card,
        // and the scroller has none on the right, so the sticky actions column
        // sits flush with the edge instead of leaving a gap rows show through.
        <div className="w-full rounded-xl border border-neutral-200 bg-gray-50 py-2 pr-4 pl-3 dark:border-neutral-800 dark:bg-neutral-950">
          <div className="overflow-x-auto pl-1">
            <div className="min-w-max space-y-3 py-3">
              <div className="flex h-6 items-center gap-4 pb-2 pl-4">
                {Object.values(colWidths).map((width, i) => (
                  <SkeletonBox key={i} className={`h-3 ${width}`} />
                ))}
                {showActions && (
                  <div
                    className={`${stickyActionsClass} border-l border-neutral-200 pb-2 dark:border-neutral-800`}
                  >
                    <SkeletonBox className="h-3 w-12" />
                  </div>
                )}
              </div>

              {[...Array(5)].map((_, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 rounded-xl bg-white pl-4 shadow-sm dark:bg-neutral-900/50"
                >
                  <div className="flex items-center gap-4 py-4">
                    <SkeletonBox className={`h-5 ${colWidths.ref}`} />
                    <div className={colWidths.status}>
                      <SkeletonBox className="h-6 w-20 rounded-full" />
                    </div>
                    <SkeletonBox className={`h-4 ${colWidths.type}`} />
                    <div className={colWidths.priority}>
                      <SkeletonBox className="h-6 w-16 rounded-full" />
                    </div>
                    <SkeletonBox className={`h-4 ${colWidths.submitter}`} />
                    <div className={colWidths.time}>
                      <SkeletonBox className="h-6 w-20 rounded-full" />
                    </div>
                    <SkeletonBox className={`h-4 ${colWidths.date}`} />
                    <SkeletonBox className={`h-4 ${colWidths.subDept}`} />
                    <SkeletonBox className={`h-4 ${colWidths.targetDept}`} />
                    <SkeletonBox className={`h-4 ${colWidths.agent}`} />
                    <SkeletonBox className={`h-5 ${colWidths.title}`} />
                    <SkeletonBox className={`h-4 ${colWidths.desc}`} />
                  </div>
                  {showActions && (
                    // The opaque cell covers the row's rounded end, and its
                    // ::before reaches past the row to cover the row's shadow
                    // too; an inner layer paints the row's own end, as in the
                    // table
                    <div
                      className={`${stickyActionsClass} before:absolute before:inset-x-0 before:-inset-y-1.5 before:bg-gray-50 dark:before:bg-neutral-950`}
                    >
                      <div className="absolute inset-0 flex items-center justify-center rounded-r-xl border-l border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900/50">
                        <SkeletonBox className="h-8 w-8 rounded-full" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* --- Card View Skeleton --- */
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(8)].map((_, index) => (
            <div
              key={index}
              className="flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/50"
            >
              {/* Header Skeleton */}
              <div className="mb-4 flex items-center justify-between">
                <div className="inline-flex items-center gap-3">
                  <SkeletonBox className="h-4 w-20 rounded" />
                  <SkeletonBox className="h-6 w-6 rounded-full" />
                </div>
                <div className="flex items-center gap-1">
                  <SkeletonBox className="h-6 w-24 rounded-full" />
                  {showActions && (
                    <SkeletonBox className="h-8 w-8 rounded-full" />
                  )}
                </div>
              </div>

              {/* Body Skeleton */}
              <div className="mb-6 space-y-3">
                <SkeletonBox className="h-5 w-3/4 rounded" />
                <div className="space-y-2">
                  <SkeletonBox className="h-3 w-full rounded" />
                  <SkeletonBox className="h-3 w-5/6 rounded" />
                </div>
              </div>

              {/* Footer Skeleton */}
              <div className="space-y-4 border-t border-neutral-100 pt-4 dark:border-neutral-800">
                <div className="grid grid-cols-2 gap-2">
                  <SkeletonBox className="h-3 w-16 rounded" />
                  <SkeletonBox className="h-3 w-20 rounded" />
                </div>
                <div className="flex flex-col gap-3">
                  <SkeletonBox className="h-4 w-32 rounded" />
                  <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-2 dark:border-neutral-800/50 dark:bg-neutral-800/40">
                    <SkeletonBox className="h-6 w-24 rounded" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- Pagination Skeleton --- */}
      <div className="mt-6 flex items-center justify-between py-3">
        <SkeletonBox className="hidden h-4 w-48 lg:block" />
        <div className="flex items-center gap-2">
          {[...Array(4)].map((_, i) => (
            <SkeletonBox key={i} className="h-8 w-8 rounded-lg" />
          ))}
        </div>
        <div className="hidden justify-end lg:flex lg:w-48">
          <SkeletonBox className="h-8 w-32 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export default IssuesDataSkeleton;
