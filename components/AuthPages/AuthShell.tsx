import ThemeToggle from "../Themes/ThemeToggle";
import { currentYear } from "@/public/assets";
import HomePagesLogo from "../Modules/HomePagesLogo";

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
        <p className="text-sm text-neutral-500">
          &copy; {currentYear} Issue Desk. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default AuthShell;
