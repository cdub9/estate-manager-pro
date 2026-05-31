import { EncodingType, readAsStringAsync } from "expo-file-system/legacy";

import { ANTHROPIC_API_KEY } from "@/lib/anthropic";

export interface InventoryGuess {
  name: string;
  vendor: string;
  partNumber: string;
  description: string;
}

// Vision-capable model — Haiku tier is cheap and fast, and identification
// is a simple classification task that doesn't need Sonnet reasoning.
const MODEL = "claude-haiku-4-5";

const PROMPT =
  "Identify this piece of equipment. Respond with ONLY valid JSON " +
  "matching this schema, with no prose or markdown fences: " +
  '{"name": string, "vendor": string, "partNumber": string, "description": string}. ' +
  "Use empty strings for fields you cannot determine. " +
  "`name` should be a short product name (e.g. 'DeWalt 20V Cordless Drill'). " +
  "`vendor` is the brand or manufacturer. " +
  "`partNumber` is the SKU or model number if visible on the item. " +
  "`description` should be one sentence summarizing what it is and notable features visible.";

function mimeTypeFromUri(uri: string): "image/jpeg" | "image/png" | "image/webp" | "image/gif" {
  const lower = uri.toLowerCase().split("?")[0];
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  return "image/jpeg";
}

/**
 * Ask Claude to identify the piece of equipment shown in a photo.
 * Throws a user-friendly Error on network failure, bad response, or parse failure.
 */
export async function identifyInventoryFromPhoto(photoUri: string): Promise<InventoryGuess> {
  const base64 = await readAsStringAsync(photoUri, { encoding: EncodingType.Base64 });
  const mediaType = mimeTypeFromUri(photoUri);

  let response: Response;
  try {
    response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 400,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: mediaType, data: base64 },
              },
              { type: "text", text: PROMPT },
            ],
          },
        ],
      }),
    });
  } catch {
    throw new Error("Network error. Check your connection and try again.");
  }

  if (!response.ok) {
    // Try to surface Anthropic's error message; fall back to status text.
    let detail = response.statusText;
    try {
      const body = (await response.json()) as { error?: { message?: string } };
      if (body?.error?.message) detail = body.error.message;
    } catch {
      // Ignore parse failures — we'll use statusText.
    }
    throw new Error(`Identification failed (${response.status}): ${detail}`);
  }

  const payload = (await response.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };
  const text = payload.content?.find((c) => c.type === "text")?.text;
  if (!text) throw new Error("Empty response from identification service.");

  // Strip optional ```json fences in case the model adds them despite instructions.
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");

  let parsed: Partial<InventoryGuess>;
  try {
    parsed = JSON.parse(cleaned) as Partial<InventoryGuess>;
  } catch {
    throw new Error("Couldn't read the identification response. Please try again.");
  }

  return {
    name: typeof parsed.name === "string" ? parsed.name : "",
    vendor: typeof parsed.vendor === "string" ? parsed.vendor : "",
    partNumber: typeof parsed.partNumber === "string" ? parsed.partNumber : "",
    description: typeof parsed.description === "string" ? parsed.description : "",
  };
}
