"use client";
import { ComponentPropsWithoutRef, MouseEvent } from "react";
import { Link2 } from "lucide-react";
import { useAlertStore } from "@/store/useAlertStore";
import { copyText } from "@/utils/copyText";

type HeadingProps = ComponentPropsWithoutRef<"h2"> & {
  level: 2 | 3;
};

// A section heading with a link to itself: shown on hover or keyboard focus
// (always, faintly, on touch screens). Clicking it jumps to the section and
// copies the section's address to share.
const MarkdownHeading = ({ level, id, children, ...props }: HeadingProps) => {
  const triggerAlert = useAlertStore((state) => state.triggerAlert);
  const Tag = level === 2 ? "h2" : "h3";

  // No id (or the screen-reader-only footnotes label): a plain heading
  if (!id || props.className?.includes("sr-only")) {
    return (
      <Tag id={id} {...props}>
        {children}
      </Tag>
    );
  }

  const handleClick = async (e: MouseEvent<HTMLAnchorElement>) => {
    // Let ctrl/cmd-click open a new tab as usual
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    const url = new URL(window.location.href);
    url.hash = id;
    try {
      await copyText(url.toString());
      triggerAlert("success", "Link to this section copied");
    } catch {
      // Copy is a bonus; the jump to the section still happens
    }
  };

  return (
    <Tag id={id} {...props} className="group">
      {children}
      <a
        href={`#${id}`}
        onClick={handleClick}
        aria-label="Copy link to this section"
        title="Copy link to this section"
        className="heading-anchor not-prose ml-2 inline-flex translate-y-[-0.1em] items-center rounded-md p-1 align-middle text-neutral-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-neutral-900 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:outline-none dark:text-neutral-500 dark:hover:text-white [@media(hover:none)]:opacity-60"
      >
        <Link2 className="h-[0.75em] w-[0.75em]" aria-hidden />
      </a>
    </Tag>
  );
};

export default MarkdownHeading;
