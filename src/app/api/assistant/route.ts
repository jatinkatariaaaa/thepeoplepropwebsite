import Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin } from "@/lib/supabase";
import { ASSISTANT_SYSTEM, localAnswer } from "@/lib/assistant-kb";

/**
 * Support assistant. Streams a plain-text answer grounded in the published
 * rulebook (src/lib/assistant-kb.ts).
 *
 * With ANTHROPIC_API_KEY set the answer comes from Claude; the rulebook is the
 * cached system prompt. Without a key, or if the API cannot be reached, the
 * route answers from the same rulebook with a keyword match, so the widget
 * always has something true to say.
 */

export const maxDuration = 60;

const MODEL = process.env.ASSISTANT_MODEL || "claude-opus-5-5";
/** Models that accept the server-side refusal fallback. */
const FALLBACK_MODELS = new Set(["claude-fable-5-2", "claude-fable-5-1", "claude-opus-5-5", "claude-opus-5", "claude-sonnet-5-5"]);

const MAX_TURNS = 12;
const MAX_CHARS = 2000;
const HANDOVER = "I can't help with that one here. Please open a support ticket from your dashboard under Support, or email support@thepeopleprop.com.";

/* A light per-IP limit. Each serverless instance keeps its own window, which is enough to stop a runaway loop. */
const WINDOW_MS = 10 * 60_000;
const LIMIT = 24;
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > LIMIT;
}

type Turn = { role: "user" | "assistant"; content: string };

function parseTurns(raw: unknown): Turn[] | null {
  if (!Array.isArray(raw)) return null;
  const turns = raw
    .filter((m): m is Turn => Boolean(m) && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim().length > 0)
    .map((m) => ({ role: m.role, content: m.content.trim().slice(0, MAX_CHARS) }))
    .slice(-MAX_TURNS);
  while (turns.length && turns[0].role !== "user") turns.shift();
  if (!turns.length || turns[turns.length - 1].role !== "user") return null;
  return turns;
}

async function log(entry: { sessionId: string | null; question: string; answer: string; source: "ai" | "kb" | "fallback"; program: string | null }) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return;
  await supabaseAdmin
    .from("assistant_logs")
    .insert({ session_id: entry.sessionId, question: entry.question.slice(0, 2000), answer: entry.answer.slice(0, 6000), source: entry.source, program_key: entry.program })
    .then(
      () => undefined,
      () => undefined,
    );
}

const textResponse = (body: string | ReadableStream<Uint8Array>, source: string) =>
  new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Assistant-Source": source } });

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (limited(ip)) return new Response("You are sending messages very quickly. Please wait a few minutes and try again.", { status: 429 });

  let body: { messages?: unknown; program?: unknown; sessionId?: unknown };
  try {
    body = await request.json();
  } catch {
    return new Response("Invalid request.", { status: 400 });
  }
  const turns = parseTurns(body.messages);
  if (!turns) return new Response("Send a question to get started.", { status: 400 });

  const question = turns[turns.length - 1].content;
  const program = typeof body.program === "string" ? body.program.slice(0, 20) : null;
  const sessionId = typeof body.sessionId === "string" ? body.sessionId.slice(0, 64) : null;

  const answerLocally = (source: "kb" | "fallback") => {
    const local = localAnswer(question, program);
    void log({ sessionId, question, answer: local.text, source, program });
    return textResponse(local.text, source);
  };

  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) return answerLocally("kb");

  const client = new Anthropic();
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let answer = "";
      const push = (text: string) => {
        answer += text;
        controller.enqueue(encoder.encode(text));
      };
      try {
        const run = client.beta.messages.stream({
          model: MODEL,
          max_tokens: 4096,
          // A support answer is a few sentences; low effort keeps the reply quick.
          output_config: { effort: "low" },
          ...(FALLBACK_MODELS.has(MODEL) ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const } : {}),
          // The rulebook never changes between requests, so it is cached as one block.
          system: [{ type: "text", text: ASSISTANT_SYSTEM, cache_control: { type: "ephemeral" } }],
          messages: program ? [...turns.slice(0, -1), { role: "user", content: `(Asked from the ${program} account page.) ${question}` }] : turns,
        });

        for await (const event of run) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") push(event.delta.text);
        }
        const final = await run.finalMessage();
        if (final.stop_reason === "refusal" || !answer.trim()) {
          if (!answer.trim()) push(HANDOVER);
        }
        void log({ sessionId, question, answer, source: "ai", program });
      } catch (error) {
        if (error instanceof Anthropic.RateLimitError) console.warn("Assistant: rate limited by the API");
        else if (error instanceof Anthropic.AuthenticationError) console.error("Assistant: the API key was rejected");
        else if (error instanceof Anthropic.APIConnectionError) console.warn("Assistant: could not reach the API");
        else if (error instanceof Anthropic.APIError) console.error(`Assistant: API error ${error.status}: ${error.message}`);
        else console.error("Assistant error:", error);

        // Nothing sent yet: answer from the rulebook instead. Mid-answer: finish with the handover line.
        if (!answer) {
          const local = localAnswer(question, program);
          push(local.text);
          void log({ sessionId, question, answer: local.text, source: "fallback", program });
        } else {
          push(`\n\n${HANDOVER}`);
        }
      } finally {
        controller.close();
      }
    },
  });

  return textResponse(stream, "ai");
}
