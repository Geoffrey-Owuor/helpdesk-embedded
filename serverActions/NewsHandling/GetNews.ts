"use server";
import { query } from "@/lib/Db";

export type NewsItem = {
  id: number;
  title: string;
  description: string;
  author: string;
};

export async function GetNews(): Promise<NewsItem[] | []> {
  try {
    const news = await query<NewsItem>(`SELECT * FROM news ORDER BY id DESC`);

    return news;
  } catch (error) {
    console.error("Failed to fetch news:", error);
    return [];
  }
}
