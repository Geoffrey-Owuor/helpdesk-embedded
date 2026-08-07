// Formats a duration in seconds using the same threshold ladder as
// ResolutionTimePill's getShortDuration, so timing displays read consistently
// across the app. Returns "N/A" for null (no qualifying issues in the set).
export const formatSecondsDuration = (seconds: number | null): string => {
  if (seconds === null || isNaN(seconds)) return "N/A";

  const MINUTE = 60;
  const HOUR = 3600;
  const DAY = 86400;
  const WEEK = 604800;
  const MONTH = 2592000;
  const YEAR = 31536000;

  if (seconds >= YEAR) return `${(seconds / YEAR).toFixed(1)}y`;
  if (seconds >= MONTH) return `${(seconds / MONTH).toFixed(1)}mon`;
  if (seconds >= WEEK) return `${(seconds / WEEK).toFixed(1)}w`;
  if (seconds >= DAY) return `${(seconds / DAY).toFixed(1)}d`;
  if (seconds >= HOUR) return `${(seconds / HOUR).toFixed(1)}h`;
  if (seconds >= MINUTE) return `${(seconds / MINUTE).toFixed(1)}min`;

  return `${Math.floor(seconds)}sec`;
};
