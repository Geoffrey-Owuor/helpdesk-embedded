"use server";
import { query } from "@/lib/Db";

export interface ArticleData {
  article_type: string;
  article_title: string;
  article_subtitle: string;
  article_content: string;
  article_read_time: string;
  article_updated_at: string;
  user_department: string;
  user_name: string;
}

export const getArticle = async (uuid: string): Promise<ArticleData | null> => {
  const baseQuery = `
  SELECT 
  article_type, article_title, article_subtitle, article_content,
  article_read_time, article_updated_at, user_department, user_name
  FROM articles WHERE article_id = $1`;

  try {
    const articleData = await query<ArticleData>(baseQuery, [uuid]);

    return articleData[0];
  } catch (error) {
    console.error("Error while trying to fetch the article:", error);
    return null;
  }
};
