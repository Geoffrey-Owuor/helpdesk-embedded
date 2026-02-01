import { titleHelper } from "@/public/assets";

// 2. Info Block (Slightly refined)
export const InfoBlock = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
  truncate?: boolean;
}) => (
  <div className="flex flex-col">
    <span className="text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-500">
      {label}
    </span>
    <span
      className="mt-1 max-w-62.5 truncate font-semibold text-neutral-900 dark:text-neutral-200"
      title={titleHelper(value)}
    >
      {value}
    </span>
  </div>
);
