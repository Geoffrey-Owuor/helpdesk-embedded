import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { NextResponse } from "next/server";
import { query } from "@/lib/Db";
import { hashPassword } from "@/lib/Auth";

export const POST = withAuth(async ({ request, user }) => {
  const { isSuper } = user;

  if (!isSuper) {
    return NextResponse.json(
      { message: "You are not authorized to perform this action" },
      { status: 403 },
    );
  }
  try {
    const { name, email, department, password, confirmPassword, role, status } =
      await request.json();

    // Check if all have values
    if (
      !name ||
      !email ||
      !department ||
      !password ||
      !confirmPassword ||
      !role ||
      !status
    ) {
      return NextResponse.json(
        { message: "Missing some required fields" },
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
    const isActive = status === "true";

    const insertQuery = `
            INSERT INTO users(username, email, department, password, role, is_user_active)
            VALUES
            ($1, $2, $3, $4, $5, $6)
        `;

    const insertParams = [
      name,
      email,
      department,
      hashedPassword,
      role,
      isActive,
    ];

    // Execute the query
    await query(insertQuery, insertParams);

    // Return a response
    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error while trying to register the user:", error);
    return NextResponse.json(
      { message: "Error while trying to register the user" },
      { status: 500 },
    );
  }
});
