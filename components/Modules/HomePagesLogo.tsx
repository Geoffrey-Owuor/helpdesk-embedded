import Link from "next/link";
import { HotpointLogo } from "@/components/Modules/HotpointLogo";

const HomePagesLogo = () => {
  return (
    <Link href="/" className="flex items-center gap-1">
      <HotpointLogo className="size-6.5 text-black dark:text-white" />
      <span className="hidden text-xl font-semibold text-black sm:flex dark:text-white">
        HelpDesk
      </span>
    </Link>
  );
};

export default HomePagesLogo;
