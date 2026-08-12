import { google } from "@ai-sdk/google";

// `google(...)` is a provider factory from @ai-sdk/google: calling it with a
// model id returns a "LanguageModel" object that the Vercel AI SDK's
// generateObject/generateText/etc. functions know how to call. It picks up
// the API key automatically from the GOOGLE_GENERATIVE_AI_API_KEY env var
// (already set in .env.local) -- no manual key wiring needed here.
//
// Keeping the model id in one place means swapping models later (e.g. to a
// newer Gemini release) is a one-line change, without touching every call
// site.
export const geminiFlashLite = google("gemini-flash-lite-latest");
