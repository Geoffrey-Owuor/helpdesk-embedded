// Shared gate for "special access" feature grants (see special_access table),
// usable both server-side (AuthJWTPayload from withAuth/requireSession) and
// client-side (useUser()). Keeps `role === "admin" || specialAccess.includes(x)`
// from being repeated inline at every call site.

// Expandable object
export const FEATURES = {
  ANALYTICS: "analytics",
} as const;

export type FeatureKey = (typeof FEATURES)[keyof typeof FEATURES];

type FeatureAccessUser = {
  role: string;
  specialAccess?: string[] | null;
};

export const hasFeatureAccess = (
  user: FeatureAccessUser | null | undefined,
  feature: FeatureKey,
): boolean => {
  if (!user) return false;
  return user.role === "admin" || !!user.specialAccess?.includes(feature);
};
