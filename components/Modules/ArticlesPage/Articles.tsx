"use client";

import { useState } from "react";
import { FileText, PenLine } from "lucide-react";
import PostArticle from "./PostArticle";
import UserArticlesWrapper from "./UserArticlesWrapper";

const Articles = () => {
  const [activeTab, setActiveTab] = useState<"articles" | "post">("articles");

  return (
    <div className="flex h-full w-full flex-col py-6 md:py-3.5">
      {/* Title Header */}
      <div className="mb-4 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        {/* Title & Subtitle */}
        <div className="flex flex-col">
          <h1 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-white">
            {activeTab === "articles" ? "Your Articles" : "New Article"}
          </h1>
          <p className="mt-1 text-sm text-neutral-500 sm:mt-0 dark:text-neutral-400">
            {activeTab === "articles"
              ? "Browse, manage, and read your published articles."
              : "Draft, format, and publish your ideas."}
          </p>
        </div>

        {/* Action Buttons */}
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

      {/* Content Area */}
      <div className="min-h-125 flex-1 rounded-2xl border border-neutral-200 p-6 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.04)] dark:border-neutral-800">
        {activeTab === "articles" ? <UserArticlesWrapper /> : <PostArticle />}
      </div>
    </div>
  );
};

export default Articles;
