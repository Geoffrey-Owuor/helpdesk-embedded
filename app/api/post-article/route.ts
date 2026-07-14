import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { query } from "@/lib/Db";
import { NextResponse } from "next/server";

export const POST = withAuth(async ({ request, user }) => {
  const { username, userId, email, department } = user;

  try {
    const { formData, readTime } = await request.json();

    // Simple falsy value check
    if (!readTime || Object.values(formData).some((value) => !value)) {
      return NextResponse.json(
        { message: "Missing some required form data" },
        { status: 400 },
      );
    }

    // destructure the formData
    const {
      articleKey,
      articleTitle,
      articleSubtitle,
      articleType,
      articleContent,
    } = formData;

    // Check if the provided article key is still valid
    const validKey = await query(
      `SELECT 1 FROM article_key WHERE article_key = $1`,
      [articleKey],
    );

    if (validKey.length === 0) {
      return NextResponse.json(
        {
          message:
            "Provided key seems to have expired, please request a new one",
        },
        { status: 409 },
      );
    }

    // The key is still legit, perform an insert query
    const insertQuery = `
    INSERT INTO articles
    (article_type, article_title, article_subtitle, article_content, article_read_time, user_department, user_name, user_email, user_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;

    const insertParams = [
      articleType,
      articleTitle,
      articleSubtitle,
      articleContent,
      readTime,
      department,
      username,
      email,
      userId,
    ];

    // Run the query
    await query(insertQuery, insertParams);

    // Return a resposne
    return NextResponse.json(
      { message: "Article published successfully!" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error while trying to post an article:", error);
    return NextResponse.json(
      { message: "Error publishing the article!" },
      { status: 500 },
    );
  }
});
