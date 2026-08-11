"use server";
import { query } from "@/lib/Db";

export interface ArticlesCardValues {
  article_id: string;
  article_type: string;
  article_title: string;
  article_subtitle: string;
  article_content: string;
  article_read_time: string;
  article_updated_at: string;
  user_department: string;
  user_id: string;
  user_name: string;
  can_edit: boolean;
}

export const getUserArticles = async (
  userId?: string,
): Promise<ArticlesCardValues[] | []> => {
  const params = [];

  let baseQuery = `
  SELECT 
  user_id, article_id, article_type, article_title, article_subtitle, article_content,
  article_read_time, article_updated_at, user_department, user_name, can_edit
  FROM articles
  ORDER BY article_updated_at DESC
  `;

  if (userId) {
    baseQuery += ` WHERE user_id = $1`;
    params.push(userId);
  }

  try {
    const userArticles = await query<ArticlesCardValues>(baseQuery, params);

    return userArticles;
  } catch (error) {
    console.error("Error while trying to fetch user articles:", error);
    return [];
  }
};
