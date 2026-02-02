"use client";

import { useState } from "react";
import { MessageCirclePlus, MessagesSquare, SendHorizonal } from "lucide-react";

const CommentsSection = () => {
  const [comment, setComment] = useState("");
  const [showCommentsInput, setShowCommentsInput] = useState(false);
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
            className="w-full resize-none rounded-full border border-neutral-300 py-4 pr-14 pl-4 text-sm text-neutral-900 placeholder-neutral-400 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-neutral-700 dark:text-neutral-100"
          />

          {/* The submit comment button */}
          <button className="absolute top-2 right-2 flex items-center justify-center rounded-full bg-blue-600 p-2 text-white transition-colors duration-200 hover:bg-blue-700">
            <SendHorizonal className="h-5 w-5" />
          </button>
        </div>
      )}

      <p>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum
        assumenda quaerat culpa eum illum! Vitae id accusamus perspiciatis
        aperiam earum. Libero voluptas in quam accusantium aliquam,
        necessitatibus sit saepe fugiat! Lorem ipsum dolor sit amet consectetur
        adipisicing elit. Nostrum assumenda quaerat culpa eum illum! Vitae id
        accusamus perspiciatis aperiam earum. Libero voluptas in quam
        accusantium aliquam, necessitatibus sit saepe fugiat! Lorem ipsum dolor
        sit amet consectetur adipisicing elit. Nostrum assumenda quaerat culpa
        eum illum! Vitae id accusamus perspiciatis aperiam earum. Libero
        voluptas in quam accusantium aliquam, necessitatibus sit saepe fugiat!
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum
        assumenda quaerat culpa eum illum! Vitae id accusamus perspiciatis
        aperiam earum. Libero voluptas in quam accusantium aliquam,
        necessitatibus sit saepe fugiat! Lorem ipsum dolor sit amet consectetur
        adipisicing elit. Nostrum assumenda quaerat culpa eum illum! Vitae id
        accusamus perspiciatis aperiam earum. Libero voluptas in quam
        accusantium aliquam, necessitatibus sit saepe fugiat! Lorem ipsum dolor
        sit amet consectetur adipisicing elit. Nostrum assumenda quaerat culpa
        eum illum! Vitae id accusamus perspiciatis aperiam earum. Libero
        voluptas in quam accusantium aliquam, necessitatibus sit saepe fugiat!
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Nostrum
        assumenda quaerat culpa eum illum! Vitae id accusamus perspiciatis
        aperiam earum. Libero voluptas in quam accusantium aliquam,
        necessitatibus sit saepe fugiat! Lorem ipsum dolor sit amet consectetur
        adipisicing elit. Nostrum assumenda quaerat culpa eum illum! Vitae id
        accusamus perspiciatis aperiam earum. Libero voluptas in quam
        accusantium aliquam, necessitatibus sit saepe fugiat! Lorem ipsum dolor
        sit amet consectetur adipisicing elit. Nostrum assumenda quaerat culpa
        eum illum! Vitae id accusamus perspiciatis aperiam earum. Libero
        voluptas in quam accusantium aliquam, necessitatibus sit saepe fugiat!
        Nostrum assumenda quaerat culpa eum illum! Vitae id accusamus
        perspiciatis aperiam earum. Libero voluptas in quam accusantium aliquam,
        necessitatibus sit saepe fugiat! Lorem ipsum
      </p>
    </div>
  );
};

export default CommentsSection;
