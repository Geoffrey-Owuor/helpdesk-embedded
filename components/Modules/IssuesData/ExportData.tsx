import { Download } from "lucide-react";

const ExportData = () => {
  return (
    <div className="relative flex items-center justify-center p-0.75">
      {/* Ghost spinning border */}
      {/* <div className="absolute inset-0 animate-spin rounded-full border-t border-current" /> */}
      {/* Download button */}
      <button
        title="export"
        className="rounded-full bg-black p-2 text-white transition-colors duration-200 hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-300"
      >
        <Download className="h-5 w-5" />
      </button>
    </div>
  );
};

export default ExportData;
