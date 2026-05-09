import { query } from "@/lib/Db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";

export const GET = withAuth(async ({ params }) => {
  if (!params.uuid) {
    return NextResponse.json(
      { message: "No issue uuid passed" },
      { status: 400 },
    );
  }

  try {
    const baseQuery = `
      SELECT id, file_name, file_type, file_size, file_url, created_at
      FROM issue_attachments
      WHERE issue_id = $1
      ORDER BY created_at ASC
    `;

    const rows = await query(baseQuery, [params.uuid as string]);
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("Error fetching attachments:", error);
    return NextResponse.json(
      { message: "Failed to fetch attachments" },
      { status: 500 },
    );
  }
});
