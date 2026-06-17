// CandidatePulse — the analysis core. Calls Claude (no owned model, no training).
// Returns a per-answer signal + a whole-interview session read, scored against
// the candidate's own baseline. "A signal, not a verdict."
import "./config.mjs"; // ensure ANTHROPIC_API_KEY is loaded before the client is built
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

// Sonnet 4.6 is the default (what the product spec specifies; ~$3/$15 per 1M).
// Override with MODEL=claude-haiku-4-5 (cheapest) or MODEL=claude-opus-4-8 (max quality).
export const MODEL = process.env.MODEL || "claude-sonnet-4-6";

const SYSTEM = `You are the analysis core of CandidatePulse, an interview INTEGRITY signal — not a cheat detector, not a verdict engine.

Your job: read one interview question and the candidate's spoken answer (a transcript), and emit a behavioral SIGNAL plus, most importantly, a sharp follow-up question the recruiter could ask next.

Hard rules (non-negotiable):
- NEVER output the words cheating, fraud, dishonest, lying, fake, or pass/fail. This is "a signal, not a verdict."
- You analyze the transcript. You MAY also receive measured timing from the live browser capture (latency = seconds to first word after the question; pace = words per minute). If given, factor it in — a long flat latency or an unnaturally steady pace is weak corroborating evidence, never proof. You still have NO gaze and NO audio prosody — never invent eye-movement or pitch claims.
- The follow-up question is the hero output. It must be SPECIFIC to this answer — probe the exact vague spot, ask for a name/number/contradiction that is hard to produce from a generic script but trivial for someone who lived it. One natural question a real recruiter would actually ask, plus a one-line why.
- Be honest about the central limitation: a clean, structured, fluent answer is ALSO exactly what a well-prepared, well-coached human produces (the STAR method literally teaches clean structure). In the "confound" field, state plainly the most likely INNOCENT explanation for whatever you flagged. If the signal is elevated/strong, the confound must still be a real, fair alternative reading.

SESSION CONTEXT (critical): You may be given the candidate's EARLIER answers from this same interview. Use them as the person's own BASELINE — how they naturally talk (formal vs casual, structured vs rambly, specific vs general). A consistently formal or structured style is NOT itself a signal; plenty of people are simply wired that way. What matters is DRIFT: does THIS answer depart from how this candidate spoke earlier — warm and concrete in the warm-up, then suddenly templated and generic? A single 30-second answer in isolation is weak; the signal lives in the cross-question pattern relative to the person's own baseline. Judge the current answer against that baseline, and ALSO return a session-level read of the whole interview so far. On the first answer there is no baseline yet — say so, stay cautious, and treat the session as establishing.

Driver polarity (0..1):
- structure: higher = more templated/AI-clean segmentation and balanced clauses.
- specificity: higher = MORE grounded in named people, systems, tools, metrics, dates.
- concreteness: higher = MORE specific lived-experience detail vs generic principle.
- naturalness: higher = MORE genuine conversational noise (self-correction, hesitation words, asides, tangents).
- drift: higher = MORE written-register vocabulary/connectives ("furthermore", "moreover") that read as essay rather than speech.

AI-assisted-LEANING profile: high structure, low specificity, low concreteness, low naturalness, high drift.
Human-leaning profile: the inverse. confidence (0..1) is your overall read that the answer LOOKS generated rather than recalled — never certainty that it was.

Signal bands by confidence: normal < 0.33, mild 0.33–0.55, elevated 0.55–0.72, strong >= 0.72.
patterns: 0–4 observations, each a short title + one-line description + severity. Empty array if nothing notable.
rationale: 2–3 sentences, plain English, instrument-calm, no accusation.`;

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    signal: { type: "string", enum: ["normal", "mild", "elevated", "strong"] },
    confidence: { type: "number" },
    drivers: {
      type: "object",
      additionalProperties: false,
      properties: {
        structure: { type: "number" },
        specificity: { type: "number" },
        concreteness: { type: "number" },
        naturalness: { type: "number" },
        drift: { type: "number" },
      },
      required: ["structure", "specificity", "concreteness", "naturalness", "drift"],
    },
    patterns: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          t: { type: "string" },
          d: { type: "string" },
          sev: { type: "string", enum: ["mild", "elevated", "strong"] },
        },
        required: ["t", "d", "sev"],
      },
    },
    followup: {
      type: "object",
      additionalProperties: false,
      properties: { q: { type: "string" }, why: { type: "string" } },
      required: ["q", "why"],
    },
    rationale: { type: "string" },
    confound: { type: "string" },
    session: {
      type: "object",
      additionalProperties: false,
      properties: {
        signal: { type: "string", enum: ["normal", "mild", "elevated", "strong"] },
        confidence: { type: "number" },
        baseline: { type: "string" },
        note: { type: "string" },
      },
      required: ["signal", "confidence", "baseline", "note"],
    },
  },
  required: ["signal", "confidence", "drivers", "patterns", "followup", "rationale", "confound", "session"],
};

export async function analyze({ question, answer, signals, history }) {
  let userText = "";
  if (Array.isArray(history) && history.length) {
    userText += "EARLIER IN THIS INTERVIEW (the candidate's own baseline — judge drift against this):\n";
    history.forEach((h, i) => {
      userText += `\nQ${i + 1}: ${h.question}\nA${i + 1}: ${h.answer}\n`;
    });
    userText += "\n----\nCURRENT ANSWER TO ANALYZE:\n\n";
  }
  userText += `QUESTION (recruiter):\n${question}\n\nANSWER (candidate transcript):\n${answer}`;
  if (signals && (signals.latencySec != null || signals.wordsPerMin != null)) {
    userText += `\n\nMEASURED SIGNALS (live browser capture):`;
    if (signals.latencySec != null) userText += `\n- latency to first word: ${Number(signals.latencySec).toFixed(1)} s`;
    if (signals.wordsPerMin != null) userText += `\n- speaking pace: ${Math.round(signals.wordsPerMin)} words/min`;
  }

  const req = {
    model: MODEL,
    max_tokens: 16000,
    system: SYSTEM,
    messages: [{ role: "user", content: userText }],
    output_config: { format: { type: "json_schema", schema: SCHEMA } },
  };
  if (!MODEL.includes("haiku")) req.thinking = { type: "adaptive" }; // adaptive thinking on Sonnet/Opus

  const response = await client.messages.create(req);
  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock) throw new Error("No text block in model response");
  return JSON.parse(textBlock.text);
}

// --- Résumé → tailored, grounded first-round questions ---------------------
const RESUME_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    questions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: { q: { type: "string" }, basis: { type: "string" } },
        required: ["q", "basis"],
      },
    },
  },
  required: ["questions"],
};

export async function generateResumeQuestions({ resume, role, n = 5 }) {
  const sys = `You generate interview questions GROUNDED in a specific candidate's resume, for a non-expert recruiter to ask in a first-round screen.

Rules:
- Each question must probe a CONCRETE claim in the resume — a named project, system, tool, role, metric, or decision — so that only someone who actually did the work could answer it specifically (names, numbers, trade-offs, what broke).
- Phrase them the natural way a real recruiter would ask out loud. No jargon the recruiter couldn't pronounce.
- Do NOT ask generic questions that ignore the resume.
- "basis" = the exact resume claim the question targets (so the recruiter knows why they're asking).`;
  const user = `ROLE: ${role || "(unspecified)"}\n\nRESUME:\n${resume}\n\nGenerate ${n} grounded questions.`;
  const req = {
    model: MODEL,
    max_tokens: 4000,
    system: sys,
    messages: [{ role: "user", content: user }],
    output_config: { format: { type: "json_schema", schema: RESUME_SCHEMA } },
  };
  if (!MODEL.includes("haiku")) req.thinking = { type: "adaptive" };
  const r = await client.messages.create(req);
  const t = r.content.find((b) => b.type === "text");
  if (!t) throw new Error("No text block in résumé-question response");
  return JSON.parse(t.text).questions;
}
