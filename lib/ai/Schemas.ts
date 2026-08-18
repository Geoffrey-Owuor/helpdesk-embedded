import { z } from "zod";

// zod schemas describing the shape we want the AI to return.
//
// These aren't just TypeScript types -- generateObject (from the "ai"
// package) passes this schema to the model as part of the request, and the
// SDK validates/re-prompts under the hood until the response actually
// matches it. That's what makes generateObject safe to use directly: unlike
// a raw text completion, you don't need to hope the model returns valid
// JSON in the right shape, or hand-write a parser for it.

// Refined issue title/description suggestion (issue submission modals).
export const RefineIssueSchema = z.object({
  title: z
    .string()
    .min(1)
    .max(50, "Refined title must be 50 characters or fewer"),
  description: z.string().min(1),
});

export type RefineIssueResult = z.infer<typeof RefineIssueSchema>;

// Narrative insight generated from the analytics summary data.
export const AnalyticsInsightSchema = z.object({
  headline: z.string().min(1),
  insights: z.array(z.string().min(1)).min(1).max(6),
  recommendations: z.array(z.string().min(1)).min(1).max(5),
});

export type AnalyticsInsightResult = z.infer<typeof AnalyticsInsightSchema>;
