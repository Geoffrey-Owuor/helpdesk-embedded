import Image from "next/image";
import { assets } from "@/public/assets";
import ThemeToggle from "../Themes/ThemeToggle";
import Link from "next/link";

// Get current year
const currentYear = new Date().getFullYear();

const AuthShell = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen flex-col items-center">
      {/* Logo */}
      <div className="custom:left-8 fixed top-4 left-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8">
            <Image
              src={assets.issue_desk_image}
              alt="Issue Desk Lo go"
              className="dark:invert"
            />
          </div>
          <span className="hidden text-xl font-semibold text-black sm:flex dark:text-white">
            Issue Desk
          </span>
        </Link>
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
