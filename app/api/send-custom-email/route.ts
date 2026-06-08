import { NextResponse } from "next/server";
import { sendCustomGraphEmail } from "@/services/CustomEmailSender";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";

export const POST = withAuth(async ({ request }) => {
  try {
    const formData = await request.formData();

    // Extract text fields
    const from = formData.get("from") as string;
    const subject = formData.get("subject") as string;
    const html = formData.get("html") as string;

    // Parse JSON array strings back to arrays
    const to = JSON.parse((formData.get("to") as string) || "[]");
    const cc = JSON.parse((formData.get("cc") as string) || "[]");
    const bcc = JSON.parse((formData.get("bcc") as string) || "[]");

    if (!from || !to.length || !html) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 },
      );
    }

    // Process attachments
    const files = formData.getAll("attachments") as File[];
    const attachments = await Promise.all(
      files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        return {
          filename: file.name,
          contentType: file.type,
          content: buffer.toString("base64"), // Graph API requires base64 string
        };
      }),
    );

    // Call our Microsoft Graph service
    const result = await sendCustomGraphEmail({
      from,
      to,
      cc,
      bcc,
      subject,
      html,
      attachments,
    });

    if (!result.success) {
      return NextResponse.json({ message: result.error }, { status: 500 });
    }

    return NextResponse.json(
      { message: "Email dispatched successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error in send-custom-email route:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
});
