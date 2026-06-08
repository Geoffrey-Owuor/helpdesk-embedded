"use client";

import { Plus, Trash2 } from "lucide-react";
import FormAsterisk from "../../FormAsterisk";

type DynamicEmailInputProps = {
  label: string;
  emails: string[];
  onChange: (index: number, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  required?: boolean;
};

export default function DynamicEmailInput({
  label,
  emails,
  onChange,
  onAdd,
  onRemove,
  required = false,
}: DynamicEmailInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-1 text-xs font-semibold text-neutral-500 uppercase dark:text-neutral-400">
        {label} {required && <FormAsterisk />}
      </label>

      {emails.map((email, index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => onChange(index, e.target.value)}
            required={required}
            placeholder={`Enter ${label.toLowerCase()} email...`}
            className="flex-1 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
          />
          {/* Allow removing any field unless it's the required primary 'To' field */}
          {(emails.length > 1 || !required) && (
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="rounded-lg p-2 text-neutral-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={onAdd}
        className="inline-flex w-fit items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
      >
        <Plus size={14} />
        Add another {label.toLowerCase()}
      </button>
    </div>
  );
}
