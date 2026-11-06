import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";
import { indicatorIconCircle } from "@/lib/indicatorStyles";

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
  <div className="flex flex-col rounded-xl border border-neutral-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
    <div className="mb-4 flex items-center gap-2 border-b border-neutral-100 pb-3 dark:border-neutral-800/50">
      <div className={indicatorIconCircle}>
        <Icon className="h-4 w-4" />
      </div>
      <h3 className="font-semibold text-neutral-900 dark:text-white">
        {title}
      </h3>
    </div>
    <div className="flex flex-col gap-5">{children}</div>
  </div>
);
