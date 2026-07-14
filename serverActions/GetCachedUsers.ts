"use server";
import { unstable_cache } from "next/cache";
import { query } from "@/lib/Db";

export interface UserRecord {
  email: string;
  name: string;
  department: string;
}

export const getCachedUsers = unstable_cache(
  async (): Promise<UserRecord[] | []> => {
    try {
      const result = await query<UserRecord>(
        `SELECT email, name, department FROM company_user_records`,
      );
      return result;
    } catch (error) {
      console.error("Error while trying to fetch user records:", error);
      return [];
    }
  },
  ["user-records-cache-key"],
  { tags: ["CachedUserRecords"], revalidate: 86400 },
);
