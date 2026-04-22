import ThemeToggle from "../Themes/ThemeToggle";
import { currentYear } from "@/public/assets";
import HomePagesLogo from "../Modules/HomePagesLogo";
import { Sparkles } from "lucide-react";
import { DbStatusPill } from "../Modules/DbStatus/DbStatusPill";

const AuthShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="layout-scrollbar home-container h-screen overflow-y-auto bg-white dark:bg-neutral-950">
      <div className="mx-auto flex h-full w-full max-w-6xl flex-col items-center 2xl:max-w-7xl">
        {/* Logo and Theme Toggle*/}
        <div className="fixed top-0 right-0 left-0 z-50">
          <nav className="custom:px-8 mx-auto flex h-16 max-w-6xl items-center justify-between px-4 2xl:max-w-7xl">
            {/* App logo */}
            <HomePagesLogo />
            {/* Right side controls */}
            <div className="flex items-center gap-3">
              <DbStatusPill />
              <ThemeToggle />
            </div>
          </nav>
        </div>

        {/* Auth Cards */}
        <div className="flex w-full flex-1 items-center justify-center">
          {children}
        </div>

        {/* Bottom Footer */}
        <div className="p-4">
          <span className="inline-flex items-center gap-2 text-sm leading-5 text-neutral-500">
            <span> &copy; {currentYear} IssueDesk. Built by</span>
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
        </div>
      </div>
    </div>
  );
};

export default AuthShell;
