"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const AutomationsPage = () => {
  const router = useRouter();
  return (
    <>
      <div>The AutomationsPage</div>
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 rounded-xl bg-neutral-200 px-3 py-2 dark:bg-neutral-800"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>back</span>
      </button>
    </>
  );
};

export default AutomationsPage;
