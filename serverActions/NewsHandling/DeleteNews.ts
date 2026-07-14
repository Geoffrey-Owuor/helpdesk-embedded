"use server";
import { AlertMessage } from "./PostNewsAction";
import { query } from "@/lib/Db";

export async function DeleteNews(id: number): Promise<AlertMessage> {
  try {
    await query("DELETE FROM news WHERE id = $1", [id]);

    return {
      alertType: "success",
      alertMessage: "News deleted successfully",
    };
  } catch (error) {
    console.error("Failed to delete news:", error);
    return {
      alertType: "error",
      alertMessage: "Failed to delete news",
    };
  }
}
