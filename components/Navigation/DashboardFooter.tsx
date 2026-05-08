import { Sparkles } from "lucide-react";
import Link from "next/link";
import { currentYear } from "@/public/assets";
import { footerQuickLinks } from "@/public/assets";

const DashboardFooter = () => {
  return (
    <footer className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 p-6 text-sm text-neutral-500 md:flex-row 2xl:max-w-7xl">
      {/* Left Area: Copyright & Attribution */}
      <span className="inline-flex items-center gap-2 leading-5">
        <span>&copy; {currentYear} IssueDesk. Hotpoint Appliances Ltd</span>
      </span>

      <span className="inline-flex items-center gap-2">
        Built by{" "}
        <a
          href="https://jeff-portfolio-web.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 font-semibold text-neutral-700 hover:underline dark:text-neutral-300"
        >
          <Sparkles className="h-4 w-4" />
          Jeff
        </a>
      </span>

      {/* Right Area: Quick Links */}
      <nav className="flex items-center gap-4 sm:gap-6">
        {footerQuickLinks.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            target="_blank"
            className="text-[13px] text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </footer>
  );
};

export default DashboardFooter;
