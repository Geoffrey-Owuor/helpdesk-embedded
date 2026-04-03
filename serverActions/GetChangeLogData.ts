"use server";
import { query } from "@/lib/Db";
import { unstable_cache } from "next/cache";
import { ChangelogData } from "@/components/Home/ChangeLog";
import { updateTag } from "next/cache";

const getChangelogData = async (): Promise<ChangelogData[]> => {
  const baseQuery = `
      SELECT changelog_id, changelog_updated_at, changelog_type, changelog_title, changelog_description
      FROM changelogs
      WHERE changelog_active = true
      ORDER BY changelog_updated_at DESC
      `;

  try {
    const changelogs = await query<ChangelogData>(baseQuery);

    return changelogs;
  } catch (error) {
    console.error("Error fetching changelogs data:", error);
    return [];
  }
};

export const fetchedChangelogData = unstable_cache(
  getChangelogData,

  ["changelog_data"],
  {
    revalidate: 3600,
    tags: ["Changelog_Data"],
  },
);

export const refetchChangelogData = async () => updateTag("Changelog_Data");
