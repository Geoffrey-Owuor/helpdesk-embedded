import { SignJWT, jwtVerify, JWTPayload } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export interface AuthJWTPayload extends JWTPayload {
  userId: string;
  email: string;
  username: string;
  role: string;
  departmet: string;
}

const ACCESS_SECRET = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);
const REFRESH_SECRET = new TextEncoder().encode(
  process.env.REFRESH_TOKEN_SECRET,
);

// Function for hashing passwords
export async function hashRefreshToken(token: string) {
  const signature = token.split(".")[2];
  return await bcrypt.hash(signature, 10);
}

// Function for verifying hashes
export async function verifyPassword(password: string, hashedPassword: string) {
  return await bcrypt.compare(password, hashedPassword);
}

export async function signAccessToken(payload: AuthJWTPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(ACCESS_SECRET);
}

export async function signRefreshToken(payload: AuthJWTPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(REFRESH_SECRET);
}

// Verifying the access token quick check
export async function verifyAccessTokenJWT() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  if (!accessToken) return null;

  try {
    const { payload } = await jwtVerify(accessToken, ACCESS_SECRET);
    return payload;
  } catch (error) {
    console.error("Session verification failed:", error);
    return null;
  }
}

// Verifying the refresh token quick check
export async function verifyRefreshTokenJWT(refreshToken: string) {
  try {
    const { payload } = await jwtVerify(refreshToken, REFRESH_SECRET);

    return payload;
  } catch (error) {
    console.error("Session verification failed:", error);
    return null;
  }
}

// Require session to get a valid session - A simpler version which is quicker
export async function requireSession() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!refreshToken) return null;

  try {
    const payload = await verifyRefreshTokenJWT(refreshToken);
    return payload;
  } catch (error) {
    console.error("Session verification failed:", error);
    return null;
  }
}
