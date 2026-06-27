// Anthropic API key for vision-based inventory identification.
//
// The key is bundled into the app via the `EXPO_PUBLIC_` env var
// mechanism. For local dev it comes from `.env`; for EAS builds it
// comes from the `env` block in `eas.json`.
//
// This is an "anon-style" client key: it is embedded in the APK and
// technically extractable. For this private estate-management app the
// trade-off is acceptable; if abuse becomes a problem, move the call
// behind a Supabase Edge Function and remove the key from the client.

export const ANTHROPIC_API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? "";

// Whether AI identification is available in this build. When false, callers
// should hide/disable the "Identify with AI" affordance rather than crash —
// the rest of the app works fine without it.
export const hasAnthropicKey = ANTHROPIC_API_KEY.length > 0;
