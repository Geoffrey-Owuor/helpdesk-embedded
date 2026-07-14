import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { query } from "@/lib/Db";

export const GET = withAuth(async ({ user }) => {
  const { isSuper } = user;

  if (!isSuper) {
    return NextResponse.json(
      { message: "You are not authorized to perform this action" },
      { status: 403 },
    );
  }

  try {
    const baseQuery = `
      SELECT id, emails, department
      FROM group_emails
      ORDER BY id ASC
    `;

    const groupEmails = await query(baseQuery);

    return NextResponse.json(groupEmails, { status: 200 });
  } catch (error) {
    console.error("Error while trying to get group emails", error);
    return NextResponse.json([], { status: 500 });
  }
});
