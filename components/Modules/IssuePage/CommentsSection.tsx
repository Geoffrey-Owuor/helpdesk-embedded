"use client";

import { useState } from "react";
import { MessageCirclePlus, MessagesSquare, SendHorizonal } from "lucide-react";
import apiClient from "@/lib/AxiosClient";
import { getApiErrorMessage } from "@/utils/AxiosErrorHelper";

const CommentsSection = ({ uuid }: { uuid: string }) => {
  const [comment, setComment] = useState("");
  const [showCommentsInput, setShowCommentsInput] = useState(false);

  //Posting a comment
  const postComment = async () => {
    try {
      //Posting the comment
      await apiClient.post("/post-comment", { comment, uuid });

      // If api is successful, we modify the comments array mapper
      //to display the current posted comment without refreshing the comments

      // clear the comments after api success
      setComment("");
    } catch (error) {
      const generatedError = getApiErrorMessage(error);
      console.error("Error while trying to post a comment", generatedError);
    }
  };
  return (
    <div className="max-h-150 max-w-3xl overflow-y-auto rounded-xl border border-neutral-200 p-6 shadow-sm dark:border-neutral-800">
      <div className="mb-6 flex items-center justify-between">
        {/* The title */}
        <h2 className="flex items-center gap-2 text-lg font-semibold text-neutral-900 dark:text-white">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
            <MessagesSquare className="h-4 w-4" />
          </div>
          Issue Comments
        </h2>
        {/* The add comment button */}
        <button
          onClick={() => setShowCommentsInput((prev) => !prev)}
          className="flex items-center gap-2 rounded-xl bg-black px-3 py-2 text-sm text-white transition-colors duration-200 hover:bg-neutral-900 dark:bg-white dark:text-black dark:hover:bg-gray-200"
        >
          <MessageCirclePlus className="h-4 w-4" />
          Add comment
        </button>
      </div>

      {/* The comments textarea */}
      {showCommentsInput && (
        <div className="relative mb-4">
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
            disabled={!comment}
            onClick={postComment}
            className="absolute top-1.25 right-2 flex items-center justify-center rounded-full bg-blue-600 p-2 text-white transition-colors duration-200 hover:bg-blue-700 disabled:opacity-50"
          >
            <SendHorizonal className="h-7 w-7" />
          </button>
        </div>
      )}

      <p>No comments found under this issue</p>
    </div>
  );
};

export default CommentsSection;
