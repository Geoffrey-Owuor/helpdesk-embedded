import { HotpointLogo } from "@/components/Modules/HotpointLogo";

export const DashBoardLogo = ({
  isSideBarOpen,
}: {
  isSideBarOpen?: boolean;
}) => (
  <div className="relative flex items-center gap-0.5">
    <HotpointLogo className="size-6.5 text-black dark:text-white" />
    <span
      className={`${isSideBarOpen ? "block" : "hidden"} text-xl font-semibold text-black dark:text-white`}
    >
      HelpDesk
    </span>
  </div>
);
