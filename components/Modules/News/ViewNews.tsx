"use client";

import { useNewsStore } from "@/store/useNewsStore";
import { Newspaper, Megaphone, RotateCcw } from "lucide-react";
import { NewsItem } from "@/serverActions/NewsHandling/GetNews";
import { Modal, ModalBody, ModalHeader, ModalIconButton } from "../Modal/Modal";

type ViewNewsProps = {
  newsList: NewsItem[];
  refetch: () => void;
};

const ViewNews = ({ newsList, refetch }: ViewNewsProps) => {
  const showNews = useNewsStore((state) => state.showNews);
  const setShowNews = useNewsStore((state) => state.setShowNews);

  return (
    <Modal
      open={showNews}
      onClose={() => setShowNews(false)}
      size="2xl"
      tone="muted"
      dismissible
    >
      <ModalHeader
        title="News Updates"
        description="Catch up on the latest news and announcements."
        icon={
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
            <Newspaper size={20} />
          </div>
        }
        actions={
          <ModalIconButton label="Refresh" icon={RotateCcw} onClick={refetch} />
        }
      />

      {/* Body Content */}
      <ModalBody>
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
      </ModalBody>
    </Modal>
  );
};

export default ViewNews;
