// Email Validator (To make sure the email is a hotpoint email)
export const validateHotpointEmail = (email: string) => {
  // Regex ensures a standard email format and ends with our specified domain
  const hotpointRegex = /^[a-zA-Z0-9._%+-]+@hotpoint\.co\.ke$/i;
  return hotpointRegex.test(email);
};

//NAME VALIDATION

// Name validation interface
export interface NameValidationResult {
  hasTwoNames: boolean;
  isCapitalized: boolean;
  singleSpace: boolean;
  isValid: boolean;
}

// Name validation function
export const NameValidator = (name: string): NameValidationResult => {
  // 1. Check for single space separation and max 2 names
  const parts = name.trim().split(" ");

  // Rule: Exactly two names (No more, no less)
  const hasTwoNames = parts.length === 2 && parts.every((p) => p.length > 0);

  // Rule: Separated by exactly one space (implied by split(" ") length check matching parts check)
  // If user types "Name  Name" (2 spaces), split returns 3 parts (one empty).
  // So standard split covers the "single space" logic partially, but let's be strict.
  const singleSpace = !name.includes("  ");

  // Rule: Each name starts with a Capital and the rest are lowercase letters
  const isCapitalized = parts.every((part) => /^[A-Z][a-z]+$/.test(part));

  return {
    hasTwoNames,
    singleSpace,
    isCapitalized: hasTwoNames && isCapitalized, //Only check isCapitalized if we have two names
    isValid: hasTwoNames && singleSpace && isCapitalized,
  };
};
