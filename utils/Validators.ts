// Email Validator (To make sure the email is a hotpoint email)
export const validateHotpointEmail = (email: string) => {
  // Regex ensures a standard email format and ends with our specified domain
  const hotpointRegex = /^[a-zA-Z0-9._%+-]+@example\.com$/i;
  return hotpointRegex.test(email);
};
