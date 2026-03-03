import { NextResponse } from "next/server";
import { query } from "@/lib/Db";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";

export const GET = withAuth(async ({ user }) => {
  const { userId } = user;

  try {
    // get time when the user last viewed the changelog
    //we use a fallback date if the user has never viewed the changelogs
    const result = await query(
      `
    SELECT COALESCE(notifications_last_viewed_at, '1970-01-01') AS notifications_last_viewed_at
    FROM users
    WHERE user_id = $1
    `,
      [userId],
    );

    //Assign the value to a variable
    const notificationDate = result[0].notifications_last_viewed_at;

    //Fetch active changelogs updated after the user last viewed the changelogs
    const changelogs = await query(
      `
    SELECT changelog_id, changelog_updated_at, changelog_type, changelog_title, changelog_description
    FROM changelogs
    WHERE changelog_active = true
    AND changelog_updated_at > $1
    ORDER BY changelog_updated_at DESC
    `,
      [notificationDate],
    );

    //putting a response in one object
    const responseObject = {
      notificationDate,
      changelogs,
    };

    return NextResponse.json(responseObject, { status: 200 });
  } catch (error) {
    console.error("Error while trying to fetch changelogs data:", error);
    return NextResponse.json(
      { message: "Error while fetching changelogs" },
      { status: 500 },
    );
  }
});
