const SuspenseSkeleton = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <div className="mb-4 h-10 w-10 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent dark:border-neutral-100" />
      <p className="text-lg">Loading...</p>
    </div>
  );
};

export default SuspenseSkeleton;
