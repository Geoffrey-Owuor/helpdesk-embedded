import SkeletonBox from "./SkeletonBox";

const bar = "bg-neutral-200 dark:bg-neutral-800";

const TOCSidebarSkeleton = ({ stickyTop }: { stickyTop: string }) => (
  <div
    className={`sticky ${stickyTop} hidden w-60 shrink-0 flex-col self-start lg:flex xl:w-64`}
  >
    <SkeletonBox className={`mb-4 h-3 w-24 ${bar}`} />
    <div className="space-y-4 border-l border-neutral-200 pl-4 dark:border-neutral-800">
      {["w-full", "w-3/4", "w-5/6", "w-full", "w-4/5", "w-2/3"].map((w, i) => (
        <SkeletonBox key={i} className={`h-3.5 ${w} ${bar}`} />
      ))}
    </div>
  </div>
);

const paragraph = (widths: string[]) => (
  <div className="space-y-3">
    {widths.map((w, i) => (
      <SkeletonBox key={i} className={`h-5 ${w} sm:h-6 ${bar}`} />
    ))}
  </div>
);

// Mirrors ViewArticle: back link, type pill, title, subtitle, meta row,
// divider, body, with the TOC rail on large screens
const ViewArticleSkeleton = ({ isInDashboard }: { isInDashboard: boolean }) => {
  const paddingX = isInDashboard ? "" : "custom:px-8";
  const stickyTop = isInDashboard ? "top-6" : "top-22";

  return (
    <div
      className={`mb-8 flex justify-center gap-10 px-4 py-6 md:py-8 xl:gap-16 ${paddingX}`}
      aria-hidden
    >
      <div className="w-full max-w-3xl min-w-0">
        <div className="mb-8">
          <SkeletonBox className={`mb-6 h-4 w-20 ${bar}`} />
          <SkeletonBox className={`mb-4 h-6 w-14 rounded-full ${bar}`} />
          <div className="mb-3 space-y-3">
            <SkeletonBox className={`h-9 w-full sm:h-10 ${bar}`} />
            <SkeletonBox className={`h-9 w-2/3 sm:h-10 ${bar}`} />
          </div>
          <SkeletonBox className={`mb-6 h-6 w-3/4 ${bar}`} />
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {["w-28", "w-24", "w-32", "w-20"].map((w, i) => (
              <div key={i} className="flex items-center gap-2">
                <SkeletonBox className={`h-4 w-4 ${bar}`} />
                <SkeletonBox className={`h-4 ${w} ${bar}`} />
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8 h-px bg-neutral-200 dark:bg-neutral-800" />

        <div className="space-y-6">
          {paragraph(["w-full", "w-full", "w-5/6"])}
          {paragraph(["w-full", "w-full", "w-4/5"])}
          <SkeletonBox className={`h-56 w-full rounded-xl ${bar}`} />
          <SkeletonBox className={`h-7 w-1/2 sm:h-8 ${bar}`} />
          {paragraph(["w-full", "w-full", "w-full", "w-3/4"])}
          <SkeletonBox className={`h-7 w-2/5 sm:h-8 ${bar}`} />
          {paragraph(["w-full", "w-full", "w-11/12"])}
        </div>
      </div>

      <TOCSidebarSkeleton stickyTop={stickyTop} />
    </div>
  );
};

export default ViewArticleSkeleton;
