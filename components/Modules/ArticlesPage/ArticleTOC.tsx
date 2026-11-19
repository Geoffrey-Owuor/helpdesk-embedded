"use client";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, ArrowUp } from "lucide-react";

export type TocHeading = { id: string; text: string };

// Where a heading counts as "reached": just below the top of the scroller
const ACTIVE_OFFSET = 120;

// The article's h2 headings, read from the rendered body so the TOC matches
// what's on the page (no ## lines from code blocks, no raw Markdown in the
// text, the same deduplicated ids), and the one the reader is in.
export const useArticleToc = (
  content: string | undefined,
  bodyId: string,
  containerId: string,
) => {
  const [headings, setHeadings] = useState<TocHeading[]>([]);
  const [activeId, setActiveId] = useState("");

  // The body is committed before effects run, so it's already in the DOM
  useEffect(() => {
    const collectHeadings = () => {
      const body = document.getElementById(bodyId);
      const found = body
        ? [...body.querySelectorAll<HTMLHeadingElement>("h2[id]:not(.sr-only)")]
        : [];
      setHeadings(
        found.map((h) => ({ id: h.id, text: h.textContent?.trim() ?? "" })),
      );
    };

    collectHeadings();
  }, [content, bodyId]);

  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container || headings.length === 0) return;

    let frame = 0;

    const updateActive = () => {
      frame = 0;
      const elements = headings
        .map((h) => document.getElementById(h.id))
        .filter((el): el is HTMLElement => !!el);
      if (elements.length === 0) return;

      // At the very bottom the last sections may be too short to reach the
      // offset, so the last heading wins
      const atBottom =
        container.scrollTop + container.clientHeight >=
        container.scrollHeight - 4;
      if (atBottom) {
        setActiveId(elements[elements.length - 1].id);
        return;
      }

      const top = container.getBoundingClientRect().top;
      let current = "";
      for (const el of elements) {
        if (el.getBoundingClientRect().top - top <= ACTIVE_OFFSET) {
          current = el.id;
        } else {
          break;
        }
      }
      setActiveId(current);
    };

    const handleScroll = () => {
      if (!frame) frame = requestAnimationFrame(updateActive);
    };

    updateActive();
    container.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      cancelAnimationFrame(frame);
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [headings, containerId]);

  return { headings, activeId };
};

const scrollToTop = (containerId: string) => {
  document.getElementById(containerId)?.scrollTo({ top: 0 });
};

type ArticleTocProps = {
  headings: TocHeading[];
  activeId: string;
  containerId: string;
  // Sticky offset below a sticky navbar (the public page has one)
  stickyTopClass: string;
};

// Desktop: sticky rail beside the article, with the reader's section marked
export const ArticleTocSidebar = ({
  headings,
  activeId,
  containerId,
  stickyTopClass,
}: ArticleTocProps) => {
  const listRef = useRef<HTMLUListElement>(null);

  // Keep the active entry visible in a TOC taller than the screen, without
  // scrollIntoView (it would also scroll the page)
  useEffect(() => {
    const list = listRef.current;
    const item = list?.querySelector<HTMLElement>('[aria-current="location"]');
    if (!list || !item) return;
    const itemTop = item.offsetTop - list.offsetTop;
    if (itemTop < list.scrollTop) {
      list.scrollTop = itemTop - 8;
    } else if (
      itemTop + item.offsetHeight >
      list.scrollTop + list.clientHeight
    ) {
      list.scrollTop = itemTop + item.offsetHeight - list.clientHeight + 8;
    }
  }, [activeId]);

  if (headings.length === 0) return null;

  return (
    <nav
      aria-label="On this page"
      className={`sticky ${stickyTopClass} hidden max-h-[calc(100dvh-8rem)] w-60 shrink-0 flex-col self-start lg:flex xl:w-64`}
    >
      <p className="mb-3 text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
        On this page
      </p>
      <ul
        ref={listRef}
        className="small-scrollbar relative min-h-0 flex-1 overflow-y-auto border-l border-neutral-200 dark:border-neutral-800"
      >
        {headings.map((heading) => {
          const isActive = activeId === heading.id;
          return (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                aria-current={isActive ? "location" : undefined}
                className={`-ml-px block border-l-2 py-1.5 pr-2 pl-4 text-sm leading-snug transition-colors ${
                  isActive
                    ? "border-neutral-900 font-medium text-neutral-900 dark:border-white dark:text-white"
                    : "border-transparent text-neutral-500 hover:border-neutral-400 hover:text-neutral-900 dark:text-neutral-400 dark:hover:border-neutral-500 dark:hover:text-neutral-100"
                }`}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        onClick={() => scrollToTop(containerId)}
        className="mt-4 inline-flex w-fit cursor-pointer items-center gap-1.5 text-sm text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
      >
        <ArrowUp className="h-4 w-4" aria-hidden />
        Back to top
      </button>
    </nav>
  );
};

// Phones and tablets: a collapsible list under the article header
export const ArticleTocInline = ({
  headings,
}: Pick<ArticleTocProps, "headings">) => {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  if (headings.length === 0) return null;

  return (
    <details
      ref={detailsRef}
      className="group mb-8 rounded-xl border border-neutral-200 lg:hidden dark:border-neutral-800"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-neutral-900 select-none dark:text-neutral-100 [&::-webkit-details-marker]:hidden">
        <span>
          On this page
          <span className="ml-2 text-neutral-500 dark:text-neutral-400">
            {headings.length} sections
          </span>
        </span>
        <ChevronDown
          className="h-4 w-4 text-neutral-500 transition-transform group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <ol className="small-scrollbar max-h-[50dvh] space-y-0.5 overflow-y-auto border-t border-neutral-200 px-2 py-2 dark:border-neutral-800">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              onClick={() => detailsRef.current?.removeAttribute("open")}
              className="block rounded-lg px-2 py-2 text-sm text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-white"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ol>
    </details>
  );
};
