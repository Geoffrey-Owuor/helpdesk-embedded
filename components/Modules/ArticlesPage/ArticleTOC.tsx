"use client";
import { generateSlug } from "@/utils/GenerateSlug";
import { useEffect, useState } from "react";
import SkeletonBox from "@/components/Skeletons/SkeletonBox";

type ArticleTOCProps = {
  content: string;
  containerId: string;
};

const ArticleTOCSkeleton = () => (
  <nav className="sticky top-12 hidden max-h-[calc(100vh-5rem)] w-70 shrink-0 flex-col overflow-y-auto rounded-xl p-4 lg:flex">
    <div className="mb-4 border-b-2 border-neutral-200 pb-2 dark:border-neutral-800">
      <SkeletonBox className="h-3.5 w-24 bg-neutral-200 dark:bg-neutral-800" />
    </div>
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

const ArticleTOC = ({ content, containerId }: ArticleTOCProps) => {
  const [headings, setHeadings] = useState<{ text: string; id: string }[]>([]);
  const [headingsLoading, setHeadingsLoading] = useState(true);
  const [activeId, setActiveId] = useState("");

  // Extract h2 headings from markdown content
  useEffect(() => {
    const handleHeadingsPopulation = () => {
      if (!content) {
        setHeadingsLoading(false);
        return;
      }

      setHeadingsLoading(true);

      try {
        // Match ## headings (h2), not ### (h3)
        const regex = /^##\s+(.+)$/gm;
        const matches: { text: string; id: string }[] = [];
        let match;

        while ((match = regex.exec(content)) !== null) {
          matches.push({
            text: match[1],
            id: generateSlug(match[1]),
          });
        }

        setHeadings(matches);
      } catch (error) {
        console.error(error);
      } finally {
        setHeadingsLoading(false);
      }
    };

    handleHeadingsPopulation();
  }, [content]);

  // Track scroll position to highlight the active heading
  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (headings.length === 0) return;

    let ticking = false;

    const doScrollMath = () => {
      if (window.innerWidth < 1024) return;

      const headingElements = headings
        .map((h) => document.getElementById(h.id))
        .filter(Boolean) as HTMLElement[];

      if (headingElements.length === 0) return;

      const offset = 50;
      let currentActiveId = "";

      for (let i = headingElements.length - 1; i >= 0; i--) {
        const rect = headingElements[i].getBoundingClientRect();
        if (rect.top <= offset) {
          currentActiveId = headingElements[i].id;
          break;
        }
      }

      setActiveId(currentActiveId);
      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        ticking = true;
        setTimeout(doScrollMath, 50);
      }
    };

    doScrollMath();
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [headings, containerId]);

  if (headingsLoading) return <ArticleTOCSkeleton />;

  return (
    <nav className="sticky top-12 hidden max-h-[calc(100vh-2rem)] w-70 shrink-0 flex-col overflow-y-auto rounded-xl p-4 lg:flex">
      <h4 className="mb-4 border-b-2 border-neutral-300 pb-2 text-sm font-bold tracking-wider text-neutral-500 uppercase dark:border-neutral-600 dark:text-neutral-400">
        On this page
      </h4>
      <ul className="space-y-3">
        {headings.length === 0 ? (
          <li>
            <p className="px-3 py-2 text-sm text-neutral-400 italic dark:text-neutral-500">
              No headings found
            </p>
          </li>
        ) : (
          headings.map((heading, index) => (
            <li key={index}>
              <a
                href={`#${heading.id}`}
                className={`block rounded-xl px-3 py-2 text-sm text-wrap transition-colors ${
                  activeId === heading.id
                    ? "bg-neutral-100 font-medium text-neutral-900 dark:bg-neutral-800 dark:text-white"
                    : "text-neutral-500 hover:text-neutral-800 hover:underline dark:text-neutral-400 dark:hover:text-neutral-200"
                }`}
              >
                {heading.text}
              </a>
            </li>
          ))
        )}
      </ul>
    </nav>
  );
};

export default ArticleTOC;
