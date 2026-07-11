import { pool } from "@/lib/Db";
import { PoolClient } from "pg";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { emailSender } from "@/services/EmailSender";
import { CheckBehalfUser } from "@/serverActions/CheckBehalfUser";
import { writeFile, mkdir } from "fs/promises";
import { issuePrefixMapping } from "@/public/assets";
import path from "path";

export const POST = withAuth(async ({ request, user }) => {
  // initialize the pool client variable
  let client: PoolClient | undefined;

  // Destructure the user information
  const { username, userId, email, department } = user;

  // Variables for holding the user info
  let selectedName = username;
  let selectedId = userId;
  let selectedEmail = email;
  let selectedDepartment = department;

  // Define our default agent value
  const defaultAgent = "Not Assigned";

  try {
    // Parse formData (we do not use JSON here)
    const formData = await request.formData();

    const target_department = formData.get("target_department") as string;
    const issue_type = formData.get("issue_type") as string;
    const issue_title = formData.get("issue_title") as string;
    const issue_description = formData.get("issue_description") as string;
    // Optional fields - Submitting on behalf of another user
    const behalf_user_name = formData.get("behalf_user_name") as string;
    const behalf_user_email = formData.get("behalf_user_email") as string;
    const behalf_user_department = formData.get(
      "behalf_user_department",
    ) as string;

    // Check if we have all the data
    if (
      !target_department ||
      !issue_type ||
      !issue_title ||
      !issue_description
    ) {
      return NextResponse.json(
        { message: "Missing some required fields" },
        { status: 400 },
      );
    }

    // 3. Extract and Process Files
    const files = formData.getAll("attachments") as File[];
    const emailAttachments = [];
    const dbAttachments = [];

    // Create the uploads directory path safely
    const uploadDir = process.env.UPLOAD_BASE_DIR!;

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
        localUrl: `${uniqueFilename}`,
      });
    }

    // Function to create/return the user who is being created a ticket for
    // And return the user details required for proceeding
    if (behalf_user_department && behalf_user_name && behalf_user_email) {
      const returnedUser = await CheckBehalfUser({
        name: behalf_user_name,
        email: behalf_user_email,
        department: behalf_user_department,
      });

      if (!returnedUser) {
        return NextResponse.json(
          {
            message:
              "Could not verify/create the user you're trying to submit for, please contact your admin",
          },
          { status: 422 },
        );
      }

      selectedName = returnedUser.name;
      selectedId = returnedUser.userId;
      selectedEmail = returnedUser.email;
      selectedDepartment = returnedUser.department;
    }

    // get a pool client
    client = await pool.connect();

    // begin a transaction
    await client.query("BEGIN");

    // construct a prepared statement
    const insertQuery = `
    INSERT INTO issues_table
    (issue_submitter_id, issue_submitter_name, issue_submitter_email, issue_submitter_department, issue_target_department, issue_type, issue_title, issue_description, issue_agent_name)
    VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING issue_id, issue_uuid
    `;

    // construct the params
    const params = [
      selectedId,
      selectedName,
      selectedEmail,
      selectedDepartment,
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

    // Update the submitted issue to insert a generated issue reference
    const referencePrefix = issuePrefixMapping[selectedDepartment] || "UNK";
    const formattedId = resultantId.toString().padStart(3, "0");
    const issueReferenceNumber = `${referencePrefix}-${formattedId}`;

    // The update query to insert a reference id
    await client.query(
      `
          UPDATE issues_table
          SET issue_reference_id = $1 WHERE issue_id = $2`,
      [issueReferenceNumber, resultantId],
    );

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
    const title = `New Issue ${issueReferenceNumber} Raised By ${user.username}`;
    const description = `A new issue has been raised to ${target_department} by ${user.username}`;

    // Fire and forget - calling the email sender service
    emailSender({
      title,
      description,
      uuid: resultantUuid,
      attachments: emailAttachments.length > 0 ? emailAttachments : undefined,
    });

    // Return a response to the client
    return NextResponse.json(
      { message: "Your issue has been submitted successfully!" },
      { status: 200 },
    );
  } catch (error) {
    if (client) await client.query("ROLLBACK");
    console.error("Error while submitting the issue", error);

    return NextResponse.json(
      { message: "Error while trying to submit your issue" },
      { status: 500 },
    );
  } finally {
    if (client) client.release();
  }
});
