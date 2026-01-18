import ResetPassword from "@/components/AuthPages/ForgotPassword/ResetPassword";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { query } from "@/lib/Db";

// Props for the searchParams
type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
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
            AND reset_token_expiry > NOW()
            `,
        [token],
      );

      if (validToken.length > 0) isValid = true;
    }
  } catch (error) {
    console.error("Error validating reset token", error);
  }
  return (
    <Suspense>
      <ResetPassword isValid={isValid} />
    </Suspense>
  );
};

export default page;
