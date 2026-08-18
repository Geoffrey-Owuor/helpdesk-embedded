import { query } from "@/lib/Db";

// Shared rate limiter for AI-powered endpoints.
//
// Why this exists: the app runs under PM2 in cluster mode, so a plain
// in-memory counter (e.g. a Map kept in module scope) would only see the
// requests handled by ONE worker process -- a caller could get a fresh
// quota just by landing on a different worker. Postgres is already this
// app's single shared source of truth (see lib/Db.ts), so we count/record
// calls there instead: every worker reads and writes the same table, which
// makes the limit actually hold across the whole cluster.
//
// How it works: each allowed call inserts one row into ai_rate_limit_log
// (see migrations/005_ai_rate_limits.sql), stamped with a "rate_key" the
// caller chooses (e.g. "refine:user:123" or "refine:ip:1.2.3.4"). To check
// the limit, we count how many rows exist for that key within the trailing
// `windowSeconds` -- if that's already at `limit`, the call is rejected
// without inserting a new row (so a blocked caller doesn't keep pushing
// their own window further out).
export async function checkAndRecordRateLimit(
  rateKey: string,
  limit: number,
  windowSeconds: number,
): Promise<{ allowed: boolean }> {
  const windowStart = new Date(Date.now() - windowSeconds * 1000);

  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) FROM ai_rate_limit_log WHERE rate_key = $1 AND created_at > $2`,
    [rateKey, windowStart],
  );

  // COUNT(*) comes back as a string from pg (it's a bigint under the hood).
  const callsInWindow = Number(countResult[0].count);

  if (callsInWindow >= limit) {
    return { allowed: false };
  }

  await query(`INSERT INTO ai_rate_limit_log (rate_key) VALUES ($1)`, [
    rateKey,
  ]);

  return { allowed: true };
}
