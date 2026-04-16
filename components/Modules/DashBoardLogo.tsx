import Image from "next/image";
import { assets } from "@/public/assets";

export const DashBoardLogo = ({
  isSideBarOpen,
}: {
  isSideBarOpen?: boolean;
}) => (
  <div className="relative flex items-center gap-0.5">
    <div className="relative h-7 w-7">
      <Image
        src={assets.hotpoint_black_logo}
        alt="IssueDesk Logo"
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
