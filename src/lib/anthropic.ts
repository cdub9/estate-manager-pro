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

if (!ANTHROPIC_API_KEY) {
  throw new Error(
    "Missing Anthropic configuration.\n\n" +
    "EXPO_PUBLIC_ANTHROPIC_API_KEY must be set.\n" +
    "For EAS builds, add it to the 'env' section of each build profile in eas.json.\n" +
    "For local dev, add it to your .env file.",
  );
}
