// Shared server-side lookup for the two "extra privilege" flags baked into
// the JWT payload at mint time. Runs the super_admins + special_access
// checks in parallel so the near-identical raw queries in login,
// refresh-token, and the SSO routes don't each hand-roll their own.
import { query } from "@/lib/Db";

export interface UserPrivileges {
  isSuper: boolean;
  specialAccess: string[];
}

export async function getUserPrivileges(
  userId: string,
): Promise<UserPrivileges> {
  const [superAdmins, specialAccessRows] = await Promise.all([
    query(
      `SELECT super_admin_id FROM super_admins WHERE super_admin_id = $1 LIMIT 1`,
      [userId],
    ),
    query<{ feature: string }>(
      `SELECT feature FROM special_access WHERE user_id = $1`,
      [userId],
    ),
  ]);

  return {
    isSuper: superAdmins.length > 0,
    specialAccess: specialAccessRows.map((row) => row.feature),
  };
}
