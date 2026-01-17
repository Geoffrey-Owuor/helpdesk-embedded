import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { query } from "@/lib/Db";
import { redirect } from "next/navigation";
import VerifyCode from "@/components/AuthPages/Register/VerifyCode";

const page = async () => {
  const cookieStore = await cookies();
  const cookie = cookieStore.get("verify_email")?.value;

  if (!cookie) redirect("/register");

  // Our database check
  try {
    const secret = new TextEncoder().encode(process.env.AUTH_TOKEN_SECRET);
    const { payload } = await jwtVerify(cookie, secret);
    const email = payload?.email;

    if (typeof email !== "string") redirect("/register");

    const result = await query(
      `SELECT id FROM verification_codes
            WHERE email = $1 AND verified = FALSE AND expires_at > NOW()`,
      [email],
    );

    if (result.length === 0) {
      redirect("/register");
    }

    return <VerifyCode />;
  } catch (error) {
    console.error("Error viewing verify code page", error);
    redirect("/register");
  }
};

export default page;
