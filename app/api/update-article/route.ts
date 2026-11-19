import { NextResponse } from "next/server";
import { articleReadTime } from "@/lib/articles/markdownText";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { query } from "@/lib/Db";
import { isUuid } from "@/lib/isUuid";

export const PUT = withAuth(async ({ request, user }) => {
  try {
    const { formData } = await request.json();

    // Simple falsy value check
    if (!formData || Object.values(formData).some((value) => !value)) {
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

    // Worked out here from the rendered text, not trusted from the client
    const readTime = articleReadTime(articleContent);

    if (!isUuid(articleKey)) {
      return NextResponse.json(
        { message: "Selected article to update could not be found" },
        { status: 404 },
      );
    }

    // One statement: the can_edit check and the update can't be split by a
    // concurrent edit, so there's no transaction or row lock to manage.
    // Only the author or a super admin may edit. Saving locks the article
    // until an admin re-enables editing.
    const updated = await query<{ article_id: string }>(
      `UPDATE articles
       SET article_title = $1,
           article_subtitle = $2,
           article_type = $3,
           article_content = $4,
           article_read_time = $5,
           article_updated_at = CURRENT_TIMESTAMP,
           can_edit = FALSE
       WHERE article_id = $6
         AND can_edit = TRUE
         AND (user_id = $7 OR $8::boolean)
       RETURNING article_id`,
      [
        articleTitle,
        articleSubtitle,
        articleType,
        articleContent,
        readTime,
        articleKey,
        user.userId,
        user.isSuper === true,
      ],
    );

    if (updated.length === 0) {
      // Nothing updated: work out why
      const [existing] = await query<{ user_id: string; can_edit: boolean }>(
        `SELECT user_id, can_edit FROM articles WHERE article_id = $1`,
        [articleKey],
      );
      if (!existing) {
        return NextResponse.json(
          { message: "Selected article to update could not be found" },
          { status: 404 },
        );
      }
      if (existing.user_id !== user.userId && !user.isSuper) {
        return NextResponse.json(
          { message: "Only the author or a super admin can edit this article" },
          { status: 403 },
        );
      }
      return NextResponse.json(
        { message: "Selected article cannot be edited, contact admin" },
        { status: 409 },
      );
    }

    // Return a response
    return NextResponse.json(
      { message: "Article updated successfully", readTime },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error while trying to update the article", error);
    return NextResponse.json(
      { message: "An error occurred while trying to update the article" },
      { status: 500 },
    );
  }
});
