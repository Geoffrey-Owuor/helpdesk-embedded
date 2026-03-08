import ThemeToggle from "../Themes/ThemeToggle";
import { currentYear } from "@/public/assets";
import HomePagesLogo from "../Modules/HomePagesLogo";
import { Sparkles } from "lucide-react";

const AuthShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen flex-col items-center">
      {/* Logo */}
      <div className="custom:left-8 fixed top-4 left-4">
        {/* App logo */}
        <HomePagesLogo />
      </div>

      {/* Theme Toggle */}
      <div className="custom:right-12 fixed top-4 right-8 h-6 w-6">
        <ThemeToggle />
      </div>

      {/* Auth Cards */}
      <div className="flex w-full flex-1 items-center justify-center">
        {children}
      </div>

      {/* Bottom Footer */}
      <div className="p-4">
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
      </div>
    </div>
  );
};

export default AuthShell;
