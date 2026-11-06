import { indicatorChip } from "@/lib/indicatorStyles";

const articleLabels: Record<string, string> = {
  insight: "Insight",
  manual: "Manual",
  blog: "Blog",
};

const ArticleTypeFormatter = ({ type }: { type: string }) => (
  <span
    className={`inline-flex h-fit w-fit items-center rounded-full px-2.5 py-1 text-xs ${indicatorChip}`}
  >
    {articleLabels[type.toLowerCase()] ?? type}
  </span>
);

export default ArticleTypeFormatter;
