"use client";
import { useQuery } from "@tanstack/react-query";
import { UserRound, Calendar, Clock, Building2, ArrowLeft } from "lucide-react";
import { getArticle } from "@/serverActions/GetArticle";
import ArticleTypeFormatter from "./ArticleTypeFormatter";
import { dateFormatter } from "@/lib/assets";
import {
  ArticleTocInline,
  ArticleTocSidebar,
  useArticleToc,
} from "./ArticleTOC";
import MarkdownContent from "./MarkdownContent";
import { usePathname } from "next/navigation";
import ViewArticleSkeleton from "@/components/Skeletons/ViewArticleSkeleton";
import Link from "next/link";

type ViewArticleProps = {
  uuid: string;
};

const BODY_ID = "article-body";

// Layout values for the two places an article is shown
const LAYOUTS = {
  dashboard: {
    containerId: "main-content",
    backTo: "/dashboard/articles",
    backLabel: "Articles",
    paddingX: "",
    stickyTop: "top-6",
    // Space left above a heading when jumping to it
    headingOffset: "[--heading-offset:1.5rem]",
  },
  public: {
    containerId: "article-content",
    backTo: "/articles",
    backLabel: "Knowledge Base",
    paddingX: "custom:px-8",
    // Clear the sticky 4rem HomeNavBar
    stickyTop: "top-22",
    headingOffset: "[--heading-offset:5.5rem]",
  },
} as const;

const ViewArticle = ({ uuid }: ViewArticleProps) => {
  const pathname = usePathname();
  const isInDashboard = pathname.includes("/dashboard/articles");
  const layout = LAYOUTS[isInDashboard ? "dashboard" : "public"];

  const { data: article, isPending: loading } = useQuery({
    queryKey: ["ArticleDataInfo", uuid],
    queryFn: async () => getArticle(uuid),
  });

  const { headings, activeId } = useArticleToc(
    article?.article_content,
    BODY_ID,
    layout.containerId,
  );

  if (loading) return <ViewArticleSkeleton isInDashboard={isInDashboard} />;

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
          <Link
            href={layout.backTo}
            className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-3 font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
          >
            <ArrowLeft className="h-5 w-5" />
            Go Back
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`mb-8 flex justify-center gap-10 px-4 py-6 md:py-8 xl:gap-16 ${layout.paddingX} ${layout.headingOffset}`}
    >
      {/* ~72 characters a line at the article's text size */}
      <article className="w-full max-w-3xl min-w-0">
        <header className="mb-8">
          <Link
            href={layout.backTo}
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {layout.backLabel}
          </Link>

          <div className="mb-4">
            <ArticleTypeFormatter type={article.article_type} />
          </div>

          <h1 className="mb-3 text-3xl leading-tight font-bold tracking-tight text-balance text-neutral-900 sm:text-4xl dark:text-white">
            {article.article_title}
          </h1>

          {article.article_subtitle && (
            <p className="mb-6 text-lg text-pretty text-neutral-500 dark:text-neutral-400">
              {article.article_subtitle}
            </p>
          )}

          <dl className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-neutral-600 dark:text-neutral-400">
            <div className="flex items-center gap-2">
              <dt>
                <UserRound className="h-4 w-4" aria-hidden />
                <span className="sr-only">Author</span>
              </dt>
              <dd className="font-medium text-neutral-900 dark:text-neutral-100">
                {article.user_name}
              </dd>
            </div>

            <div className="flex items-center gap-2">
              <dt>
                <Building2 className="h-4 w-4" aria-hidden />
                <span className="sr-only">Department</span>
              </dt>
              <dd>{article.user_department}</dd>
            </div>

            <div className="flex items-center gap-2">
              <dt>
                <Calendar className="h-4 w-4" aria-hidden />
                <span className="sr-only">Last updated</span>
              </dt>
              <dd>
                <span aria-hidden>Updated </span>
                {dateFormatter(article.article_updated_at)}
              </dd>
            </div>

            <div className="flex items-center gap-2">
              <dt>
                <Clock className="h-4 w-4" aria-hidden />
                <span className="sr-only">Reading time</span>
              </dt>
              <dd>{article.article_read_time}</dd>
            </div>
          </dl>
        </header>

        <div className="mb-8 h-px bg-neutral-200 dark:bg-neutral-800" />

        <ArticleTocInline headings={headings} />

        <MarkdownContent id={BODY_ID} content={article.article_content} />

        <footer className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 pt-6 text-sm text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
          <span>Last updated {dateFormatter(article.article_updated_at)}</span>
          <Link
            href={layout.backTo}
            className="inline-flex items-center gap-1.5 transition-colors hover:text-neutral-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to {layout.backLabel}
          </Link>
        </footer>
      </article>

      <ArticleTocSidebar
        headings={headings}
        activeId={activeId}
        containerId={layout.containerId}
        stickyTopClass={layout.stickyTop}
      />
    </div>
  );
};

export default ViewArticle;
