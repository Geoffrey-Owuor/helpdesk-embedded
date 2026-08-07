import { sendEmail } from "@/services/EmailService";
import FirstLoginLinkTemplate from "@/templates/FirstLoginLinkTemplate";
import { query } from "@/lib/Db";
import { hashPassword } from "@/lib/Auth";
import crypto from "crypto";

export interface ReturnedUser {
  userId: string;
  name: string;
  email: string;
  department: string;
}

type CheckBehalfUserProps = {
  name: string;
  email: string;
};

export const CheckBehalfUser = async ({
  name,
  email,
}: CheckBehalfUserProps): Promise<ReturnedUser | null> => {
  try {
    // Check if the user is already registered and return their payload
    const existingUser = await query(
      `
      SELECT user_id, username, email, department
      FROM users WHERE email = $1 LIMIT 1
      `,
      [email],
    );

    // Return user details if user exists
    if (existingUser.length > 0) {
      const userDetails = existingUser[0];

      return {
        userId: userDetails.user_id,
        name: userDetails.username,
        email: userDetails.email,
        department: userDetails.department,
      };
    } else {
      // Confirm if we have the staff info in our database
      const existingStaff = await query(
        `SELECT name, email, department FROM company_user_records WHERE email = $1 LIMIT 1`,
        [email],
      );

      if (existingStaff.length === 0) {
        return null;
      }

      const staffInfo = existingStaff[0];

      // User does not exist, try creating a new user, return the data, and notify the user
      const resetToken = crypto.randomUUID();
      const tempPassword = crypto.randomBytes(4).toString("hex");

      // Hash the password
      const hashedPassword = await hashPassword(tempPassword);

      // The insert query
      const insertQuery = `
        INSERT INTO users
        (username, email, department, password, role, reset_token)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING user_id, username, email, department
        `;

      // Insert params
      const insertParams = [
        staffInfo.name,
        staffInfo.email,
        staffInfo.department,
        hashedPassword,
        "user",
        resetToken,
      ];

      const result = await query(insertQuery, insertParams);
      const returnedUser = result[0];

      // Emailing logic will go here - template generation for notifying the user of the created account
      const emailTemplate = FirstLoginLinkTemplate(
        `${process.env.NEXT_PUBLIC_BASE_URL}/firstlogin?token=${resetToken}`,
        tempPassword,
      );

      // Fire and Forget - Send Email
      sendEmail({
        to: email,
        subject: `Welcome ${name}!`,
        html: emailTemplate,
      });

      return {
        userId: returnedUser.user_id,
        name: returnedUser.username,
        email: returnedUser.email,
        department: returnedUser.department,
      };
    }
  } catch (error) {
    console.error(
      "An error while trying to create/verify the behalf user:",
      error,
    );
    return null;
  }
};
