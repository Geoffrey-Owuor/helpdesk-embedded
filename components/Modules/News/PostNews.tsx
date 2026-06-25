"use client";

import { useState, useRef, FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useConfirmStore } from "@/store/useConfirmStore";
import { useAlertStore } from "@/store/useAlertStore";
import { useOverlayStore } from "@/store/useOverlayStore";
import { useFocusTrapping } from "@/hooks/useFocusTrapping";
import ClientPortal from "../ClientPortal";
import FormAsterisk from "../FormAsterisk";
import {
  X,
  Send,
  Newspaper,
  List,
  Trash2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { GetNews, NewsItem } from "@/serverActions/NewsHandling/GetNews";
import { PostNewsAction } from "@/serverActions/NewsHandling/PostNewsAction";
import { DeleteNews } from "@/serverActions/NewsHandling/DeleteNews";
import { useUser } from "@/contexts/UserContext";

type PostNewsProps = {
  closeModal: () => void;
  isOpen: boolean;
};

const PostNews = ({ closeModal, isOpen }: PostNewsProps) => {
  const queryClient = useQueryClient();
  const modalRef = useRef<HTMLDivElement | null>(null);
  useFocusTrapping(modalRef, isOpen, closeModal);

  const { username } = useUser();

  // Stores
  const triggerAlert = useAlertStore((state) => state.triggerAlert);
  const triggerDialog = useConfirmStore((state) => state.triggerDialog);
  const hideDialog = useConfirmStore((state) => state.hideDialog);
  const showOverlay = useOverlayStore((state) => state.showOverlay);
  const hideOverlay = useOverlayStore((state) => state.hideOverlay);

  // Component States
  const [activeTab, setActiveTab] = useState<"create" | "manage">("create");

  // Form States
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Fetch News using TanStack Query
  const { data: newsList = [], isLoading: isFetchingNews } = useQuery({
    queryKey: ["newsData"],
    queryFn: GetNews,
    enabled: isOpen && activeTab === "manage", // Only fetch if modal is open and on manage tab
  });

  // --- HANDLERS ---

  const handlePostSubmit = async () => {
    hideDialog();
    showOverlay("Adding");

    try {
      const message = await PostNewsAction({
        title,
        description,
        author: username,
      });

      // Invalidate cache so new data appears instantly in the manage tab
      queryClient.invalidateQueries({ queryKey: ["newsData"] });

      // Reset form
      setTitle("");
      setDescription("");

      // Optionally jump to manage tab or close modal
      setActiveTab("manage");

      triggerAlert(message.alertType, message.alertMessage);
    } catch (error) {
      console.error("Error while trying to post the news:", error);
      triggerAlert("error", "Failed to post news. Please try again.");
    } finally {
      hideOverlay();
    }
  };

  const confirmPost = (e: FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      triggerAlert("error", "Please fill in all required fields.");
      return;
    }

    triggerDialog({
      title: "Post News",
      description: "Are you sure you want to broadcast this news update?",
      onConfirm: handlePostSubmit,
    });
  };

  const handleDelete = async (id: number) => {
    hideDialog();

    try {
      const message = await DeleteNews(id);
      queryClient.invalidateQueries({ queryKey: ["newsData"] });
      triggerAlert(message.alertType, message.alertMessage);
    } catch (error) {
      console.error("Error while trying to delete the news:", error);
      triggerAlert("error", "Failed to delete news item.");
    }
  };

  const confirmDelete = (id: number) => {
    triggerDialog({
      title: "Delete News",
      description:
        "Are you sure you want to permanently delete this news item? This cannot be undone.",
      onConfirm: () => handleDelete(id),
    });
  };

  if (!isOpen) return null;

  return (
    <ClientPortal>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 dark:bg-black/80">
        <div
          ref={modalRef}
          className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-neutral-300 bg-neutral-50 shadow-2xl dark:border-neutral-800 dark:bg-neutral-950"
        >
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200/50 p-4 dark:border-neutral-900">
            <div>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                Company News
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Broadcast updates or manage existing news.
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Tabs Toggle */}
              <div className="inline-flex h-fit w-fit items-center gap-1 rounded-2xl border border-neutral-200 bg-neutral-100/50 p-1 shadow-inner dark:border-neutral-800 dark:bg-neutral-900/50">
                <button
                  onClick={() => setActiveTab("create")}
                  className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                    activeTab === "create"
                      ? "bg-white text-black shadow-sm dark:bg-neutral-800 dark:text-white"
                      : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                  }`}
                >
                  <Newspaper className="h-3.5 w-3.5" />
                  Create
                </button>
                <button
                  onClick={() => setActiveTab("manage")}
                  className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                    activeTab === "manage"
                      ? "bg-white text-black shadow-sm dark:bg-neutral-800 dark:text-white"
                      : "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                  }`}
                >
                  <List className="h-3.5 w-3.5" />
                  Manage
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={closeModal}
                className="rounded-full p-2 text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="layout-scrollbar flex-1 overflow-y-auto p-6">
            {/* ---- CREATE TAB ---- */}
            {activeTab === "create" && (
              <form
                onSubmit={confirmPost}
                autoComplete="off"
                className="space-y-6"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <label className="flex items-center gap-1 text-xs font-semibold text-neutral-500 uppercase dark:text-neutral-400">
                      News Title <FormAsterisk />
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      maxLength={100}
                      placeholder="e.g. Q3 Townhall Meeting"
                      className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                    />
                  </div>

                  {/* The author */}
                  <div className="flex flex-col gap-1">
                    <label className="flex items-center gap-1 text-xs font-semibold text-neutral-500 uppercase dark:text-neutral-400">
                      News Author
                    </label>
                    <span className="cursor-not-allowed rounded-xl border border-neutral-300 bg-neutral-200 px-3 py-2 text-sm text-neutral-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100">
                      {username}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="flex items-center gap-1 text-xs font-semibold text-neutral-500 uppercase dark:text-neutral-400">
                    Description <FormAsterisk />
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={6}
                    placeholder="Provide the details of the news..."
                    className="resize-y rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                  />
                </div>

                <div className="flex items-center justify-end border-t border-neutral-200/50 pt-6 dark:border-neutral-900">
                  <button
                    type="submit"
                    disabled={!title || !description}
                    className="flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
                  >
                    Post
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </form>
            )}

            {/* ---- MANAGE TAB ---- */}
            {activeTab === "manage" && (
              <div className="flex flex-col gap-4">
                {isFetchingNews ? (
                  <div className="flex h-40 flex-col items-center justify-center gap-3 text-neutral-500 dark:text-neutral-400">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="text-sm">Fetching active news...</span>
                  </div>
                ) : newsList.length === 0 ? (
                  <div className="flex h-40 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-neutral-300 bg-neutral-100/50 text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900/30 dark:text-neutral-400">
                    <AlertCircle className="h-6 w-6" />
                    <span className="text-sm">No active news found.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {newsList.map((news: NewsItem) => (
                      <div
                        key={news.id}
                        className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition-all hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
                      >
                        <div>
                          <h3 className="mb-1 truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                            {news.title}
                          </h3>
                          <p className="mb-3 line-clamp-3 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                            {news.description}
                          </p>
                        </div>
                        <div className="flex items-center justify-between border-t border-neutral-100 pt-3 dark:border-neutral-800">
                          <span className="text-[10px] font-medium tracking-wider text-blue-600 uppercase dark:text-blue-400">
                            By {news.author}
                          </span>
                          <button
                            onClick={() => confirmDelete(news.id)}
                            className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                            title="Delete News"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ClientPortal>
  );
};

export default PostNews;
