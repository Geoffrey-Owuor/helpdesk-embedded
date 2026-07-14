import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Define the shape of the dynamic route parameters
type RouteParams = {
  params: Promise<{
    filename: string;
  }>;
};

export async function GET(
  _req: NextRequest,
  { params }: RouteParams,
): Promise<NextResponse> {
  // Await the params object (required in newer Next.js App Router versions)
  const { filename } = await params;

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
}
