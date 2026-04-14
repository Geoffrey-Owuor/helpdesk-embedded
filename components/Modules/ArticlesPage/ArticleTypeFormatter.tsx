const articleStyles: Record<
  string,
  { bg: string; text: string; dot: string; label: string }
> = {
  news: {
    bg: "bg-purple-100 dark:bg-purple-900/40",
    text: "text-purple-800 dark:text-purple-200",
    dot: "bg-purple-500",
    label: "News",
  },
  manual: {
    bg: "bg-teal-100 dark:bg-teal-900/40",
    text: "text-teal-800 dark:text-teal-200",
    dot: "bg-teal-500",
    label: "Manual",
  },
  blog: {
    bg: "bg-pink-100 dark:bg-pink-900/40",
    text: "text-pink-800 dark:text-pink-200",
    dot: "bg-pink-500",
    label: "Blog",
  },
};

const ArticleTypeFormatter = ({ type }: { type: string }) => {
  const style = articleStyles[type.toLowerCase()] ?? {
    bg: "bg-neutral-100 dark:bg-neutral-800",
    text: "text-neutral-700 dark:text-neutral-300",
    dot: "bg-neutral-400",
    label: type,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ${style.bg} ${style.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
};

export default ArticleTypeFormatter;
