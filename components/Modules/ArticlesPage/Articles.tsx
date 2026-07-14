"use client";

import { ArrowUpRight, FileText, MailPlus, PenLine } from "lucide-react";
import PostArticle from "./PostArticle";
import UserArticlesWrapper from "./UserArticlesWrapper";
import { useUser } from "@/contexts/UserContext";
import { useActiveTabStore } from "@/store/useActiveTabStore";
import PostMail from "./PostMail/PostMail";
import PostNews from "../News/PostNews";
import { useState } from "react";
import Link from "next/link";

const NewsPostIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1.3em"
    height="1.3em"
    viewBox="0 0 24 24"
  >
    <g fill="none" fillRule="evenodd" clipRule="evenodd">
      <path
        fill="#2859c5"
        d="M10.75 10.75V7.5h2.5v3.25h3.25v2.5h-3.25v3.25h-2.5v-3.25H7.5v-2.5z"
      ></path>
      <path
        fill="#8fbffa"
        d="M12 3a9 9 0 1 1-9 9H1c0 6.075 4.925 11 11 11s11-4.925 11-11S18.075 1 12 1zm-8.82 7.199a9 9 0 0 1 .72-2.126l-1.8-.874a11 11 0 0 0-.88 2.602zm3.42-5.4a9 9 0 0 0-1.8 1.8L3.2 5.4a11 11 0 0 1 2.2-2.2l1.2 1.6Zm1.473-.9a9 9 0 0 1 2.126-.719l-.398-1.96c-.914.185-1.786.484-2.602.88z"
      ></path>
    </g>
  </svg>
);

const Articles = () => {
  const activeTab = useActiveTabStore((state) => state.activeTab);
  const setActiveTab = useActiveTabStore((state) => state.setActiveTab);

  const [isPostMailOpen, setIsPostMailOpen] = useState(false);
  const [postNewsOpen, setPostNewsOpen] = useState(false);

  const { role } = useUser();

  return (
    <>
      {/* Post Mail Modal */}
      {isPostMailOpen && (
        <PostMail
          isOpen={isPostMailOpen}
          closeModal={() => setIsPostMailOpen(false)}
        />
      )}

      {/* Post News Modal */}
      {postNewsOpen && (
        <PostNews
          isOpen={postNewsOpen}
          closeModal={() => setPostNewsOpen(false)}
        />
      )}
      <div className="flex h-full w-full flex-col py-6 md:py-3.5">
        {/* Title Header */}
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          {/* Title & Subtitle */}
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-white">
              {activeTab === "articles" ? "Published Articles" : "New Article"}
            </h1>
            <p className="mt-1 text-sm text-neutral-500 sm:mt-0 dark:text-neutral-400">
              {activeTab === "articles"
                ? "Browse, search and read through published content."
                : "Draft, format, and publish your ideas."}
            </p>
          </div>

          {/* Action Buttons - Post Email, Articles, & Post Article*/}
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/articles"
              target="_blank"
              className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-2 text-xs text-amber-600 hover:text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:text-amber-500"
            >
              Knowledge Base...
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
            {role !== "user" && (
              <button
                onClick={() => setPostNewsOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-blue-400 ring-1 ring-blue-400 transition-colors duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <NewsPostIcon />
                Post News
              </button>
            )}
            {role !== "user" && (
              <button
                onClick={() => setIsPostMailOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 px-3 py-2 text-sm text-white transition-colors duration-200 hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
              >
                <MailPlus className="h-4 w-4" />
                Mail Dispatch
              </button>
            )}
            <div className="inline-flex h-fit w-fit items-center gap-1 rounded-2xl border border-neutral-200 bg-neutral-50 p-1 shadow-inner dark:border-neutral-800 dark:bg-neutral-950">
              <button
                onClick={() => setActiveTab("articles")}
                className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-medium transition-all ${
                  activeTab === "articles"
                    ? "bg-white text-black shadow-sm dark:bg-neutral-800 dark:text-white"
                    : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                }`}
              >
                <FileText className="h-4 w-4" />
                Articles
              </button>
              <button
                onClick={() => setActiveTab("post")}
                className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-medium transition-all ${
                  activeTab === "post"
                    ? "bg-white text-black shadow-sm dark:bg-neutral-800 dark:text-white"
                    : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                }`}
              >
                <PenLine className="h-4 w-4" />
                Post
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="min-h-125 flex-1 rounded-2xl border border-neutral-200 p-6 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.04)] dark:border-neutral-800">
          {activeTab === "articles" ? <UserArticlesWrapper /> : <PostArticle />}
        </div>
      </div>
    </>
  );
};

export default Articles;
