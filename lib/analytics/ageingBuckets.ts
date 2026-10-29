// Age buckets for the open backlog (open and in progress issues), youngest
// first. The keys are what app/api/analytics/issues-summary returns.
export const AGEING_BUCKETS = [
  "under1d",
  "1to3d",
  "3to7d",
  "7to30d",
  "over30d",
] as const;

export type AgeingBucket = (typeof AGEING_BUCKETS)[number];

export const AGEING_BUCKET_LABELS: Record<AgeingBucket, string> = {
  under1d: "< 1 day",
  "1to3d": "1–3 days",
  "3to7d": "3–7 days",
  "7to30d": "7–30 days",
  over30d: "30+ days",
};
