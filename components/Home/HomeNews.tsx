"use client";

import { useQuery } from "@tanstack/react-query";
import SkeletonBox from "../Skeletons/SkeletonBox";
import { GetNews, NewsItem } from "@/serverActions/NewsHandling/GetNews";
import {
  Megaphone,
  Newspaper,
  Earth,
  Lightbulb,
  RotateCcw,
} from "lucide-react";
import { useState } from "react";
import NewsDetailModal from "./NewsDetailModal";

const HomeNews = () => {
  // Add state for the selected news item
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  // Fetch news data
  const {
    data: newsList = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["newsData"],
    queryFn: GetNews,
  });

  // Limit to the 6 most recent items so the homepage doesn't get infinitely long
  const displayedNews = newsList.slice(0, 6);

  return (
    <section className="relative mb-16 px-4 sm:px-6 lg:px-8">
      <NewsDetailModal
        news={selectedNews}
        onClose={() => setSelectedNews(null)}
      />

      {/* Header Area */}
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold tracking-widest text-blue-600 uppercase dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-400">
          <Newspaper className="h-3.5 w-3.5" />
          The Latest
        </div>
        <h2 className="mb-3 text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl dark:text-white">
          News & Announcements
        </h2>
        <p className="max-w-2xl text-base text-neutral-600 dark:text-neutral-400">
          Stay in the loop. Read up on new releases, policy updates, and team
          milestones straight from the source.
        </p>
        <div className="mt-2 inline-flex items-center gap-4">
          <span className="inline-flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1 text-xs text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
            <Lightbulb className="h-3 w-3" />
            Click on any announcement to view it&apos;s full details.
          </span>
          <button
            onClick={() => refetch()}
            title="refresh"
            className="rounded-full bg-neutral-100 p-1.5 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* News Grid */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <SkeletonBox key={i} className="h-64" />
          ))}
        </div>
      ) : displayedNews.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-neutral-300 bg-neutral-50/50 py-20 text-center dark:border-neutral-800 dark:bg-neutral-900/20">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-200/50 text-neutral-400 dark:bg-neutral-800/50 dark:text-neutral-500">
            <Newspaper className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            No recent updates
          </h3>
          <p className="mt-1 max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
            It looks like everything is quiet right now. Check back later for
            the latest news and announcements.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayedNews.map((news: NewsItem) => (
            <button
              key={news.id}
              onClick={() => setSelectedNews(news)}
              className="group relative flex cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200 bg-white p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10 dark:border-neutral-800 dark:bg-neutral-900/20 dark:hover:border-blue-800/50 dark:hover:bg-neutral-900/30"
            >
              {/* Subtle top gradient line that appears on hover */}
              <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-blue-500 to-indigo-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    <Megaphone className="h-5 w-5" />
                  </div>
                  {/* Read indicator (aesthetic) */}
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 text-neutral-400 transition-colors group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-blue-600 dark:border-neutral-800 dark:bg-neutral-950 dark:group-hover:border-blue-900 dark:group-hover:bg-blue-900/30 dark:group-hover:text-blue-400">
                    <Earth className="h-3 w-3 -rotate-180 transition-transform duration-300 group-hover:rotate-0" />
                  </div>
                </div>

                <h3 className="mb-2 line-clamp-1 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  {news.title}
                </h3>

                <p className="line-clamp-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {news.description}
                </p>
              </div>

              <div className="mt-6 flex items-center gap-3 border-t border-neutral-100 pt-4 dark:border-neutral-800/80">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-white dark:bg-neutral-100 dark:text-neutral-900">
                  {news.author.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-200">
                    {news.author}
                  </span>
                  <span className="text-[10px] font-medium text-neutral-500 dark:text-neutral-500">
                    Author
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
};

export default HomeNews;
