import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { query } from "@/lib/Db";
import { revalidateTag } from "next/cache";

export const POST = withAuth(async ({ request, user }) => {
  const { isSuper } = user;

  if (!isSuper) {
    return NextResponse.json(
      { message: "You are not authorized to perform this action" },
      { status: 403 },
    );
  }

  try {
    const { issueType, issuePriority, agentEmail, adminEmail, longName } =
      await request.json();

    if (!issueType || !issuePriority || !agentEmail || !adminEmail) {
      return NextResponse.json(
        { message: "Missing some required fields" },
        { status: 400 },
      );
    }

    // Get the corresponding admin id
    const adminData = await query(
      `
        SELECT user_id AS admin_id
        FROM users
        WHERE email = $1 AND is_user_active = TRUE LIMIT 1
        `,
      [adminEmail],
    );

    // Get the corresponding agent id
    const agentData = await query(
      `
        SELECT user_id AS agent_id
        FROM users
        WHERE email = $1 AND is_user_active = TRUE LIMIT 1
        `,
      [agentEmail],
    );

    // Admin not found
    if (adminData.length === 0) {
      return NextResponse.json(
        { message: "Selected admin could not be found" },
        { status: 404 },
      );
    }

    // Agent not found
    if (agentData.length === 0) {
      return NextResponse.json(
        { message: "Selected agent could not be found" },
        { status: 404 },
      );
    }

    // Selected issue type already exists in the issues database
    const existingIssueType = await query(
      `
        SELECT id FROM issues_mapping WHERE issue_type = $1
        `,
      [issueType],
    );

    if (existingIssueType.length > 0) {
      return NextResponse.json(
        { message: "An issue type already exists with the same name" },
        { status: 409 },
      );
    }

    // The returned data
    const adminId = adminData[0].admin_id;
    const agentId = agentData[0].agent_id;

    // Insert Query
    const insertQuery = `
    INSERT INTO issues_mapping(issue_type, admin_id, agent_id, issue_priority, long_name)
    VALUES ($1, $2, $3, $4, $5)
    `;

    const insertParams = [
      issueType,
      adminId,
      agentId,
      issuePriority,
      longName || issueType,
    ];

    await query(insertQuery, insertParams);

    // Revalidate the cache tags
    revalidateTag("GetIssueAgents", { expire: 0 });
    revalidateTag("Issue_Types", { expire: 0 });
    revalidateTag("Issue_Agents_Mapping", { expire: 0 });

    // Success Response
    return NextResponse.json(
      { message: "Issue type added successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error while trying to add an issuetype:", error);
    return NextResponse.json(
      { message: "Error while trying to add the issue type" },
      { status: 500 },
    );
  }
});
