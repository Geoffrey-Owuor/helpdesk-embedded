"use server";
import { query } from "@/lib/Db";

export interface AlertMessage {
  alertType: "error" | "success";
  alertMessage: string;
}

type PostNewsPayload = {
  title: string;
  description: string;
  author: string;
};

export async function PostNewsAction(
  data: PostNewsPayload,
): Promise<AlertMessage> {
  try {
    await query(
      `INSERT INTO news(title, description, author) VALUES ($1, $2, $3)`,
      [data.title, data.description, data.author],
    );

    return {
      alertType: "success",
      alertMessage: "News posted successfully",
    };
  } catch (error) {
    console.error("Failed to post news:", error);
    return {
      alertType: "error",
      alertMessage: "Failed to post news",
    };
  }
}
