import { pool } from "@/lib/Db";
import { PoolClient } from "pg";
import { NextResponse, NextRequest } from "next/server";
import { emailSender } from "@/services/EmailSender";
import { CheckBehalfUser } from "@/serverActions/CheckBehalfUser";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const secret = searchParams.get("secret");

  if (secret !== process.env.NEXT_PUBLIC_APIS_KEY) {
    return NextResponse.json(
      {
        message:
          "Wrong secret, please provide the right one or contact your admin",
      },
      { status: 400 },
    );
  }

  // initialize the pool client variable
  let client: PoolClient | undefined;

  // Define our default agent value
  const defaultAgent = "Not Assigned";

  try {
    // Parse formData (we do not use JSON here)
    const formData = await request.formData();

    // 2. Extract Text Fields
    const user_name = formData.get("user_name") as string;
    const user_email = formData.get("user_email") as string;
    const user_department = formData.get("user_department") as string;
    const target_department = formData.get("target_department") as string;
    const issue_type = formData.get("issue_type") as string;
    const issue_title = formData.get("issue_title") as string;
    const issue_description = formData.get("issue_description") as string;

    // Bad request - Missing some required fields
    if (
      !user_name ||
      !user_email ||
      !user_department ||
      !target_department ||
      !issue_type ||
      !issue_title ||
      !issue_description
    ) {
      return NextResponse.json(
        { message: "Some required fields are missing, please try again" },
        { status: 400 },
      );
    }

    // 3. Extract and Process Files
    const files = formData.getAll("attachments") as File[];
    const emailAttachments = [];
    const dbAttachments = [];

    // Create the uploads directory path safely
    const uploadDir = path.join(process.cwd(), "public", "uploads");

    // Ensure the uploads directory exists on your VPS, if not, create it silently
    await mkdir(uploadDir, { recursive: true });

    // Prepare email attachments, db attachments, and writing the files to our /public/uploads folder
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Prepare for Email (Base64)
      emailAttachments.push({
        filename: file.name,
        content: buffer.toString("base64"),
        contentType: file.type,
      });

      // Save to VPS Hard Drive
      const cleanFileName = file.name
        .replace(/[^a-zA-Z0-9.\-_]/g, "-") // 1. Replace anything NOT a letter, number, dot, or underscore with a hyphen
        .replace(/-+/g, "-") // 2. Collapse multiple hyphens into a single hyphen
        .replace(/^-+|-+$/g, ""); // 3. Trim hyphens from the very beginning or end
      const uniqueFilename = `${Date.now()}-${cleanFileName}`;
      const filePath = path.join(uploadDir, uniqueFilename);

      await writeFile(filePath, buffer);

      // Prepare for Database
      dbAttachments.push({
        filename: file.name,
        contentType: file.type,
        size: file.size,
        localUrl: `/uploads/${uniqueFilename}`,
      });
    }

    // Call the check behalf user to verify the user submitting an issue
    const returnedUser = await CheckBehalfUser({
      name: user_name,
      email: user_email,
      department: user_department,
    });

    if (!returnedUser) {
      return NextResponse.json(
        {
          message:
            "Could not verify/create the user trying to submit, please contact your admin",
        },
        { status: 422 },
      );
    }

    // get a pool client
    client = await pool.connect();

    // begin a transaction
    await client.query("BEGIN");

    // construct a prepared statement
    const insertQuery = `
    INSERT INTO issues_table
    (issue_submitter_id, issue_submitter_name, issue_submitter_email, issue_submitter_department, issue_target_department, issue_type, issue_title, issue_description, issue_agent_name, issue_reference_id)
    VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, generate_issue_reference())
    RETURNING issue_id, issue_uuid, issue_reference_id
    `;

    // construct the params
    const params = [
      returnedUser.userId,
      returnedUser.name,
      returnedUser.email,
      returnedUser.department,
      target_department,
      issue_type,
      issue_title,
      issue_description,
      defaultAgent,
    ];

    //run the query
    const { rows: returnedId } = await client.query(insertQuery, params);

    // Get the returned id
    const resultantId = returnedId[0].issue_id;
    const resultantUuid = returnedId[0].issue_uuid;
    const issueReferenceNumber = returnedId[0].issue_reference_id;

    // Insert Attachments
    if (dbAttachments.length > 0) {
      const insertAttachmentQuery = `
        INSERT INTO issue_attachments (issue_id, file_name, file_type, file_size, file_url)
        VALUES ($1, $2, $3, $4, $5)
      `;
      for (const att of dbAttachments) {
        await client.query(insertAttachmentQuery, [
          resultantUuid,
          att.filename,
          att.contentType,
          att.size,
          att.localUrl,
        ]);
      }
    }

    // Query to auto-assign the issue to an agent based on the target department and issue type
    //First, we fetch the necessary agent and admin info based on the issue type and target department.
    // This is done before the update to ensure we have the correct info in case of any issues during the update.

    const fetchAgentInfoQuery = `
    SELECT 
    agents.username AS agent_name,
    agents.email AS agent_email,
    admins.username AS admin_name,
    admins.email AS admin_email,
    m.issue_priority AS issue_priority,
    m.admin_id AS admin_id,
    m.agent_id AS agent_id
    FROM issues_mapping AS m
    JOIN users AS agents ON m.agent_id = agents.user_id
    JOIN users AS admins ON m.admin_id = admins.user_id
    WHERE m.issue_type = $1 AND admins.department = $2 AND agents.department = $2 LIMIT 1
    `;

    const fetchAgentInfoParams = [issue_type, target_department];

    const { rows: agentInfoRows } = await client.query(
      fetchAgentInfoQuery,
      fetchAgentInfoParams,
    );

    // If we found an agent mapping, proceed to update the issue with the agent info
    if (agentInfoRows.length > 0) {
      const agentInfo = agentInfoRows[0];

      // Update the issue with the agent info
      await client.query(
        `
        UPDATE issues_table
        SET issue_agent_email = $1, issue_agent_name = $2, issue_assigner_name = $3, issue_assigner_email = $4,
        issue_priority = $5, issue_agent_id = $6, issue_assigner_id = $7
        WHERE issue_id = $8
        `,
        [
          agentInfo.agent_email,
          agentInfo.agent_name,
          agentInfo.admin_name,
          agentInfo.admin_email,
          agentInfo.issue_priority,
          agentInfo.agent_id,
          agentInfo.admin_id,
          resultantId,
        ],
      );
    }

    // COMMIT THE TRANSACTION
    await client.query("COMMIT");

    // EMAIL SERVICE
    const title = `New Issue ${issueReferenceNumber} Raised By ${returnedUser.name}`;
    const description = `A new issue has been raised to ${target_department} by ${returnedUser.name}`;

    // Fire and forget - calling the email sender service
    // emailSender({
    //   title,
    //   description,
    //   uuid: resultantUuid,
    //   attachments: emailAttachments.length > 0 ? emailAttachments : undefined,
    // });

    // Return a response to the client
    return NextResponse.json(
      { message: "Your issue has been submitted successfully!" },
      { status: 200 },
    );
  } catch (error) {
    await client?.query("ROLLBACK");
    console.error("Error while trying to submit a quick create issue:", error);
    return NextResponse.json(
      { message: "An error occurred while trying to submit your issue" },
      { status: 500 },
    );
  } finally {
    if (client) client.release();
  }
}
