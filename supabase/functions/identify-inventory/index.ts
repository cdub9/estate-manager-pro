// Supabase Edge Function: identify-inventory
//
// Proxies vision-based inventory identification to Anthropic so the API key
// never ships in the client binary. The key is read from the ANTHROPIC_API_KEY
// function secret (see deploy steps below).
//
// JWT verification is left ON (the default), so only authenticated estate
// members can invoke this — the supabase-js client attaches the caller's
// session token automatically via functions.invoke().
//
// The client sends { image (base64), mediaType, mode: "single" | "multiple" };
// this function owns the prompt (so it can't be repurposed as a general Claude
// proxy) and returns { text } — the model's raw text, which the client parses.
//
// Deploy:
//   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//   supabase functions deploy identify-inventory
//
// Runs on Deno; not part of the app's TypeScript project (tsconfig excludes it).

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";
const MODEL = "claude-haiku-4-5";
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

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);

  if (!ANTHROPIC_API_KEY) {
    return json({ error: "AI identification isn't configured on the server." }, 503);
  }

  let payload: { image?: unknown; mediaType?: unknown; mode?: unknown };
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }

  const image = typeof payload.image === "string" ? payload.image : "";
  if (!image) return json({ error: "Missing image." }, 400);
  const mediaType = typeof payload.mediaType === "string" ? payload.mediaType : "image/jpeg";
  const isMulti = payload.mode === "multiple";
  const prompt = isMulti ? MULTI_PROMPT : SINGLE_PROMPT;
  const maxTokens = isMulti ? 1500 : 400;

  let res: Response;
  try {
    res = await fetch("https://api.anthropic.com/v1/messages", {
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
              { type: "image", source: { type: "base64", media_type: mediaType, data: image } },
              { type: "text", text: prompt },
            ],
          },
        ],
      }),
    });
  } catch {
    return json({ error: "Couldn't reach the identification service." }, 502);
  }

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      if (body?.error?.message) detail = body.error.message;
    } catch {
      // fall back to statusText
    }
    return json({ error: `Identification failed (${res.status}): ${detail}` }, 502);
  }

  const data = await res.json();
  const text = data?.content?.find((c: { type: string }) => c.type === "text")?.text;
  if (!text) return json({ error: "Empty response from identification service." }, 502);

  return json({ text });
});
