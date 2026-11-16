import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { pool } from "@/lib/Db";
import { PoolClient } from "pg";
import {
  INVALID_DEPARTMENT_MESSAGE,
  resolveDepartmentName,
} from "@/lib/departments";
import {
  normalizeRecordEmail,
  normalizeRecordName,
  revalidateCompanyRecords,
} from "@/lib/companyRecords";

// Edits a staff record's details, or activates / deactivates it (send only
// isActive). Neither touches an account the person already has: accounts are
// matched by email, and deactivating one is a separate super admin action.
export const PATCH = withAuth(async ({ user, request }) => {
  let client: PoolClient | undefined;

  if (!user.isSuper) {
    return NextResponse.json(
      { message: "You are not authorized to perform this action" },
      { status: 403 },
    );
  }

  try {
    const body = await request.json();
    const id = Number(body.id);
    const { isActive } = body;
    const editsDetails =
      body.name !== undefined ||
      body.email !== undefined ||
      body.department !== undefined;

    if (
      !Number.isInteger(id) ||
      (!editsDetails && typeof isActive !== "boolean")
    ) {
      return NextResponse.json(
        { message: "Missing some required fields" },
        { status: 400 },
      );
    }

    if (isActive !== undefined && typeof isActive !== "boolean") {
      return NextResponse.json(
        { message: "The selected status is not valid" },
        { status: 400 },
      );
    }

    client = await pool.connect();
    await client.query("BEGIN");

    const { rows } = await client.query(
      `SELECT name, email, department FROM company_user_records
       WHERE id = $1 FOR UPDATE`,
      [id],
    );

    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { message: "Selected staff record not found" },
        { status: 404 },
      );
    }

    const current = rows[0];
    let { name, email, department } = current;

    if (editsDetails) {
      name = normalizeRecordName(body.name ?? current.name);
      email = normalizeRecordEmail(body.email ?? current.email);

      if (!name || !email) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          { message: "A name and a valid email address are required" },
          { status: 400 },
        );
      }

      // An active department, or the one the record already has
      department = await resolveDepartmentName(
        body.department ?? current.department,
        current.department,
      );

      if (!department) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          { message: INVALID_DEPARTMENT_MESSAGE },
          { status: 400 },
        );
      }

      const { rows: emailTaken } = await client.query(
        `SELECT id FROM company_user_records WHERE email = $1 AND id <> $2`,
        [email, id],
      );

      if (emailTaken.length > 0) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          { message: "Another record already uses this email" },
          { status: 409 },
        );
      }
    }

    await client.query(
      `UPDATE company_user_records
       SET name = $1, email = $2, department = $3,
       is_active = COALESCE($4, is_active),
       updated_at = NOW(), updated_by = $5
       WHERE id = $6`,
      [name, email, department, isActive ?? null, user.userId, id],
    );

    await client.query("COMMIT");

    revalidateCompanyRecords();

    return NextResponse.json(
      {
        message: editsDetails
          ? "Staff record updated successfully"
          : `Staff record ${isActive ? "activated" : "deactivated"} successfully`,
      },
      { status: 200 },
    );
  } catch (error) {
    await client?.query("ROLLBACK");
    console.error("Error while trying to update a company user record:", error);
    return NextResponse.json(
      { message: "Error while trying to update the staff record" },
      { status: 500 },
    );
  } finally {
    if (client) client.release();
  }
});
