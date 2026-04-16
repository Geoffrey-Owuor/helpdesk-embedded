"use client";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { UserRound, Calendar, Clock, Building2, ArrowLeft } from "lucide-react";
import { getArticle } from "@/serverActions/GetArticle";
import ArticleTypeFormatter from "./ArticleTypeFormatter";
import { dateFormatter } from "@/public/assets";
import { generateSlug } from "@/utils/GenerateSlug";
import ArticleTOC from "./ArticleTOC";
import ViewArticleSkeleton from "@/components/Skeletons/ViewArticleSkeleton";

type ViewArticleProps = {
  uuid: string;
};

const ViewArticle = ({ uuid }: ViewArticleProps) => {
  const router = useRouter();

  const { data: article, isPending: loading } = useQuery({
    queryKey: ["ArticleDataInfo", uuid],
    queryFn: async () => getArticle(uuid),
  });

  // Custom renderer — adds IDs to h2 headings for TOC anchor linking
  const MarkdownComponents: Components = {
    h2: ({ children, ...props }) => {
      const text = children?.toString() || "";
      const id = generateSlug(text);
      return (
        <h2 id={id} style={{ scrollMarginTop: "6rem" }} {...props}>
          {children}
        </h2>
      );
    },
  };

  if (loading) return <ViewArticleSkeleton />;

  // Empty / not-found state
  if (!article || Object.keys(article).length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-5xl flex-col items-center justify-center px-5 py-24 sm:px-6 lg:px-16">
        <div className="text-center">
          <h2 className="mb-4 text-3xl font-bold text-neutral-900 dark:text-white">
            Article Not Found
          </h2>
          <p className="mb-8 text-neutral-600 dark:text-neutral-400">
            The article you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-3 font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
          >
            <ArrowLeft className="h-5 w-5" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col px-3 py-6 lg:flex-row lg:gap-6">
      <article className="w-full max-w-none">
        {/* Header Section */}
        <header className="mb-6">
          {/* Article type pill */}
          <div className="mb-4">
            <ArticleTypeFormatter type={article.article_type} />
          </div>

          {/* Title */}
          <h1 className="mb-3 text-3xl leading-tight font-bold text-neutral-900 sm:text-4xl dark:text-white">
            {article.article_title}
          </h1>

          {/* Subtitle */}
          {article.article_subtitle && (
            <p className="mb-5 text-lg text-neutral-500 dark:text-neutral-400">
              {article.article_subtitle}
            </p>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600 sm:gap-6 sm:text-base dark:text-neutral-400">
            <div className="flex items-center gap-2">
              <UserRound className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="font-medium">{article.user_name}</span>
            </div>

            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>{article.user_department}</span>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>{dateFormatter(article.article_updated_at)}</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>{article.article_read_time}</span>
            </div>

            <button
              onClick={() => router.back()}
              className="flex cursor-pointer items-center gap-2 transition-colors duration-200 hover:text-neutral-700 dark:hover:text-neutral-300"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Go back</span>
            </button>
          </div>
        </header>

        {/* Top Divider */}
        <div className="mb-8 h-px bg-linear-to-r from-transparent via-neutral-300 to-transparent sm:mb-12 dark:via-neutral-700" />

        {/* Content Section */}
        <div className="prose prose-lg dark:prose-invert prose-img:rounded-xl prose-headings:font-semibold prose-a:text-neutral-700 dark:prose-a:text-neutral-300 max-w-none wrap-break-word">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={MarkdownComponents}
          >
            {article.article_content}
          </ReactMarkdown>
        </div>

        {/* Bottom Divider */}
        <div className="mt-12 h-px bg-linear-to-r from-transparent via-neutral-300 to-transparent sm:mt-16 dark:via-neutral-700" />
      </article>

      {/* Sidebar TOC — only visible on large screens */}
      <ArticleTOC content={article.article_content} />
    </div>
  );
};

export default ViewArticle;
