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

  if (seconds >= YEAR) return `${Math.floor(seconds / YEAR)}y`;
  if (seconds >= MONTH) return `${Math.floor(seconds / MONTH)}mon`;
  if (seconds >= WEEK) return `${Math.floor(seconds / WEEK)}w`;
  if (seconds >= DAY) return `${Math.floor(seconds / DAY)}d`;
  if (seconds >= HOUR) return `${Math.floor(seconds / HOUR)}h`;
  if (seconds >= MINUTE) return `${Math.floor(seconds / MINUTE)}min`;

  return `${Math.floor(seconds)}sec`;
};
