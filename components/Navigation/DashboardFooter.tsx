import { Sparkles } from "lucide-react";
import { currentYear } from "@/public/assets";

const DashboardFooter = () => {
  return (
    <footer className="flex justify-center px-6 py-4 text-sm text-neutral-500">
      <span className="inline-flex items-center gap-2 text-sm leading-5 text-neutral-500">
        <span> &copy; {currentYear} Issue Desk. Built by</span>
        <a
          href="https://jeff-portfolio-web.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-semibold text-neutral-700 hover:underline dark:text-neutral-300"
        >
          <Sparkles className="h-4 w-4" />
          Jeff
        </a>
      </span>
    </footer>
  );
};

export default DashboardFooter;
