// Company user records (public.company_user_records): the staff list behind
// the "submit for a user" autocomplete and the accounts created on someone's
// behalf. Managed from the super admin Staff Records modal
// (app/api/superadmin/company-records/*). Server side only.
import { revalidateTag } from "next/cache";
import { query } from "@/lib/Db";

export interface CompanyRecord {
  id: number;
  name: string;
  email: string;
  department: string;
  isActive: boolean;
}

// serverActions/GetCachedUsers.ts caches the active records under this tag
export const revalidateCompanyRecords = () =>
  revalidateTag("CachedUserRecords", { expire: 0 });

// Input rules shared by the add/edit routes and the bulk import. Null when
// the value is not acceptable.
export const normalizeRecordName = (name: unknown): string | null => {
  if (typeof name !== "string") return null;
  const trimmed = name.trim().replace(/\s+/g, " ");
  return trimmed && trimmed.length <= 255 ? trimmed : null;
};

// Stored trimmed and lowercase (the table's CHECK), so the unique email
// constraint ignores case
export const normalizeRecordEmail = (email: unknown): string | null => {
  if (typeof email !== "string") return null;
  const lower = email.trim().toLowerCase();
  return lower.length <= 255 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lower)
    ? lower
    : null;
};

// Gives a new account its staff record, so accounts and records don't drift
// apart. A record that already exists is left as it is - a super admin may
// have deactivated it on purpose. Never throws: the account is already
// created, and one without a record shows up in the modal's "Missing from
// records" list.
export async function ensureCompanyUserRecord(account: {
  name: string;
  email: string;
  department: string;
}): Promise<void> {
  try {
    const name = normalizeRecordName(account.name);
    const email = normalizeRecordEmail(account.email);
    if (!name || !email) return;

    const inserted = await query(
      `INSERT INTO company_user_records (name, email, department)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      [name, email, account.department],
    );

    if (inserted.length > 0) revalidateCompanyRecords();
  } catch (error) {
    console.error("Could not add the company user record:", error);
  }
}
