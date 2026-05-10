"use server";
import { query } from "@/lib/Db";

export interface UserRecord {
  email: string;
  name: string;
  department: string;
}

export async function fetchUserRecords(
  searchQuery: string,
): Promise<UserRecord[] | null> {
  const baseQuery = `
    SELECT email, name, department
    FROM company_user_records 
    WHERE EMAIL ILIKE $1
    `;

  try {
    const result = await query<UserRecord>(baseQuery, [`%${searchQuery}%`]);

    return result;
  } catch (error) {
    console.error("Error fetching user records for the provided query:", error);
    return null;
  }
}
