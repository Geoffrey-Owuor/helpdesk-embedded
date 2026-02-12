import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { query } from "@/lib/Db";

const PUT = withAuth(async ({ request, user }) => {
  const { userId, role } = user;

  // Make sure the user running the query is an administrator
  if (role !== "admin") {
    return NextResponse.json(
      { message: "You are not authorized to perform this action" },
      { status: 403 },
    );
  }

  try {
  } catch (error) {}
});
