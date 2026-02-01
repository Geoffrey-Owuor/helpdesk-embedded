import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

// 1. New Detail Card Wrapper
export const DetailCard = ({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}) => (
  <div className="flex flex-col rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-[#0A0A0A]">
    <div className="mb-4 flex items-center gap-2 border-b border-neutral-100 pb-3 dark:border-neutral-800/50">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
        <Icon className="h-4 w-4" />
      </div>
      <h3 className="font-semibold text-neutral-900 dark:text-white">
        {title}
      </h3>
    </div>
    <div className="flex flex-col gap-5">{children}</div>
  </div>
);
