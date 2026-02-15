import { NextResponse } from "next/server";
import { query } from "@/lib/Db";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { hashPassword } from "@/lib/Auth";
import { revalidateTag } from "next/cache";

export const POST = withAuth(async ({ request, user }) => {
  const { role } = user;
  // Check if the user is authorized to perform this operation
  if (role !== "admin") {
    return NextResponse.json(
      { message: "You are not authorized to perform this action" },
      { status: 403 },
    );
  }

  try {
    const {
      name,
      email,
      department,
      role: payloadRole,
      password,
      confirmPassword,
    } = await request.json();

    // Verify that all required information is available
    if (
      !name ||
      !email ||
      !department ||
      !payloadRole ||
      !password ||
      !confirmPassword
    ) {
      return NextResponse.json(
        { message: "Missing some required payload information" },
        { status: 400 },
      );
    }

    // Request role should be an agent role
    if (payloadRole !== "agent") {
      return NextResponse.json(
        { message: "Role should be an agent role" },
        { status: 400 },
      );
    }

    //Passwords should match
    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: "Passwords do not match" },
        { status: 400 },
      );
    }

    // Check whether there is a user that already exists with the sent email address (conflict)
    const existingUserQuery = `
          SELECT email from users
          WHERE email = $1
        `;
    const existingUser = await query(existingUserQuery, [email]);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { message: "An account with this email already exists." },
        { status: 409 },
      );
    }

    // If everything is ok - hash the password and perform an INSERT query
    const hashedPassword = await hashPassword(password);

    const insertQuery = `
        INSERT INTO users(username, email, department, password, role)
        VALUES
        ($1, $2, $3, $4, $5)
    `;

    const insertParams = [name, email, department, hashedPassword, payloadRole];

    // Execute the query
    await query(insertQuery, insertParams);

    // Revalidate agents cache tag
    revalidateTag("GetIssueAgents", { expire: 0 });

    // Return a response
    return NextResponse.json(
      { message: "Agent registered successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error while trying to register an agent:", error);
    return NextResponse.json(
      { message: "Error while trying to register the agent" },
      { status: 500 },
    );
  }
});
