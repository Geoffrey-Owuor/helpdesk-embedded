import Image from "next/image";
import { assets } from "@/public/assets";

export const DashBoardLogo = ({
  isSideBarOpen,
}: {
  isSideBarOpen?: boolean;
}) => (
  <div className="flex items-center gap-0.5">
    <div className="h-8 w-8">
      <Image
        src={assets.issue_desk_image}
        alt="Issue Desk Logo"
        className="dark:invert"
      />
    </div>
    <span
      className={`${isSideBarOpen ? "block" : "hidden sm:block"} text-xl font-semibold text-black dark:text-white`}
    >
      Issue Desk
    </span>
  </div>
);
