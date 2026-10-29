import { GitPullRequestArrow } from "lucide-react";

// Marks an issue type as a change request (issues_mapping.is_change_request,
// migrations/008) - the analytics SLA section reports these against the
// change request target. Shared by the Add and Edit issue type modals.
const ChangeRequestToggle = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => (
  <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-neutral-200 px-3.5 py-3 transition-colors hover:bg-neutral-50 has-focus-visible:ring-2 has-focus-visible:ring-neutral-300 dark:border-neutral-800 dark:hover:bg-neutral-900/50 dark:has-focus-visible:ring-neutral-700">
    <span className="flex items-start gap-2.5">
      <GitPullRequestArrow className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
      <span className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Change request
        </span>
        <span className="text-xs text-neutral-500 dark:text-neutral-400">
          Issues of this type count towards the change request SLA target
        </span>
      </span>
    </span>
    <input
      type="checkbox"
      role="switch"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="peer sr-only"
    />
    <span
      aria-hidden="true"
      className="relative mt-0.5 h-5 w-9 shrink-0 rounded-full bg-neutral-300 transition-colors peer-checked:bg-neutral-900 after:absolute after:top-0.5 after:left-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:after:translate-x-4 dark:bg-neutral-700 dark:peer-checked:bg-neutral-100 dark:after:bg-neutral-100 dark:peer-checked:after:bg-neutral-900"
    />
  </label>
);

export default ChangeRequestToggle;
