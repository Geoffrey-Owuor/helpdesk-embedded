import SkeletonBox from "./SkeletonBox";

const IssuesDocsSkeleton = () => {
  // Simulating 2 departments, each with 3 issue types for the loading state
  const mockDepartments = [1, 2];
  const mockIssues = [1, 2, 3];

  return (
    <div className="grid w-full grid-cols-1 gap-10">
      {mockDepartments.map((deptIndex) => (
        <div key={deptIndex}>
          {/* Department Header Skeleton */}
          <div className="mb-6 flex items-center gap-2">
            <SkeletonBox className="h-6 w-6 rounded-md" />
            <SkeletonBox className="h-7 w-48 rounded-md sm:w-64" />
          </div>

          {/* Issue List Skeleton */}
          <div className="relative">
            <div className="space-y-4">
              {mockIssues.map((issueIndex) => (
                <div
                  key={issueIndex}
                  className="w-full rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-950"
                >
                  <div className="flex items-start gap-4">
                    {/* Number / Icon Area Skeleton */}
                    <SkeletonBox className="h-10 w-10 shrink-0 rounded-full" />

                    {/* Text / Title Area Skeleton */}
                    <div className="flex flex-1 items-center justify-between">
                      <div className="flex w-full items-center gap-2">
                        <SkeletonBox className="h-4 w-5 shrink-0 rounded-md" />
                        <SkeletonBox className="h-4 w-32 rounded-md sm:w-48" />
                      </div>

                      {/* Chevron Skeleton */}
                      <SkeletonBox className="h-4 w-4 shrink-0 rounded-sm" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default IssuesDocsSkeleton;
