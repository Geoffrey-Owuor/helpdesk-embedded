"use client";

import { X } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

type AdminPanelProps = {
  showAdminPanel: boolean;
  setShowAdminPanel: Dispatch<SetStateAction<boolean>>;
};

const AdminPanel = ({ showAdminPanel, setShowAdminPanel }: AdminPanelProps) => {
  if (!showAdminPanel) return null;

  return (
    // Backdrop
    <div className="custom-blur fixed inset-0 z-70 flex items-center justify-center bg-black/30 p-4 dark:bg-black/60">
      {/* Modal container */}
      <div className="max-h-[95vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-neutral-300 bg-neutral-50 shadow-2xl dark:border-neutral-800 dark:bg-neutral-950">
        {/* Header */}
        <div className="sticky top-0 right-0 left-0 mb-6 flex items-center justify-between border-b border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            Admin Panel
          </h2>
          <button
            onClick={() => setShowAdminPanel(false)}
            className="rounded-full p-1 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <p>
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sed
          veritatis excepturi quod illo exercitationem quisquam, accusantium
          aliquid quos voluptate corporis praesentium a suscipit nisi amet,
          itaque, nemo eos quasi dolorem. Lorem ipsum dolor sit amet
          consectetur, adipisicing elit. Sed veritatis excepturi quod illo
          exercitationem quisquam, accusantium aliquid quos voluptate corporis
          praesentium a suscipit nisi amet, itaque, nemo eos quasi dolorem.
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sed
          veritatis excepturi quod illo exercitationem quisquam, accusantium
          aliquid quos voluptate corporis praesentium a suscipit nisi amet,
          itaque, nemo eos quasi dolorem. Lorem ipsum dolor sit amet
          consectetur, adipisicing elit. Sed veritatis excepturi quod illo
          exercitationem quisquam, accusantium aliquid quos voluptate corporis
          praesentium a suscipit nisi amet, itaque, nemo eos quasi dolorem.
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sed
          veritatis excepturi quod illo exercitationem quisquam, accusantium
          aliquid quos voluptate corporis praesentium a suscipit nisi amet,
          itaque, nemo eos quasi dolorem. Lorem ipsum dolor sit amet
          consectetur, adipisicing elit. Sed veritatis excepturi quod illo
          exercitationem quisquam, accusantium aliquid quos voluptate corporis
          praesentium a suscipit nisi amet, itaque, nemo eos quasi dolorem.
          Lorem ipsum dolor sit amet consectetur, adipisicing elit. Sed
          veritatis excepturi quod illo exercitationem quisquam, accusantium
          aliquid quos voluptate corporis praesentium a suscipit nisi amet,
          itaque, nemo eos quasi dolorem. Lorem ipsum dolor sit amet
          consectetur, adipisicing elit. Sed veritatis excepturi quod illo
          exercitationem quisquam, accusantium aliquid quos voluptate corporis
          praesentium a suscipit nisi amet, itaque, nemo eos quasi dolorem.
        </p>
      </div>
    </div>
  );
};

export default AdminPanel;
