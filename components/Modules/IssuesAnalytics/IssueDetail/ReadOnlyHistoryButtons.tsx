"use client";
import { useState } from "react";
import { UndoDot, GitMerge } from "lucide-react";
import EscalationHistoryModal from "@/components/Modules/IssuePage/EscalationHistoryModal";
import ReopenHistoryModal from "@/components/Modules/IssuePage/ReopenHistoryModal";

const ReadOnlyHistoryButtons = ({
  uuid,
  reopenedCount,
  escalatedCount,
}: {
  uuid: string;
  reopenedCount: number;
  escalatedCount: number;
}) => {
  const [reopenHistoryOpen, setReopenHistoryOpen] = useState(false);
  const [escalationHistoryOpen, setEscalationHistoryOpen] = useState(false);

  return (
    <>
      {reopenedCount > 0 && (
        <button
          onClick={() => setReopenHistoryOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          <UndoDot size={12} />
          reopening history
        </button>
      )}

      {escalatedCount > 0 && (
        <button
          onClick={() => setEscalationHistoryOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          <GitMerge size={12} />
          escalation history
        </button>
      )}

      {reopenHistoryOpen && (
        <ReopenHistoryModal
          isOpen={reopenHistoryOpen}
          uuid={uuid}
          closeModal={() => setReopenHistoryOpen(false)}
        />
      )}

      {escalationHistoryOpen && (
        <EscalationHistoryModal
          isOpen={escalationHistoryOpen}
          uuid={uuid}
          closeModal={() => setEscalationHistoryOpen(false)}
        />
      )}
    </>
  );
};

export default ReadOnlyHistoryButtons;
