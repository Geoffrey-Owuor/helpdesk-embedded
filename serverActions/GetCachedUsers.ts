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
        // Deactivated records aren't suggested (migrations/011), nor is
        // anyone whose account is deactivated - an issue can't be raised
        // for them (CheckBehalfUser). superadmin/user-status revalidates.
        `SELECT r.email, r.name, r.department FROM company_user_records AS r
         WHERE r.is_active = TRUE
         AND NOT EXISTS (
           SELECT 1 FROM users AS u
           WHERE LOWER(u.email) = r.email AND u.is_user_active = FALSE
         )
         ORDER BY r.name ASC`,
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
