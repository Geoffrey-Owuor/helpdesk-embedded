import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { query } from "@/lib/Db";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { canViewIssue } from "@/lib/IssueAccess";

export const GET = withAuth<{ filename: string }>(async ({ params, user }) => {
  const { filename } = params;

  // Files are issue attachments - serve one only to those who can see its
  // issue (analytics viewers included). Unknown files 404 the same way.
  const attachment = await query<{ issue_id: string }>(
    `SELECT issue_id FROM issue_attachments WHERE file_url = $1 LIMIT 1`,
    [filename],
  );

  if (
    attachment.length === 0 ||
    !(await canViewIssue(attachment[0].issue_id, user, {
      allowAnalytics: true,
    }))
  ) {
    return new NextResponse("File Not Found", { status: 404 });
  }

  // Use your private server-side environment variable
  const baseDir: string = process.env.UPLOAD_BASE_DIR!;
  const filePath: string = path.join(baseDir, filename);

  // Security check: Prevent directory traversal attacks
  if (!filePath.startsWith(baseDir)) {
    return new NextResponse("Access Denied", { status: 403 });
  }

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return new NextResponse("File Not Found", { status: 404 });
  }

  // Read the file into a buffer
  const fileBuffer: Buffer = fs.readFileSync(filePath);

  // Determine content type based on file extension
  let contentType = "application/octet-stream";
  if (filename.endsWith(".pdf")) contentType = "application/pdf";
  if (filename.endsWith(".jpg") || filename.endsWith(".jpeg"))
    contentType = "image/jpeg";
  if (filename.endsWith(".png")) contentType = "image/png";
  if (filename.endsWith(".webp")) contentType = "image/webp";

  return new NextResponse(new Uint8Array(fileBuffer), {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `inline; filename="${filename}"`,
    },
  });
});
