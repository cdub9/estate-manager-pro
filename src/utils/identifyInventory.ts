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

// Upper bound on items returned from a single photo — bounds output tokens
// and keeps the review UI manageable.
const MAX_ITEMS = 10;

const FIELD_GUIDE =
  "`name` should be a short product name (e.g. 'DeWalt 20V Cordless Drill'). " +
  "`vendor` is the brand or manufacturer. " +
  "`partNumber` is the SKU or model number if visible on the item. " +
  "`description` should be one sentence summarizing what it is and notable features visible. " +
  "Use empty strings for fields you cannot determine.";

const SINGLE_PROMPT =
  "Identify this piece of equipment. Respond with ONLY valid JSON " +
  "matching this schema, with no prose or markdown fences: " +
  '{"name": string, "vendor": string, "partNumber": string, "description": string}. ' +
  FIELD_GUIDE;

const MULTI_PROMPT =
  "Identify each distinct piece of equipment visible in this photo. " +
  "Respond with ONLY a valid JSON array (no prose or markdown fences) where each " +
  'element matches this schema: {"name": string, "vendor": string, "partNumber": string, "description": string}. ' +
  "Include one array element per distinct item. If only one item is present, return an array " +
  `with a single element. Limit to at most ${MAX_ITEMS} items. ` +
  FIELD_GUIDE;

function mimeTypeFromUri(uri: string): "image/jpeg" | "image/png" | "image/webp" | "image/gif" {
  const lower = uri.toLowerCase().split("?")[0];
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  return "image/jpeg";
}

function coerceGuess(raw: unknown): InventoryGuess {
  const obj = (raw ?? {}) as Partial<InventoryGuess>;
  return {
    name: typeof obj.name === "string" ? obj.name : "",
    vendor: typeof obj.vendor === "string" ? obj.vendor : "",
    partNumber: typeof obj.partNumber === "string" ? obj.partNumber : "",
    description: typeof obj.description === "string" ? obj.description : "",
  };
}

/**
 * Send a photo + prompt to Claude and return the cleaned text response.
 * Throws a user-friendly Error on network failure or a bad HTTP response.
 */
async function requestIdentification(
  photoUri: string,
  prompt: string,
  maxTokens: number,
): Promise<string> {
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
        max_tokens: maxTokens,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: mediaType, data: base64 },
              },
              { type: "text", text: prompt },
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
  return text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
}

/**
 * Ask Claude to identify the single piece of equipment shown in a photo.
 * Throws a user-friendly Error on network failure, bad response, or parse failure.
 */
export async function identifyInventoryFromPhoto(photoUri: string): Promise<InventoryGuess> {
  const cleaned = await requestIdentification(photoUri, SINGLE_PROMPT, 400);

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("Couldn't read the identification response. Please try again.");
  }

  return coerceGuess(parsed);
}

/**
 * Ask Claude to identify every distinct piece of equipment in a photo.
 * Returns one guess per detected item (named items only), capped at MAX_ITEMS.
 * Throws a user-friendly Error on network failure, bad response, or parse failure.
 */
export async function identifyMultipleFromPhoto(photoUri: string): Promise<InventoryGuess[]> {
  // Larger budget than the single-item call to fit several JSON objects.
  const cleaned = await requestIdentification(photoUri, MULTI_PROMPT, 1500);

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("Couldn't read the identification response. Please try again.");
  }

  // Accept a bare array or an object wrapping one (e.g. {"items": [...]}).
  let list: unknown[];
  if (Array.isArray(parsed)) {
    list = parsed;
  } else if (parsed && typeof parsed === "object") {
    const wrapped = Object.values(parsed as Record<string, unknown>).find((v) => Array.isArray(v));
    list = Array.isArray(wrapped) ? wrapped : [parsed];
  } else {
    throw new Error("Couldn't read the identification response. Please try again.");
  }

  return list
    .slice(0, MAX_ITEMS)
    .map(coerceGuess)
    .filter((g) => g.name.trim().length > 0);
}
