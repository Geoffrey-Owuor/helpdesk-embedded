"use client";
import { ComponentPropsWithoutRef, useEffect, useRef, useState } from "react";
import type { Element } from "hast";
import { Check, Copy } from "lucide-react";
import { hastToText } from "@/lib/articles/markdownPlugins";
import { copyText } from "@/utils/copyText";

// Display names for the language tag after the opening ```
const LANGUAGE_NAMES: Record<string, string> = {
  bash: "Bash",
  sh: "Shell",
  shell: "Shell",
  zsh: "Shell",
  powershell: "PowerShell",
  ps1: "PowerShell",
  cmd: "Command Prompt",
  bat: "Batch",
  js: "JavaScript",
  javascript: "JavaScript",
  jsx: "JSX",
  ts: "TypeScript",
  typescript: "TypeScript",
  tsx: "TSX",
  py: "Python",
  python: "Python",
  json: "JSON",
  yaml: "YAML",
  yml: "YAML",
  xml: "XML",
  html: "HTML",
  css: "CSS",
  scss: "SCSS",
  sql: "SQL",
  pgsql: "PostgreSQL",
  md: "Markdown",
  markdown: "Markdown",
  java: "Java",
  csharp: "C#",
  cs: "C#",
  cpp: "C++",
  c: "C",
  go: "Go",
  rust: "Rust",
  php: "PHP",
  ruby: "Ruby",
  vb: "VB",
  vbnet: "VB.NET",
  ini: "INI",
  dockerfile: "Dockerfile",
  diff: "Diff",
  text: "Plain text",
  txt: "Plain text",
  plaintext: "Plain text",
};

const getLanguage = (node?: Element) => {
  const code = node?.children.find(
    (child): child is Element =>
      child.type === "element" && child.tagName === "code",
  );
  const classes = code?.properties?.className;
  const list = Array.isArray(classes) ? classes : [];
  const lang = list
    .map(String)
    .find((c) => c.startsWith("language-"))
    ?.slice("language-".length);
  if (!lang) return null;
  return LANGUAGE_NAMES[lang.toLowerCase()] ?? lang;
};

type MarkdownCodeBlockProps = ComponentPropsWithoutRef<"pre"> & {
  node?: Element;
};

// Fenced code block: one surface with a header (language + copy) and a
// horizontally scrolling body. Highlight colours come from the --code-*
// tokens in globals.css, so it follows light and dark mode.
const MarkdownCodeBlock = ({ node, children }: MarkdownCodeBlockProps) => {
  const [copied, setCopied] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const language = getLanguage(node);
  const code = node ? hastToText(node).replace(/\n$/, "") : "";

  const handleCopy = async () => {
    try {
      await copyText(code);
      setCopied("copied");
    } catch {
      setCopied("failed");
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied("idle"), 2000);
  };

  return (
    <figure className="md-code not-prose my-6 rounded-xl border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
      <figcaption className="flex h-10 items-center justify-between gap-3 border-b border-neutral-200 pr-1.5 pl-4 dark:border-neutral-800">
        <span className="truncate font-mono text-xs text-neutral-500 dark:text-neutral-400">
          {language ?? "Code"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied === "copied" ? "Copied" : "Copy code"}
          className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-200/70 hover:text-neutral-900 focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:outline-none dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
        >
          {copied === "copied" ? (
            <Check className="h-3.5 w-3.5" aria-hidden />
          ) : (
            <Copy className="h-3.5 w-3.5" aria-hidden />
          )}
          <span aria-live="polite">
            {copied === "copied"
              ? "Copied"
              : copied === "failed"
                ? "Copy failed"
                : "Copy"}
          </span>
        </button>
      </figcaption>
      <pre
        tabIndex={0}
        className="small-scrollbar overflow-x-auto p-4 font-mono text-[0.8125rem] leading-6 [--scrollbar-inset:0.75rem] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-neutral-400 sm:text-sm"
      >
        {children}
      </pre>
    </figure>
  );
};

export default MarkdownCodeBlock;
