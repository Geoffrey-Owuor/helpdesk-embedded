import SkeletonBox from "./SkeletonBox";
const IssuesCardsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, index) => (
        <SkeletonBox
          key={index}
          className="h-36 w-full bg-gray-100 dark:bg-neutral-900"
        />
      ))}
    </div>
  );
};

export default IssuesCardsSkeleton;
