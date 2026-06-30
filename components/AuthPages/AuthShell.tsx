import ThemeToggle from "../Themes/ThemeToggle";
import { currentYear } from "@/public/assets";
import HomePagesLogo from "../Modules/HomePagesLogo";
import { Star } from "lucide-react";
import { footerQuickLinks } from "@/public/assets";
import { DbStatusPill } from "../Modules/DbStatus/DbStatusPill";
import Link from "next/link";

const AuthShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="layout-scrollbar home-container h-screen overflow-y-auto bg-white dark:bg-neutral-950">
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col items-center 2xl:max-w-7xl">
        {/* Logo and Theme Toggle*/}
        <div className="sticky top-0 right-0 left-0 z-50 w-full bg-white/60 dark:bg-neutral-950/60">
          <nav className="custom:px-8 mx-auto flex h-16 max-w-6xl items-center justify-between px-4 2xl:max-w-7xl">
            {/* App logo */}
            <HomePagesLogo />
            {/* Right side controls */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <DbStatusPill />
            </div>
          </nav>
        </div>

        {/* Auth Cards */}
        <div className="flex w-full flex-1 items-center justify-center px-3">
          {children}
        </div>

        {/* Bottom Footer */}
        <div className="mt-12 mb-16 flex w-full flex-col items-center justify-between gap-4 p-6 text-sm text-neutral-500 md:mb-0 md:flex-row">
          {/* Left Area: Copyright & Attribution */}
          <span className="inline-flex items-center gap-2 leading-5">
            <span>&copy; {currentYear} HelpDesk. Hotpoint Appliances Ltd</span>
          </span>

          <span className="inline-flex items-center gap-2">
            <a
              href="https://jeff-portfolio-web.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-neutral-700 hover:underline dark:text-neutral-300"
            >
              Jeff
            </a>
            And
            <Link
              href="/it-team"
              className="inline-flex items-center gap-0.5 font-semibold text-neutral-700 hover:underline dark:text-neutral-300"
            >
              <Star className="h-4 w-4" />
              Team
            </Link>
          </span>

          {/* Right Area: Quick Links */}
          <nav className="flex items-center gap-4 sm:gap-6">
            {footerQuickLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[13px] text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default AuthShell;
