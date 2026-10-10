import { query } from "@/lib/Db";
import { isUuid } from "@/lib/isUuid";

// The title and subtitle an article page uses for its <title>/description
// metadata - fetched server-side rather than trusted from the URL, so a link
// can't put arbitrary text in the page title. Articles are all public.
export const getArticleMeta = async (
  uuid: string,
): Promise<{ article_title: string; article_subtitle: string } | null> => {
  if (!isUuid(uuid)) return null;

  const rows = await query<{ article_title: string; article_subtitle: string }>(
    `SELECT article_title, article_subtitle FROM articles
     WHERE article_id = $1 LIMIT 1`,
    [uuid],
  );

  return rows[0] ?? null;
};
