import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { query } from "@/lib/Db";
import { redirect } from "next/navigation";
import VerifyCode from "@/components/AuthPages/Register/VerifyCode";

const page = async () => {
  const cookieStore = await cookies();
  const cookie = cookieStore.get("verify_email")?.value;

  if (!cookie) redirect("/register");

  let verifiedEmail: string | null = null;

  // Our database check
  try {
    const secret = new TextEncoder().encode(process.env.AUTH_TOKEN_SECRET);
    const { payload } = await jwtVerify(cookie, secret);

    if (typeof payload?.email === "string") {
      const result = await query(
        `SELECT id FROM verification_codes
         WHERE email = $1 AND verified = FALSE AND expires_at > NOW()`,
        [payload.email],
      );

      if (result.length > 0) {
        verifiedEmail = payload.email;
      }
    }
  } catch (error) {
    console.error("Error viewing verify code page", error);
  }

  // Final check: if anything failed above, verifiedEmail remains null
  if (!verifiedEmail) {
    redirect("/register");
  }

  return <VerifyCode email={verifiedEmail} />;
};

export default page;
