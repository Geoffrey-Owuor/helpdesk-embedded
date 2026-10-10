const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// A malformed uuid can't match a row (and would make postgres throw), so
// lookups check this first
export const isUuid = (value: unknown): value is string =>
  typeof value === "string" && UUID_PATTERN.test(value);
