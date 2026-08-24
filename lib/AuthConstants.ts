// Shared between the login API route (server) and the login form (client),
// so it must stay free of server-only imports (no next/headers, no db, etc).
export const MAX_LOGIN_ATTEMPTS = 3;
