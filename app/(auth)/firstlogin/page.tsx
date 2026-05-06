import FirstLogin from "@/components/AuthPages/FirstLogin/FirstLogin";
import { Suspense } from "react";
import { query } from "@/lib/Db";
import { redirect } from "next/navigation";
import SuspenseSkeleton from "@/components/Skeletons/SuspenseSkeleton";

// Props for the searchParams
type Props = {
  searchParams: Promise<{ [key: string]: string | undefined }>;
};

const page = async ({ searchParams }: Props) => {
  // get the token
  const searchparams = await searchParams;

  const token = searchparams?.token;

  // if not token redirect to login
  if (!token) redirect("/login");

  let isValid = false;

  try {
    if (typeof token === "string") {
      const validToken = await query(
        `
            SELECT user_id FROM users
            WHERE reset_token = $1
            `,
        [token],
      );

      if (validToken.length > 0) isValid = true;
    }
  } catch (error) {
    console.error("Error validating reset token", error);
  }

  return (
    <Suspense fallback={<SuspenseSkeleton />}>
      <FirstLogin isValid={isValid} token={token} />
    </Suspense>
  );
};

export default page;
