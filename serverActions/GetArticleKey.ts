"use server";
import { query } from "@/lib/Db";
import { requireSession } from "@/lib/Auth";

type ArticleKey = string;
export const GetArticleKey = async (): Promise<ArticleKey> => {
  const session = await requireSession();

  if (!session) {
    return "fall_back_key";
  }
  const keyIdentifier = "article_key";
  const articleKey = await query(
    `SELECT article_key FROM article_key WHERE key_identifier = $1 LIMIT 1`,
    [keyIdentifier],
  );

  const returnedKey: ArticleKey = articleKey[0].article_key;

  return returnedKey ?? "fall_back_key";
};
