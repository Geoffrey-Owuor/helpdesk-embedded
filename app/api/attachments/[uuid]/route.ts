import { pool, query } from "@/lib/Db";
import { PoolClient } from "pg";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import type { AllowedFileType } from "@/components/Modules/IssueModals/DocumentUpload";

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

// Same restrictions as attachments added at issue submission time
const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES: AllowedFileType[] = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

// POST - Add one or more attachments to an existing issue. Anyone who can
// view the issue can attach files to it - no email is sent for this action.
export const POST = withAuth(async ({ request, params }) => {
  let client: PoolClient | undefined;

  const uuid = params.uuid as string;

  if (!uuid) {
    return NextResponse.json(
      { message: "No issue uuid passed" },
      { status: 400 },
    );
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll("attachments") as File[];

    if (files.length === 0) {
      return NextResponse.json(
        { message: "Select at least one file to attach" },
        { status: 400 },
      );
    }

    const hasInvalidType = files.some(
      (file) => !ALLOWED_TYPES.includes(file.type as AllowedFileType),
    );

    if (hasInvalidType) {
      return NextResponse.json(
        { message: "Only PDFs, JPGs, PNGs, and WebP files are allowed" },
        { status: 400 },
      );
    }

    const totalSize = files.reduce((total, file) => total + file.size, 0);

    if (totalSize > MAX_BYTES) {
      return NextResponse.json(
        { message: "Total attachment size cannot exceed 2MB" },
        { status: 400 },
      );
    }

    // get a pool client
    client = await pool.connect();

    // Begin a transaction
    await client.query("BEGIN");

    // Lock the issue row
    const { rows } = await client.query(
      `SELECT issue_status FROM issues_table WHERE issue_uuid = $1 FOR UPDATE`,
      [uuid],
    );

    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ message: "Issue not found" }, { status: 404 });
    }

    // Issue is already closed
    if (rows[0].issue_status === "closed") {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: "This issue is already marked as closed" },
        { status: 409 },
      );
    }

    // Create the uploads directory path safely
    const uploadDir = process.env.UPLOAD_BASE_DIR!;

    // Ensure the uploads directory exists on your VPS, if not, create it silently
    await mkdir(uploadDir, { recursive: true });

    const insertAttachmentQuery = `
      INSERT INTO issue_attachments (issue_id, file_name, file_type, file_size, file_url)
      VALUES ($1, $2, $3, $4, $5)
    `;

    // Write each file to the VPS hard drive and record it against the issue
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const cleanFileName = file.name
        .replace(/[^a-zA-Z0-9.\-_]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");
      const uniqueFilename = `${Date.now()}-${cleanFileName}`;
      const filePath = path.join(uploadDir, uniqueFilename);

      await writeFile(filePath, buffer);

      await client.query(insertAttachmentQuery, [
        uuid,
        file.name,
        file.type,
        file.size,
        uniqueFilename,
      ]);
    }

    // commit the transaction
    await client.query("COMMIT");

    return NextResponse.json(
      {
        message:
          files.length === 1
            ? "Attachment added successfully"
            : "Attachments added successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    await client?.query("ROLLBACK");
    console.error("Error while trying to add an attachment:", error);
    return NextResponse.json(
      { message: "Error while trying to add the attachment" },
      { status: 500 },
    );
  } finally {
    if (client) client.release();
  }
});
