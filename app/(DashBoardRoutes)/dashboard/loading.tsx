import { Loader2 } from "lucide-react";

const Loading = () => {
  return (
    <div className="fixed inset-0 z-9999 flex h-screen items-center justify-center bg-white dark:bg-black">
      {/* The Loader icon spinner*/}
      <Loader2
        className="h-10 w-10 animate-spin text-neutral-900 dark:text-white"
        aria-label="overlay text"
      />
    </div>
  );
};

export default Loading;
