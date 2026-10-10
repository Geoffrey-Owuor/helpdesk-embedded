import { query } from "@/lib/Db";
import { AuthJWTPayload } from "@/lib/Auth";
import { buildIssueAccessClause } from "@/lib/IssueAccess";
import { isUuid } from "@/lib/isUuid";

// The title and description an issue page uses for its <title>/description
// metadata - fetched server-side rather than passed in the URL. Gated like
// the page itself: the issue page by the user's access, the analytics page
// (which checks analytics access first) by nothing further.
export const getIssueMeta = async (
  uuid: string,
  user: AuthJWTPayload,
  { analytics = false }: { analytics?: boolean } = {},
): Promise<{ issue_title: string; issue_description: string } | null> => {
  if (!isUuid(uuid)) return null;

  const { clause, params } = analytics
    ? { clause: null, params: [] }
    : buildIssueAccessClause(user, "a", 2);

  const rows = await query<{ issue_title: string; issue_description: string }>(
    `SELECT a.issue_title, a.issue_description FROM issues_table a
     WHERE a.issue_uuid = $1 ${clause ? `AND ${clause}` : ""} LIMIT 1`,
    [uuid, ...params],
  );

  return rows[0] ?? null;
};
