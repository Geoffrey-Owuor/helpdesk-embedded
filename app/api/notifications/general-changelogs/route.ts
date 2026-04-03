import { NextResponse } from "next/server";
import { query } from "@/lib/Db";

export async function GET() {
  const baseQuery = `
    SELECT changelog_id, changelog_updated_at, changelog_type, changelog_title, changelog_description
    FROM changelogs
    WHERE changelog_active = true
    `;

  try {
    const changelogs = await query(baseQuery);

    return NextResponse.json(changelogs, { status: 200 });
  } catch (error) {
    console.error("Error fetching changelogs data:", error);
    return NextResponse.json([], { status: 500 });
  }
}
