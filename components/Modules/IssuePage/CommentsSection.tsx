"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MessageCirclePlus,
  MessagesSquare,
  SendHorizonal,
  MessageCircle,
  CalendarCheck,
  RotateCcw,
  Dot,
} from "lucide-react";
import apiClient from "@/lib/AxiosClient";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";
import { commentsQuery } from "@/app/api/get-comments/route";
import { dateFormatter } from "@/public/assets";
import { abbreviateUserName } from "@/public/assets";
import CommentsSkeleton from "@/components/Skeletons/CommentsSkeleton";
import { useUser } from "@/contexts/UserContext";

const CommentsSection = ({ uuid }: { uuid: string }) => {
  const [comment, setComment] = useState("");
  const [showCommentsInput, setShowCommentsInput] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsData, setCommentsData] = useState<commentsQuery[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const { username, email } = useUser();

  // Default fetch comments function
  const handleFetchComments = useCallback(async () => {
    setCommentsLoading(true);

    try {
      const response = await apiClient.post("/get-comments", { uuid });

      // set response data to commentsData
      setCommentsData(response.data);
    } catch (error) {
      const generatedError = getApiErrorMessage(error);
      console.error("Error fetching comments data:", generatedError);
      setCommentsData([]);
    } finally {
      setCommentsLoading(false);
    }
  }, [uuid]);

  // useEffect for fetching our comments data on mount
  useEffect(() => {
    handleFetchComments();
  }, [handleFetchComments]);

  //Posting a comment
  const postComment = async () => {
    // Basic validation to prevent empty comments
    if (!comment.trim()) return;

    setSubmitting(true);
    try {
      //Posting the comment
      await apiClient.post("/post-comment", { comment, uuid });

      // create a local comment object
      const newComment: commentsQuery = {
        comment_id: Date.now(),
        comment_submitter_name: username,
        comment_submitter_email: email,
        comment_description: comment,
        comment_created_at: new Date().toISOString(),
      };

      //Update the state without refetching
      setCommentsData((prevComments) => {
        // Add to top - newest to oldest
        return [newComment, ...prevComments];
      });

      // clear the input
      setComment("");
    } catch (error) {
      const generatedError = getApiErrorMessage(error);
      console.error("Error while trying to post a comment", generatedError);
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div className="max-h-150 max-w-3xl overflow-y-auto rounded-xl border border-neutral-200 p-6 shadow-sm dark:border-neutral-800">
      <div className="mb-8 flex items-center justify-between">
        {/* The title and total comments */}
        <div className="flex flex-col gap-2">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-white">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
              <MessagesSquare className="h-4 w-4" />
            </div>
            Issue Comments
          </h2>

          {/* Total comments */}
          <span className="px-2 text-sm text-neutral-500">
            Total comments:{" "}
            {commentsLoading ? "loading..." : `${commentsData.length}`}
          </span>
        </div>
        {/* The add comment button */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleFetchComments}
            className="rounded-full bg-neutral-200 p-2 transition-colors duration-200 hover:bg-neutral-300 dark:bg-neutral-900 dark:hover:bg-neutral-800"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
          <button
            onClick={() => setShowCommentsInput((prev) => !prev)}
            className="flex items-center gap-2 rounded-xl bg-black px-3 py-2 text-sm text-white transition-colors duration-200 hover:bg-neutral-900 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            <MessageCirclePlus className="h-4 w-4" />
            Add comment
          </button>
        </div>
      </div>

      {/* The comments textarea */}
      {showCommentsInput && (
        <div className="relative mb-8">
          <textarea
            rows={1}
            name="comment"
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Enter your comment here..."
            className="w-full max-w-165 resize-none rounded-full border border-neutral-300 py-4 pr-14 pl-4 text-sm text-neutral-900 placeholder-neutral-400 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-neutral-700 dark:text-neutral-100"
          />

          {/* The submit comment button */}
          <button
            disabled={!comment || submitting}
            onClick={postComment}
            className="absolute top-1.25 right-2 flex items-center justify-center rounded-full bg-blue-600 p-2 text-white transition-colors duration-200 hover:bg-blue-700 disabled:opacity-50"
          >
            <SendHorizonal className="h-7 w-7" />
          </button>
        </div>
      )}

      {/* Comments Data Mapping */}
      {commentsLoading ? (
        <CommentsSkeleton />
      ) : (
        <>
          {commentsData.length === 0 ? (
            // Professional Empty State
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-neutral-50/50 py-12 text-center dark:border-neutral-800 dark:bg-neutral-900/20">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                <MessageCircle className="h-5 w-5 text-neutral-400" />
              </div>
              <h3 className="mt-3 text-sm font-medium text-neutral-900 dark:text-neutral-100">
                No comments yet
              </h3>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Be the first to share your thoughts on this issue.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {commentsData.map((comment) => (
                <div
                  key={comment.comment_id}
                  className="group flex items-start gap-4"
                >
                  {/* Avatar - Fixed width (shrink-0) to prevent squishing */}
                  <div className="shrink-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-neutral-50 shadow-sm dark:bg-neutral-100 dark:text-neutral-900">
                      <span className="text-sm tracking-tight">
                        {abbreviateUserName(comment.comment_submitter_name)}
                      </span>
                    </div>
                  </div>

                  {/* Content Box - flex-1 and min-w-0 are CRITICAL for text wrapping */}
                  <div className="min-w-0 flex-1 rounded-2xl rounded-tl-none bg-neutral-100 px-5 py-4 shadow-sm dark:bg-neutral-900">
                    {/* Header: Name and Date */}
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-0.5 text-sm">
                        <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {comment.comment_submitter_name}
                        </span>
                        <Dot className="mt-1 h-4 w-4 text-neutral-400 dark:text-neutral-600" />
                        <span className="text-neutral-500">
                          {comment.comment_submitter_email}
                        </span>
                      </div>
                      <span className="flex items-center gap-2 text-xs whitespace-nowrap text-neutral-500 dark:text-neutral-400">
                        <CalendarCheck className="h-3.5 w-3.5" />
                        {dateFormatter(comment.comment_created_at)}
                      </span>
                    </div>

                    {/* Body Text */}
                    <p className="text-sm leading-relaxed wrap-break-word whitespace-pre-wrap text-neutral-700 dark:text-neutral-300">
                      {comment.comment_description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CommentsSection;
