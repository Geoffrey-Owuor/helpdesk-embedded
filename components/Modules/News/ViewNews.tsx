"use client";

import { useRef } from "react";
import { useNewsStore } from "@/store/useNewsStore";
import { useFocusTrapping } from "@/hooks/useFocusTrapping";
import { X, Newspaper, Megaphone, RotateCcw } from "lucide-react";
import { NewsItem } from "@/serverActions/NewsHandling/GetNews";

type ViewNewsProps = {
  newsList: NewsItem[];
  refetch: () => void;
};

const ViewNews = ({ newsList, refetch }: ViewNewsProps) => {
  const showNews = useNewsStore((state) => state.showNews);
  const setShowNews = useNewsStore((state) => state.setShowNews);

  const modalRef = useRef<HTMLDivElement | null>(null);

  // Trap focus for accessibility when modal is open
  useFocusTrapping(modalRef, showNews, () => setShowNews(false));

  if (!showNews) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4 dark:bg-black/80">
      <div
        ref={modalRef}
        className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-neutral-300 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-950"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200/50 p-4 dark:border-neutral-900">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <Newspaper size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                News Updates
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Catch up on the latest news and announcements.
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-4">
            <button
              onClick={refetch}
              title="refresh"
              className="rounded-full bg-neutral-100 p-1.5 hover:bg-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setShowNews(false)}
              className="rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-200 dark:hover:bg-neutral-800"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="layout-scrollbar flex-1 overflow-y-auto p-6">
          {newsList.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-neutral-300 bg-neutral-100/50 text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900/30 dark:text-neutral-400">
              <Megaphone className="h-8 w-8 text-neutral-400 dark:text-neutral-600" />
              <span className="text-sm font-medium">
                You&apos;re all caught up!
              </span>
              <span className="text-xs">
                No active announcements at this time.
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {newsList.map((news) => (
                <div
                  key={news.id}
                  className="group relative overflow-hidden rounded-xl border border-neutral-200 bg-white p-5 text-left shadow-sm transition-all hover:border-blue-200 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-blue-900/50"
                >
                  <div className="mb-2 flex items-start justify-between gap-4">
                    <h3 className="text-base leading-snug font-semibold text-neutral-900 dark:text-neutral-100">
                      {news.title}
                    </h3>
                  </div>

                  <p className="mb-4 text-sm leading-relaxed whitespace-pre-wrap text-neutral-600 dark:text-neutral-400">
                    {news.description}
                  </p>

                  <div className="flex items-center gap-2 border-t border-neutral-100 pt-3 dark:border-neutral-800/80">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                      {news.author.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                      {news.author}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewNews;
