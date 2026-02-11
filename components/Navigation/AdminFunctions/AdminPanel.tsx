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
    <div className="fixed inset-0 z-70 bg-black/50 dark:bg-black/60">
      <div className="flex items-center justify-between rounded-xl border bg-white dark:bg-neutral-900">
        <span>This is the Admin Panel</span>
        <button
          onClick={() => setShowAdminPanel(false)}
          className="rounded-xl bg-neutral-200 p-2 dark:bg-neutral-900"
        >
          <X />
        </button>
      </div>
    </div>
  );
};

export default AdminPanel;
