import { requireSession } from "@/lib/Auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await requireSession();

    if (user && user.userId) {
      //Session is valid
      return NextResponse.json({ loggedIn: true, userId: user.userId });
    } else {
      //Session is invalid
      return NextResponse.json({ loggedIn: false, userId: null });
    }
  } catch (error) {
    //An error occurred during session validation - treated as log out
    console.error(
      "Session validation error while checking user session:",
      error,
    );
    return NextResponse.json({ loggedIn: false, userId: null });
  }
}
