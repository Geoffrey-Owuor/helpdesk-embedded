"use client";

import { useLoadingStore } from "@/store/useLoadingStore";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// Mounted fresh each time the line appears. It paints at 10%, then a long decelerating transition
// toward 90% stands in for an interval-driven trickle; on finish, the shorter transition takes over
// from wherever the bar currently is
const Bar = ({ finishing }: { finishing: boolean }) => {
  const [creeping, setCreeping] = useState(false);

  // Wait for the 10% frame to paint, otherwise there is nothing for the transition to start from
  useEffect(() => {
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => setCreeping(true));
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const scale = finishing
    ? "scale-x-100 duration-200 ease-out"
    : creeping
      ? "scale-x-90 duration-[10s] ease-[cubic-bezier(0.1,0.7,0.3,1)]"
      : "scale-x-10";

  return (
    <div
      role="progressbar"
      aria-label="Loading page"
      className={`fixed top-0 left-0 z-100 h-[0.15rem] w-full bg-transparent transition-opacity duration-200 motion-reduce:transition-none ${finishing ? "opacity-0 delay-200" : "opacity-100"}`}
    >
      <div
        className={`h-full origin-left bg-linear-to-r from-blue-800 via-blue-700 to-blue-500 transition-transform motion-reduce:transition-none dark:from-blue-700 dark:via-blue-600 dark:to-blue-400 ${scale}`}
      />
    </div>
  );
};

const LoadingLine = () => {
  const pathname = usePathname();
  const search = useSearchParams().toString();

  // Loading store data
  const phase = useLoadingStore((state) => state.phase);
  const finishLoadingLine = useLoadingStore((state) => state.finishLoadingLine);

  // The new URL has rendered
  useEffect(() => {
    finishLoadingLine();
  }, [pathname, search, finishLoadingLine]);

  if (phase !== "visible" && phase !== "finishing") return null;

  return <Bar finishing={phase === "finishing"} />;
};

export default LoadingLine;
