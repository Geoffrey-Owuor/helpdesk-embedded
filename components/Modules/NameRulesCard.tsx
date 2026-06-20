import { CheckCircle2, Circle, XCircle } from "lucide-react";
import { NameValidationResult } from "@/utils/Validators";

interface NameRulesCardProps {
  validation: NameValidationResult;
  isVisible: boolean;
}

// 1. Improved RuleItem with transitions and dark mode support
const RuleItem = ({ label, passed }: { label: string; passed: boolean }) => (
  <div
    className={`flex items-center gap-2.5 text-[13px] transition-colors duration-300 ${
      passed
        ? "font-medium text-emerald-600 dark:text-emerald-400"
        : "text-neutral-500 dark:text-neutral-400"
    }`}
  >
    {passed ? (
      <CheckCircle2 className="h-4 w-4 shrink-0" />
    ) : (
      <Circle className="h-4 w-4 shrink-0 opacity-40" />
    )}
    <span>{label}</span>
  </div>
);

const NameRulesCard = ({ validation, isVisible }: NameRulesCardProps) => {
  if (!isVisible) return null;

  return (
    <div className="absolute top-[calc(100%+6px)] left-0 z-50 w-full rounded-xl border border-neutral-200 bg-white p-4 shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
      {/* Requirements Section */}
      <div className="mb-5">
        <h4 className="mb-3 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          Name Requirements
        </h4>
        <div className="flex flex-col gap-2.5">
          <RuleItem label="Exactly two names" passed={validation.hasTwoNames} />
          <RuleItem
            label="Separated by a single space"
            passed={validation.singleSpace}
          />
          <RuleItem
            label="Starts with a capital letter"
            passed={validation.isCapitalized}
          />
        </div>
      </div>

      {/* Examples Section */}
      <div className="border-t border-neutral-200 pt-4 dark:border-neutral-800">
        <p className="mb-3 text-[11px] font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
          Examples
        </p>

        <div className="grid grid-cols-2 gap-4">
          {/* Valid Examples */}
          <div className="flex flex-col gap-2">
            <span className="w-fit rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-emerald-700 uppercase dark:bg-emerald-900/30 dark:text-emerald-400">
              Valid
            </span>
            <ul className="flex flex-col gap-1.5 text-xs text-neutral-700 dark:text-neutral-300">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                Jane Doe
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                O&apos;Connor Smith
              </li>
            </ul>
          </div>

          {/* Invalid Examples */}
          <div className="flex flex-col gap-2">
            <span className="w-fit rounded-md bg-red-100 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-red-700 uppercase dark:bg-red-900/30 dark:text-red-400">
              Invalid
            </span>
            <ul className="flex flex-col gap-1.5 text-xs text-neutral-700 dark:text-neutral-300">
              <li className="flex flex-wrap items-center gap-1.5">
                <XCircle className="h-3.5 w-3.5 text-red-500 opacity-80" />
                Jane{" "}
                <span className="text-neutral-400 italic">(Only one name)</span>
              </li>
              <li className="flex flex-wrap items-center gap-1.5">
                <XCircle className="h-3.5 w-3.5 text-red-500 opacity-80" />
                jane doe{" "}
                <span className="text-neutral-400 italic">(Lowercase)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NameRulesCard;
