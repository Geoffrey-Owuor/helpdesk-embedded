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
    <div className="flex flex-wrap items-center gap-2">
      <label className="flex items-center gap-1 text-xs font-semibold text-neutral-500 uppercase dark:text-neutral-400">
        {label} {required && <FormAsterisk />}
      </label>

      {emails.map((email, index) => (
        <div key={index} className="flex items-center gap-2">
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => onChange(index, e.target.value)}
              required={required}
              placeholder={`Enter ${label.toLowerCase()} email...`}
              className="min-w-50 flex-1 rounded-xl border border-neutral-300 bg-white py-2 pr-8 pl-3 text-sm text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            />
            {/* Allow removing any field unless it's the required primary 'To' field */}
            {(emails.length > 1 || !required) && (
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="absolute top-1/2 right-0.75 -translate-y-1/2 rounded-lg p-2 text-neutral-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={onAdd}
        className="rounded-full bg-blue-100 p-2 text-xs font-medium text-blue-600 hover:bg-blue-200/70 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
