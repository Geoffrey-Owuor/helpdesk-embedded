"use server";
import { query } from "@/lib/Db";

export type ItTeamMember = {
  id: number;
  name: string;
  email: string;
  title_name: string;
  title_description: string;
  phone_extension: string;
};

export async function GetItTeam(): Promise<ItTeamMember[] | []> {
  try {
    const members = await query<ItTeamMember>(
      `SELECT * FROM it_team ORDER BY id ASC`,
    );

    return members;
  } catch (error) {
    console.error("Failed to fetch IT team:", error);
    return [];
  }
}
