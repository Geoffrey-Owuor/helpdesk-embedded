"use client";

import { useState, useMemo, ChangeEvent } from "react";
import { ArticlesCardValues } from "@/serverActions/GetUserArticles";
import {
  FileSearchCorner,
  Lightbulb,
  PenLine,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import Pagination from "../IssuesData/Pagination";
import ArticleCardsView from "./ArticleCardsView";
import { useActiveTabStore } from "@/store/useActiveTabStore";
import { usePathname } from "next/navigation";

import ArticleCardsSkeleton from "@/components/Skeletons/ArticleCardsSkeleton";

type ArticlesCardDataProps = {
  articles: ArticlesCardValues[];
  loading: boolean;
  refetchData: () => Promise<void>;
  userId?: string;
};

const ArticlesCardData = ({
  articles,
  loading,
  refetchData,
  userId,
}: ArticlesCardDataProps) => {
  // Pathname
  const pathname = usePathname();

  const isInDashboard = pathname.includes("dashboard");

  // Search query states
  const [searchQuery, setSearchQuery] = useState("");
  const [articlesPerPage, setArticlesPerPage] = useState(6);
  const perPageOptions = [6, 12, 24, 48, 96, 192];

  const setActiveTab = useActiveTabStore((state) => state.setActiveTab);

  // Function to filter blogs based on blog title
  const filteredArticles = useMemo(() => {
    if (!searchQuery) return articles;
    const lowerQuery = searchQuery.toLowerCase();
    return articles.filter((article) =>
      article.article_title.toLowerCase().includes(lowerQuery),
    );
  }, [articles, searchQuery]);

  // Highlight matching text in titles
  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escapedQuery})`, "gi");
    return text.split(regex).map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={index} className="text-blue-500 dark:text-blue-400">
          {part}
        </span>
      ) : (
        part
      ),
    );
  };

  // Truncate content for card preview
  const getPreviewText = (content: string, maxLength = 180) => {
    const preview = content.slice(0, maxLength);
    return preview.length < content.length ? `${preview}...` : preview;
  };

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = filteredArticles.slice(
    indexOfFirstArticle,
    Math.min(indexOfLastArticle, filteredArticles.length),
  );

  const handleSearchQuery = (e: ChangeEvent<HTMLInputElement>) => {
    setCurrentPage(1);
    setSearchQuery(e.target.value);
  };

  if (loading) return <ArticleCardsSkeleton />;

  if (!articles || articles.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <FileSearchCorner className="h-12 w-12" />
        <div className="text-center">
          <span className="mb-4 text-3xl text-neutral-900 dark:text-white">
            No Articles Found
          </span>

          <p className="mb-4 text-neutral-600 dark:text-neutral-400">
            Seems like no articles have been posted yet
          </p>
          {isInDashboard && (
            <button
              className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-3 py-2 text-sm text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              onClick={() => setActiveTab("post")}
            >
              <PenLine className="h-4 w-4" />
              New Article
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:justify-between">
        <div className="flex flex-col gap-3">
          {/* Search input */}
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            <span className="inline-flex items-center gap-1 rounded-xl bg-amber-50 px-3 py-1 text-xs text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
              <Lightbulb className="h-3 w-3" />
              Use the article title as your search query
            </span>
          </p>
          <div className="relative w-fit">
            <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search for an article..."
              value={searchQuery}
              onChange={handleSearchQuery}
              className="w-60 rounded-xl border border-neutral-300 py-2.5 pr-10 pl-11 text-sm text-neutral-900 placeholder-neutral-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none sm:w-80 dark:border-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-400 dark:focus:border-blue-400 dark:focus:ring-blue-400/20"
            />
            <button
              className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full p-1 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <button
          onClick={refetchData}
          className="inline-flex h-fit w-fit items-center gap-1.5 rounded-xl bg-neutral-900 px-3.5 py-2 text-sm text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          <RotateCcw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <ArticleCardsView
        currentArticles={currentArticles}
        searchQuery={searchQuery}
        highlightText={highlightText}
        getPreviewText={getPreviewText}
        userId={userId}
      />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
        issuesPerPage={articlesPerPage}
        setIssuesPerPage={setArticlesPerPage}
        perPageOptions={perPageOptions}
        indexOfFirstIssue={indexOfFirstArticle}
        indexOfLastIssue={indexOfLastArticle}
        issuesLength={filteredArticles.length}
      />
    </div>
  );
};

export default ArticlesCardData;
