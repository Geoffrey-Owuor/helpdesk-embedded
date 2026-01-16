import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { query } from "@/lib/Db";
import { verifyRefreshTokenJWT } from "@/lib/Auth";

// For logging out everywhere
export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  // Clearing refresh token reference from the database
  if (refreshToken) {
    try {
      const payload = await verifyRefreshTokenJWT(refreshToken);
      const params = [payload?.userId];
      const baseQuery = `UPDATE users
           SET refresh_token = NULL,
               refresh_token_expiry = NULL
           WHERE user_id = $1`;

      if (payload?.userId) await query(baseQuery, params);
    } catch (error) {
      console.error("Logout DB update failed:", error);
    }
  }

  /**
   * CLIENT LOGOUT (AUTHORITATIVE) - Runs even if the above db query fails for some reason
   */
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");

  return NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });
}
