"use client";

import { useState } from "react";
import { Newspaper, UserRound } from "lucide-react";
import { NewsItem } from "@/serverActions/NewsHandling/GetNews";
import { Modal, ModalBody, ModalHeader } from "../Modules/Modal/Modal";

type NewsDetailModalProps = {
  news: NewsItem | null;
  onClose: () => void;
};

const NewsDetailModal = ({ news, onClose }: NewsDetailModalProps) => {
  // Keep showing the last item while the modal animates out
  const [shown, setShown] = useState(news);
  if (news && news !== shown) setShown(news);

  if (!shown) return null;

  return (
    <Modal open={!!news} onClose={onClose} size="2xl" tone="muted" dismissible>
      <ModalHeader
        title={shown.title}
        icon={
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
            <Newspaper size={20} />
          </div>
        }
      />

      {/* Body Content */}
      <ModalBody className="sm:p-8">
        {/* Meta Info (Author) */}
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-neutral-200/60 bg-white p-3 dark:border-neutral-800/60 dark:bg-neutral-900/50">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
            <UserRound size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-200">
              {shown.author}
            </span>
            <span className="text-xs font-medium tracking-wider text-neutral-500 uppercase">
              Author
            </span>
          </div>
        </div>

        {/* The Actual News Description */}
        <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none">
          <p className="text-base leading-relaxed whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">
            {shown.description}
          </p>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default NewsDetailModal;
