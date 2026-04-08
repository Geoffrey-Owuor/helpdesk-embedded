import Image from "next/image";
import { assets } from "@/public/assets";

export const DashBoardLogo = ({
  isSideBarOpen,
}: {
  isSideBarOpen?: boolean;
}) => (
  <div className="relative flex items-center gap-0.5">
    <div className="relative h-8 w-8">
      <Image
        src={assets.issue_desk_image}
        alt="Issue Desk Logo"
        sizes="32px"
        loading="eager"
        className="object-contain dark:invert"
      />
    </div>
    <span
      className={`${isSideBarOpen ? "block" : "hidden"} text-xl font-semibold text-black dark:text-white`}
    >
      IssueDesk
    </span>
  </div>
);
