import SkeletonBox from "./SkeletonBox";

// Reuse the exact same widths to ensure the skeleton matches the real table
const colWidths = {
  ref: "w-24 shrink-0",
  status: "w-24 shrink-0",
  type: "w-26 shrink-0",
  submitter: "w-32 shrink-0",
  date: "w-32 shrink-0",
  dept: "w-32 shrink-0",
  agent: "w-32 shrink-0",
  title: "w-50 shrink-0",
  desc: "w-80 shrink-0",
};

const IssuesDataSkeleton = ({ isTableView }: { isTableView: boolean }) => {
  return (
    <div>
      {/* --- Major Container --- */}
      {isTableView ? (
        <div className="w-full overflow-x-auto rounded-xl bg-gray-100/50 p-4 dark:bg-neutral-900/50">
          <div className="min-w-max space-y-2">
            {/* 1. Header Row Skeleton */}
            <div className="flex items-center gap-4 px-4 pb-2">
              <SkeletonBox className={`h-3 ${colWidths.ref}`} />
              <SkeletonBox className={`h-3 ${colWidths.status}`} />
              <SkeletonBox className={`h-3 ${colWidths.type}`} />
              <SkeletonBox className={`h-3 ${colWidths.submitter}`} />
              <SkeletonBox className={`h-3 ${colWidths.date}`} />
              <SkeletonBox className={`h-3 ${colWidths.dept}`} />
              <SkeletonBox className={`h-3 ${colWidths.dept}`} />
              <SkeletonBox className={`h-3 ${colWidths.agent}`} />
              <SkeletonBox className={`h-3 ${colWidths.title}`} />
              <SkeletonBox className={`h-3 ${colWidths.desc}`} />
            </div>

            {/* 2. Data Rows Skeletons (Generate 5 fake rows) */}
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className="flex items-center gap-4 rounded-xl bg-neutral-50 p-4 shadow dark:bg-neutral-800/50"
              >
                {/* Reference */}
                <SkeletonBox className={`h-5 ${colWidths.ref}`} />

                {/* Status Badge */}
                <div className={colWidths.status}>
                  <SkeletonBox className="h-6 w-20 rounded-full" />
                </div>

                {/* Type */}
                <SkeletonBox className={`h-4 ${colWidths.type}`} />

                {/* Submitter */}
                <SkeletonBox className={`h-4 ${colWidths.submitter}`} />

                {/* Date */}
                <SkeletonBox className={`h-4 ${colWidths.date}`} />

                {/* Submitter Dept */}
                <SkeletonBox className={`h-4 ${colWidths.dept}`} />

                {/* Target Dept */}
                <SkeletonBox className={`h-4 ${colWidths.dept}`} />

                {/* Agent */}
                <SkeletonBox className={`h-4 ${colWidths.agent}`} />

                {/* Title */}
                <SkeletonBox className={`h-5 ${colWidths.title}`} />

                {/* Description */}
                <SkeletonBox className={`h-4 ${colWidths.desc}`} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <></>
      )}

      {/* --- Pagination Skeleton --- */}
      <div className="mt-6 flex items-center justify-between py-3">
        {/* Left: "Showing 1 to 10..." text */}
        <SkeletonBox className="hidden h-4 w-48 lg:block" />

        {/* Center: Page Numbers */}
        <div className="flex items-center gap-2">
          <SkeletonBox className="h-8 w-8 rounded-lg" /> {/* Prev */}
          <SkeletonBox className="h-8 w-8 rounded-lg" /> {/* 1 */}
          <SkeletonBox className="h-8 w-8 rounded-lg" /> {/* 2 */}
          <SkeletonBox className="h-8 w-8 rounded-lg" /> {/* Next */}
        </div>

        {/* Right: Rows per page dropdown */}
        <div className="hidden justify-end lg:flex lg:w-48">
          <SkeletonBox className="h-8 w-32 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export default IssuesDataSkeleton;
