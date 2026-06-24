"use client";

import { useRef } from "react";
import ClientPortal from "../Modules/ClientPortal";
import { useFocusTrapping } from "@/hooks/useFocusTrapping";
import { X, Newspaper, UserRound } from "lucide-react";
import { NewsItem } from "@/serverActions/NewsHandling/GetNews";

type NewsDetailModalProps = {
  news: NewsItem | null;
  onClose: () => void;
};

const NewsDetailModal = ({ news, onClose }: NewsDetailModalProps) => {
  const modalRef = useRef<HTMLDivElement | null>(null);

  // Trap focus only when the modal is open (i.e., news is not null)
  useFocusTrapping(modalRef, !!news, onClose);

  // If no news item is selected, render nothing
  if (!news) return null;

  return (
    <ClientPortal>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="custom-blur fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-4 dark:bg-black/80"
      >
        {/* Modal Container */}
        <div
          onClick={(e) => e.stopPropagation()}
          ref={modalRef}
          className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-neutral-300 bg-neutral-50 shadow-2xl dark:border-neutral-800 dark:bg-neutral-950"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-neutral-200/50 p-5 dark:border-neutral-900">
            <div className="flex items-center gap-3 pr-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <Newspaper size={20} />
              </div>
              <h2 className="text-xl leading-tight font-semibold text-neutral-900 dark:text-neutral-100">
                {news.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="shrink-0 rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-200 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body Content */}
          <div className="layout-scrollbar flex-1 overflow-y-auto p-6 sm:p-8">
            {/* Meta Info (Author) */}
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-neutral-200/60 bg-white p-3 dark:border-neutral-800/60 dark:bg-neutral-900/50">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                <UserRound size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-200">
                  {news.author}
                </span>
                <span className="text-[10px] font-medium tracking-wider text-neutral-500 uppercase">
                  Author
                </span>
              </div>
            </div>

            {/* The Actual News Description */}
            <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none">
              <p className="text-base leading-relaxed whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">
                {news.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </ClientPortal>
  );
};

export default NewsDetailModal;
