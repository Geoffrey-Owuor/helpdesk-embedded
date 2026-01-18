import { CheckCircle2, Circle } from "lucide-react";
import { NameValidationResult } from "@/utils/Validators";

interface NameRulesCardProps {
  validation: NameValidationResult;
  isVisible: boolean;
}

const RuleItem = ({ label, passed }: { label: string; passed: boolean }) => (
  <div
    className={`flex items-center gap-2 text-xs ${passed ? "text-green-600" : "text-neutral-500"}`}
  >
    {passed ? (
      <CheckCircle2 className="h-3 w-3" />
    ) : (
      <Circle className="h-3 w-3" />
    )}
    <span>{label}</span>
  </div>
);

const NameRulesCard = ({ validation, isVisible }: NameRulesCardProps) => {
  if (!isVisible) return null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 absolute -top-28 left-0 z-10 w-full rounded-lg border border-neutral-200 bg-white p-4 shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
      <h4 className="mb-2 text-sm font-semibold text-neutral-900 dark:text-white">
        Name Requirements
      </h4>
      <div className="space-y-1">
        <RuleItem
          label="Two names (First & Last)"
          passed={validation.hasTwoNames}
        />
        <RuleItem
          label="Separated by one space"
          passed={validation.singleSpace}
        />
        <RuleItem
          label="Both start with capital letters"
          passed={validation.isCapitalized}
        />
      </div>
      {/* Decorative Arrow pointing down */}
      <div className="absolute -bottom-2 left-6 h-4 w-4 rotate-45 border-r border-b border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-800"></div>
    </div>
  );
};

export default NameRulesCard;
