import Link from "next/link";
import { assets } from "@/public/assets";
import Image from "next/image";

const HomePagesLogo = () => {
  return (
    <Link href="/" className="flex items-center gap-0.5">
      <div className="relative h-8 w-8">
        <Image
          src={assets.issue_desk_image}
          alt="Issue Desk Logo"
          sizes="32px"
          loading="eager"
          className="object-contain dark:invert"
        />
      </div>
      <span className="hidden text-xl font-semibold text-black sm:flex dark:text-white">
        Issue Desk
      </span>
    </Link>
  );
};

export default HomePagesLogo;
