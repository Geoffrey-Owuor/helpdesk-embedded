import SkeletonBox from "@/components/Skeletons/SkeletonBox";

const IssueDetailsSkeleton = () => {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* --- HEADER SECTION SKELETON --- */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div className="flex flex-col gap-3">
          {/* Title */}
          <SkeletonBox className="h-8 w-64 md:w-96" />

          {/* Meta Data Row (Ref ID, Date, Status) */}
          <div className="flex items-center gap-3">
            <SkeletonBox className="h-5 w-24" />
            <SkeletonBox className="h-1 w-1 rounded-full" />
            <SkeletonBox className="h-5 w-32" />
            <SkeletonBox className="h-1 w-1 rounded-full" />
            <SkeletonBox className="h-6 w-28 rounded-full" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <SkeletonBox className="h-10 w-10 rounded-full" />{" "}
          {/* Refresh Icon */}
          <SkeletonBox className="h-10 w-24 rounded-xl" /> {/* Back Button */}
        </div>
      </div>

      {/* --- DETAILS GRID SKELETON (3 Cards) --- */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {[1, 2, 3].map((index) => (
          <div
            key={index}
            className="flex flex-col rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-950"
          >
            {/* Card Header */}
            <div className="mb-4 flex items-center gap-3 border-b border-neutral-100 pb-3 dark:border-neutral-900">
              <SkeletonBox className="h-10 w-10 rounded-lg" />
              <div className="flex flex-col gap-1.5">
                <SkeletonBox className="h-4 w-32" />
              </div>
            </div>

            {/* Card Content Blocks */}
            <div className="flex flex-col gap-5.5">
              <div>
                <SkeletonBox className="mb-1.5 h-4 w-20" />
                <SkeletonBox className="h-5 w-40" />
              </div>
              <div>
                <SkeletonBox className="mb-1.5 h-4 w-20" />
                <SkeletonBox className="h-5 w-32" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- DESCRIPTION SECTION SKELETON --- */}
      <div className="mb-6 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SkeletonBox className="h-8 w-8 rounded-full" />
            <SkeletonBox className="h-6 w-32" />
          </div>
        </div>

        {/* Paragraph Lines */}
        <div className="space-y-3">
          <SkeletonBox className="h-4 w-full" />
          <SkeletonBox className="h-4 w-full" />
          <SkeletonBox className="h-4 w-11/12" />
          <SkeletonBox className="h-4 w-3/4" />
        </div>
      </div>

      {/* --- COMMENTS SECTION SKELETON --- */}
      <div className="max-w-3xl rounded-xl border border-neutral-200 p-6 shadow-sm dark:border-neutral-800">
        {/* Comments Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SkeletonBox className="h-8 w-8 rounded-full" />
            <SkeletonBox className="h-6 w-40" />
          </div>
          <SkeletonBox className="h-9 w-32 rounded-xl" />
        </div>

        {/* Input Field Area */}
        <SkeletonBox className="mb-8 h-14 w-full rounded-full" />

        {/* Comments List */}
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-4">
              {/* Avatar */}
              <SkeletonBox className="h-8 w-8 shrink-0 rounded-full" />

              {/* Comment Bubble */}
              <div className="flex-1 rounded-2xl rounded-tl-none border border-neutral-100 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
                <div className="mb-3 flex justify-between">
                  <SkeletonBox className="h-4 w-32" /> {/* Name */}
                  <SkeletonBox className="h-3 w-20" /> {/* Date */}
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
    </div>
  );
};

export default IssueDetailsSkeleton;
