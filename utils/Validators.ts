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

  // Rule: Separated by exactly one space
  const singleSpace = !name.includes("  ");

  // Rule: Starts with a Capital letter.
  // The rest can be lowercase, uppercase (for O'Connor), hyphens, or apostrophes.
  const isCapitalized = parts.every((part) =>
    /^[A-Z][A-Za-z\-'’]+$/.test(part),
  );

  return {
    hasTwoNames,
    singleSpace,
    isCapitalized: hasTwoNames && isCapitalized,
    isValid: hasTwoNames && singleSpace && isCapitalized,
  };
};
