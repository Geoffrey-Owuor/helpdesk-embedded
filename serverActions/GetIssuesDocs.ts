"use server";
import { query } from "@/lib/Db";
import { unstable_cache } from "next/cache";
import { updateTag } from "next/cache";

export interface IssueDoc {
  id: number;
  issue_type: string;
  department: string;
  issue_description: string;
}

export interface GroupedIssueDocs {
  department: string;
  issues: IssueDoc[];
}

async function getIssuesDocs(): Promise<GroupedIssueDocs[]> {
  // Grouping data by ascending departments so that our reduce method can group similar departments faster
  const baseQuery = `
    SELECT id, issue_type, department, issue_description
    FROM issues_docs ORDER BY department ASC, id ASC
    `;

  try {
    //
    const rows = await query<IssueDoc>(baseQuery);

    // Transform flat rows into grouped issue docs using the reduce method
    const grouped = rows.reduce((acc: GroupedIssueDocs[], currentRow) => {
      // Check if we already have a group for this department
      const existingGroup = acc.find(
        (g) => g.department === currentRow.department,
      );

      if (existingGroup) {
        existingGroup.issues.push(currentRow);
      } else {
        acc.push({
          department: currentRow.department,
          issues: [currentRow],
        });
      }
      return acc;
    }, []);

    return grouped;
  } catch (error) {
    console.error("Error fetching issues documentation data:", error);
    return [];
  }
}

export const fetchedIssuesDocs = unstable_cache(
  getIssuesDocs,
  ["issue_docs_data"],
  {
    revalidate: 3600,
    tags: ["IssuesDocs_Data"],
  },
);

export const refetchIssuesDocsData = async () => updateTag("IssuesDocs_Data");
