const IssuesCardsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, index) => (
        <div
          key={index}
          className="details-shimmer h-36 w-full rounded-2xl bg-gray-100 dark:bg-neutral-900"
        />
      ))}
    </div>
  );
};

export default IssuesCardsSkeleton;
