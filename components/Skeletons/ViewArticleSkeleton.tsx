import SkeletonBox from "./SkeletonBox";

const TOCSidebarSkeleton = () => (
  <nav className="sticky top-12 hidden max-h-[calc(100vh-5rem)] w-70 shrink-0 flex-col overflow-y-auto rounded-xl p-4 lg:flex">
    {/* "On this page" heading */}
    <div className="mb-4 border-b-2 border-neutral-200 pb-2 dark:border-neutral-800">
      <SkeletonBox className="h-3.5 w-24 bg-neutral-200 dark:bg-neutral-800" />
    </div>
    {/* TOC list items */}
    <div className="space-y-3">
      {["full", "3/4", "5/6", "full", "4/5", "2/3"].map((w, i) => (
        <SkeletonBox
          key={i}
          className={`h-4 w-${w} bg-neutral-200 dark:bg-neutral-800`}
        />
      ))}
    </div>
  </nav>
);

const ViewArticleSkeleton = ({ isInDashboard }: { isInDashboard: boolean }) => {
  const paddingX = isInDashboard ? "" : "custom:px-8";

  return (
    <div className={`flex flex-col px-4 py-6 ${paddingX} lg:flex-row lg:gap-6`}>
      {/* LEFT COLUMN: Main Article Content Skeleton */}
      <article className="w-full max-w-none">
        {/* Header Section */}
        <header className="mb-6">
          {/* Title skeleton */}
          <div className="mb-3 space-y-3">
            <SkeletonBox className="h-9 w-full bg-neutral-200 sm:h-10 dark:bg-neutral-800" />
            <SkeletonBox className="h-9 w-3/4 bg-neutral-200 sm:h-10 dark:bg-neutral-800" />
          </div>

          {/* Article type pill */}
          <SkeletonBox className="mb-3 h-6 w-24 bg-neutral-200 dark:bg-neutral-800" />

          {/* Subtitle skeleton */}
          <div className="mb-5 space-y-2">
            <SkeletonBox className="h-5 w-full bg-neutral-200 dark:bg-neutral-800" />
            <SkeletonBox className="h-5 w-2/3 bg-neutral-200 dark:bg-neutral-800" />
          </div>

          {/* Meta row: author, department, date, read time, back */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            {/* Author */}
            <div className="flex items-center gap-2">
              <SkeletonBox className="h-4 w-4 bg-neutral-200 sm:h-5 sm:w-5 dark:bg-neutral-800" />
              <SkeletonBox className="h-4 w-28 bg-neutral-200 sm:h-5 sm:w-32 dark:bg-neutral-800" />
            </div>
            {/* Department */}
            <div className="flex items-center gap-2">
              <SkeletonBox className="h-4 w-4 bg-neutral-200 sm:h-5 sm:w-5 dark:bg-neutral-800" />
              <SkeletonBox className="h-4 w-24 bg-neutral-200 sm:h-5 sm:w-28 dark:bg-neutral-800" />
            </div>
            {/* Date */}
            <div className="flex items-center gap-2">
              <SkeletonBox className="h-4 w-4 bg-neutral-200 sm:h-5 sm:w-5 dark:bg-neutral-800" />
              <SkeletonBox className="h-4 w-20 bg-neutral-200 sm:h-5 sm:w-24 dark:bg-neutral-800" />
            </div>
            {/* Read time */}
            <div className="flex items-center gap-2">
              <SkeletonBox className="h-4 w-4 bg-neutral-200 sm:h-5 sm:w-5 dark:bg-neutral-800" />
              <SkeletonBox className="h-4 w-16 bg-neutral-200 sm:h-5 sm:w-20 dark:bg-neutral-800" />
            </div>
            {/* Back button */}
            <div className="flex items-center gap-2">
              <SkeletonBox className="h-4 w-4 bg-neutral-200 sm:h-5 sm:w-5 dark:bg-neutral-800" />
              <SkeletonBox className="h-4 w-16 bg-neutral-200 sm:h-5 sm:w-20 dark:bg-neutral-800" />
            </div>
          </div>
        </header>

        {/* Top Divider */}
        <div className="mb-8 h-px bg-linear-to-r from-transparent via-neutral-300 to-transparent sm:mb-12 dark:via-neutral-700" />

        {/* Content skeleton — headings + paragraphs */}
        <div className="max-w-none space-y-6">
          <SkeletonBox className="h-7 w-1/2 bg-neutral-200 sm:h-8 dark:bg-neutral-800" />
          <div className="space-y-3">
            <SkeletonBox className="h-5 w-full bg-neutral-200 sm:h-6 dark:bg-neutral-800" />
            <SkeletonBox className="h-5 w-full bg-neutral-200 sm:h-6 dark:bg-neutral-800" />
            <SkeletonBox className="h-5 w-5/6 bg-neutral-200 sm:h-6 dark:bg-neutral-800" />
          </div>
          <div className="space-y-3">
            <SkeletonBox className="h-5 w-full bg-neutral-200 sm:h-6 dark:bg-neutral-800" />
            <SkeletonBox className="h-5 w-full bg-neutral-200 sm:h-6 dark:bg-neutral-800" />
            <SkeletonBox className="h-5 w-4/5 bg-neutral-200 sm:h-6 dark:bg-neutral-800" />
          </div>
          <SkeletonBox className="h-7 w-2/5 bg-neutral-200 sm:h-8 dark:bg-neutral-800" />
          <div className="space-y-3">
            <SkeletonBox className="h-5 w-full bg-neutral-200 sm:h-6 dark:bg-neutral-800" />
            <SkeletonBox className="h-5 w-full bg-neutral-200 sm:h-6 dark:bg-neutral-800" />
            <SkeletonBox className="h-5 w-full bg-neutral-200 sm:h-6 dark:bg-neutral-800" />
            <SkeletonBox className="h-5 w-3/4 bg-neutral-200 sm:h-6 dark:bg-neutral-800" />
          </div>
          <SkeletonBox className="h-7 w-3/5 bg-neutral-200 sm:h-8 dark:bg-neutral-800" />
          <div className="space-y-3">
            <SkeletonBox className="h-5 w-full bg-neutral-200 sm:h-6 dark:bg-neutral-800" />
            <SkeletonBox className="h-5 w-full bg-neutral-200 sm:h-6 dark:bg-neutral-800" />
            <SkeletonBox className="h-5 w-11/12 bg-neutral-200 sm:h-6 dark:bg-neutral-800" />
          </div>
        </div>

        {/* Bottom Divider */}
        <div className="mt-12 h-px bg-linear-to-r from-transparent via-neutral-300 to-transparent sm:mt-16 dark:via-neutral-700" />
      </article>

      {/* RIGHT COLUMN: TOC Skeleton */}
      <TOCSidebarSkeleton />
    </div>
  );
};

export default ViewArticleSkeleton;
