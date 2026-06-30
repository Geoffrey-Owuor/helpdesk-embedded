import Link from "next/link";
import { assets } from "@/public/assets";
import Image from "next/image";

const HomePagesLogo = () => {
  return (
    <Link href="/" className="flex items-center gap-1">
      <div className="relative h-6.5 w-6.5">
        <Image
          src={assets.hotpoint_black_logo}
          alt="HelpDesk Logo"
          sizes="32px"
          loading="eager"
          className="object-contain dark:invert"
        />
      </div>
      <span className="hidden text-xl font-semibold text-black sm:flex dark:text-white">
        HelpDesk
      </span>
    </Link>
  );
};

export default HomePagesLogo;
