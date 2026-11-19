"use client";
import Link from "next/link";
import {
  Calendar,
  Clock,
  UserRound,
  Search,
  Building2,
  PenLine,
} from "lucide-react";
import { dateFormatter } from "@/lib/assets";
import { ArticlesCardValues } from "@/serverActions/GetUserArticles";
import { JSX, useState } from "react";
import { usePathname } from "next/navigation";
import ArticleTypeFormatter from "./ArticleTypeFormatter";
import ArticleEditModal from "./ArticleEditModal";

type ArticleCardsProps = {
  currentArticles: ArticlesCardValues[];
  searchQuery: string;
  highlightText: (
    text: string,
    query: string,
  ) => string | (string | JSX.Element)[];
  getPreviewText: (content: string) => string;
  userId?: string;
  // Super admins can edit anyone's article, like update-article allows
  isSuper?: boolean;
};

const ArticleCardsView = ({
  currentArticles,
  searchQuery,
  highlightText,
  getPreviewText,
  userId,
  isSuper = false,
}: ArticleCardsProps) => {
  const [modalId, setModalId] = useState("");

  const pathname = usePathname();
  const baseLink =
    pathname === "/articles" ? "/articles" : "/dashboard/articles";

  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {currentArticles.length > 0 ? (
        currentArticles.map((article) => (
          <article
            key={article.article_id}
            className="flex flex-col rounded-xl border border-neutral-200 bg-white p-6 shadow-xs transition-shadow hover:border-neutral-300 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-neutral-700"
          >
            {/* Title */}
            <div className="flex items-center justify-between">
              <h2
                title={article.article_title}
                className="mb-3 line-clamp-1 text-lg font-semibold text-neutral-900 dark:text-white"
              >
                {highlightText(article.article_title, searchQuery)}
              </h2>
              {/* The edit button */}
              {(userId === article.user_id || isSuper) && article.can_edit && (
                <>
                  <button
                    type="button"
                    onClick={() => setModalId(article.article_id)}
                    className="rounded-full p-2 hover:bg-neutral-200/50 dark:hover:bg-neutral-800"
                  >
                    <PenLine className="h-4 w-4" />
                  </button>

                  {/* Edit Modal */}
                  {modalId === article.article_id && (
                    <ArticleEditModal
                      closeModal={() => setModalId("")}
                      isModalOpen={modalId === article.article_id}
                      articleData={{
                        articleKey: article.article_id,
                        articleTitle: article.article_title,
                        articleSubtitle: article.article_subtitle,
                        articleContent: article.article_content,
                        articleType: article.article_type,
                      }}
                    />
                  )}
                </>
              )}
            </div>

            {/* Meta information */}
            <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-neutral-600 dark:text-neutral-400">
              <span className="flex items-center gap-1.5">
                <UserRound className="h-4 w-4" />
                <span className="mt-0.5">{article.user_name}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span className="mt-0.5">
                  {dateFormatter(article.article_updated_at)}
                </span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span className="mt-0.5">{article.article_read_time}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4" />
                <span className="mt-0.5">{article.user_department}</span>
              </span>
            </div>

            {/* Content preview */}
            <p className="mb-6 line-clamp-4 grow text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
              {getPreviewText(article.article_content)}
            </p>

            {/* Read more button and article type will go here */}
            <div className="flex items-center justify-between">
              <ArticleTypeFormatter type={article.article_type} />
              <Link
                href={`${baseLink}/${article.article_id}`}
                className="w-fit text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Read more...
              </Link>
            </div>
          </article>
        ))
      ) : (
        <div className="col-span-full flex min-h-60 flex-col items-center justify-center rounded-xl text-center">
          <div className="flex max-w-md flex-col items-center gap-4 px-4 text-neutral-500 dark:text-neutral-400">
            <Search className="h-12 w-12" />
            <p className="text-lg">
              No article titles matching your search, try searching something
              else.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleCardsView;
