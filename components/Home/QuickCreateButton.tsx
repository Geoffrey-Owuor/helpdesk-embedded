"use client";

import { MessageCirclePlus } from "lucide-react";
import { useState } from "react";
import QuickCreateModal from "./QuickCreateModal";

const QuickCreateButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Quick Create Modal */}
      {isModalOpen && (
        <QuickCreateModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} />
      )}
      <button
        onClick={() => setIsModalOpen((prev) => !prev)}
        aria-label="Quick create issue"
        // Positioned fixed at the bottom right.
        // active:scale-90 creates the zoom-in-out click animation.
        className="group fixed right-6 bottom-6 z-50 flex cursor-pointer items-center justify-center rounded-full bg-blue-600 p-4 text-white shadow-xl shadow-blue-600/30 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-600/40 active:scale-90 sm:right-8 sm:bottom-8 dark:shadow-blue-500/20 dark:hover:bg-blue-500 dark:hover:shadow-blue-500/40"
      >
        {/* Text Container 
        - Placed *before* the icon so it expands towards the left.
        - max-w-0 and opacity-0 hide it initially.
        - On group-hover, max-w increases and it fades in.
      */}
        <span className="max-w-0 overflow-hidden text-[15px] font-semibold tracking-wide whitespace-nowrap opacity-0 transition-all duration-300 ease-in-out group-hover:mr-3 group-hover:max-w-30 group-hover:opacity-100">
          Quick create
        </span>

        {/* Center Icon */}
        <MessageCirclePlus size={24} className="shrink-0" />
      </button>
    </>
  );
};

export default QuickCreateButton;
