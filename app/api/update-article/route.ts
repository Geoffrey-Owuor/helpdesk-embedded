import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { pool } from "@/lib/Db";
import { PoolClient } from "pg";

export const PUT = withAuth(async ({ request }) => {
  let client: PoolClient | undefined;

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

    // get a pool client
    client = await pool.connect();

    // Check if the article exists
    const { rows } = await client.query(
      `SELECT can_edit FROM articles WHERE article_id = $1 FOR UPDATE`,
      [articleKey],
    );

    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: "Selected article to update could not be found" },
        { status: 404 },
      );
    }

    // Check if the article can be edited
    const canEdit: boolean = rows[0].can_edit;

    // Can edit boolean has been set to false
    if (!canEdit) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: "Selected article cannot be edited, contact admin" },
        { status: 409 },
      );
    }

    // Article exists, lets update it
    const updateQuery = `
    UPDATE articles
    SET article_title = $1,
    article_subtitle = $2,
    article_type = $3,
    article_content = $4,
    article_read_time = $5,
    article_updated_at = CURRENT_TIMESTAMP,
    can_edit = FALSE
    WHERE article_id = $6
    `;

    const updateParams = [
      articleTitle,
      articleSubtitle,
      articleType,
      articleContent,
      readTime,
      articleKey,
    ];

    // Run the update query
    await client.query(updateQuery, updateParams);

    // Return a response
    return NextResponse.json(
      { message: "Article updated successfully" },
      { status: 200 },
    );
  } catch (error) {
    await client?.query("ROLLBACK");
    console.error("Error while trying to update the article", error);
    return NextResponse.json(
      { message: "An error occurred while trying to update the article" },
      { status: 500 },
    );
  } finally {
    if (client) client.release();
  }
});
