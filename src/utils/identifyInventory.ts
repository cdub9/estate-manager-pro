import { EncodingType, readAsStringAsync } from "expo-file-system/legacy";

import { supabase } from "@/lib/supabase";

export interface InventoryGuess {
  name: string;
  vendor: string;
  partNumber: string;
  description: string;
}

// Upper bound on items returned from a single photo — matches the cap the
// server prompt enforces; also guards the parsed array here.
const MAX_ITEMS = 10;

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
 * Send a photo to the `identify-inventory` Supabase Edge Function (which holds
 * the Anthropic key server-side) and return the model's cleaned text response.
 * Throws a user-friendly Error on network failure or a server error.
 */
async function requestIdentification(photoUri: string, mode: "single" | "multiple"): Promise<string> {
  const base64 = await readAsStringAsync(photoUri, { encoding: EncodingType.Base64 });
  const mediaType = mimeTypeFromUri(photoUri);

  const { data, error } = await supabase.functions.invoke<{ text?: string; error?: string }>(
    "identify-inventory",
    { body: { image: base64, mediaType, mode } },
  );

  if (error) {
    // FunctionsHttpError exposes the raw Response on `context`; surface the
    // server's message when we can, otherwise a generic one.
    let message = "Couldn't reach the identification service. Please try again.";
    try {
      const body = await (error as { context?: { json?: () => Promise<{ error?: string }> } }).context?.json?.();
      if (body?.error) message = body.error;
    } catch {
      // keep the generic message
    }
    throw new Error(message);
  }
  if (data?.error) throw new Error(data.error);

  const text = data?.text;
  if (!text) throw new Error("Empty response from identification service.");

  // Strip optional ```json fences in case the model adds them despite instructions.
  return text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
}

/**
 * Identify the single piece of equipment shown in a photo.
 * Throws a user-friendly Error on network failure, bad response, or parse failure.
 */
export async function identifyInventoryFromPhoto(photoUri: string): Promise<InventoryGuess> {
  const cleaned = await requestIdentification(photoUri, "single");

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("Couldn't read the identification response. Please try again.");
  }

  return coerceGuess(parsed);
}

/**
 * Identify every distinct piece of equipment in a photo.
 * Returns one guess per detected item (named items only), capped at MAX_ITEMS.
 * Throws a user-friendly Error on network failure, bad response, or parse failure.
 */
export async function identifyMultipleFromPhoto(photoUri: string): Promise<InventoryGuess[]> {
  const cleaned = await requestIdentification(photoUri, "multiple");

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
