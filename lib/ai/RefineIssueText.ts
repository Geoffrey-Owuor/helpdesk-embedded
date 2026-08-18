import { generateText, Output } from "ai";
import { geminiFlashLite } from "@/lib/ai/GeminiModel";
import { RefineIssueSchema, RefineIssueResult } from "@/lib/ai/Schemas";

export type RefineIssueInput = {
  title: string;
  description: string;
};

// Shared core of the "Refine with AI" feature, used by both the
// authenticated API route (Main Issue Modal) and the unauthenticated
// server action (Quick Create modal) so the prompt/model logic only
// lives in one place.
//
// generateText with an Output.object() spec sends the prompt to Gemini along
// with the RefineIssueSchema definition and asks for a response matching
// that exact shape. The SDK parses the model's output and validates it
// against the schema before returning -- `output` below is already a
// type-safe { title, description }, not raw text we'd have to parse
// ourselves. (This replaces the now-deprecated generateObject helper.)
export async function refineIssueText(
  input: RefineIssueInput,
): Promise<RefineIssueResult> {
  const { output } = await generateText({
    model: geminiFlashLite,
    output: Output.object({ schema: RefineIssueSchema }),
    prompt: `You are helping a user of an internal company helpdesk write a clearer issue report.

Rewrite the title and description below to be more concise, precise, and grammatically correct, while keeping the original meaning and all important details intact. Do not invent information that isn't implied by the original text.

Rules:
- "title" must be a short, specific summary, 50 characters or fewer.
- "description" should be clear and well-structured, but no longer than necessary to convey the issue.

Original title: ${input.title}
Original description: ${input.description}`,
  });

  // Defensive clamp: the schema already enforces the max(50) rule on
  // "title" (re-prompting the model if needed), but this guards against
  // ever sending an over-length title to the client if that validation is
  // ever loosened later.
  return {
    ...output,
    title: output.title.slice(0, 50),
  };
}
