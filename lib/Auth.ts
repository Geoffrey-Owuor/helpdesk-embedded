import { SignJWT, jwtVerify, JWTPayload } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export interface AuthJWTPayload extends JWTPayload {
  userId: string;
  email: string;
  username: string;
  role: string;
  department: string;
}

const ACCESS_SECRET = new TextEncoder().encode(process.env.ACCESS_TOKEN_SECRET);
const REFRESH_SECRET = new TextEncoder().encode(
  process.env.REFRESH_TOKEN_SECRET,
);

// Function for hashing the refresh token
export async function hashRefreshToken(token: string) {
  const signature = token.split(".")[2];
  return await bcrypt.hash(signature, 10);
}

// Function for hashing a password
export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

// Function for verifying hashes
export async function verifyPassword(password: string, hashedPassword: string) {
  return await bcrypt.compare(password, hashedPassword);
}

// Getting an access token
export async function signAccessToken(payload: AuthJWTPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(ACCESS_SECRET);
}

// Getting a refresh token
export async function signRefreshToken(payload: AuthJWTPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(REFRESH_SECRET);
}

// Creating a session with the tokens
export async function createSession(accessToken: string, refreshToken: string) {
  // Set cookies
  const cookieStore = await cookies();

  // set access token
  cookieStore.set("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 15 * 60, //15 minutes
  });

  // set refresh token
  cookieStore.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, //7 days
  });
}

// Verifying the access token quick check
export async function verifyAccessTokenJWT(): Promise<AuthJWTPayload | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  if (!accessToken) return null;

  try {
    const { payload } = await jwtVerify(accessToken, ACCESS_SECRET);
    return payload as AuthJWTPayload;
  } catch (error) {
    console.error("Session verification failed:", error);
    return null;
  }
}

// Verifying the refresh token quick check
export async function verifyRefreshTokenJWT(
  refreshToken: string,
): Promise<AuthJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(refreshToken, REFRESH_SECRET);

    return payload as AuthJWTPayload;
  } catch (error) {
    console.error("Session verification failed:", error);
    return null;
  }
}

// Require session to get a valid session - A simpler version which is quicker
export async function requireSession(): Promise<AuthJWTPayload | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!refreshToken) return null;

  try {
    const payload = await verifyRefreshTokenJWT(refreshToken);
    return payload as AuthJWTPayload;
  } catch (error) {
    console.error("Session verification failed:", error);
    return null;
  }
}
