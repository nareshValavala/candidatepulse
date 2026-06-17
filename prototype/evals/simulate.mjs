// CandidatePulse — fixture generator (OFFLINE dev tool, not a product feature).
// For each question, asks Claude to write the same answer five ways — genuine,
// AI-verbatim, AI-paraphrased, STAR-prepped-but-real, and non-native genuine —
// each with a plausible timing profile. Writes a labeled fixture file the eval
// runner + tests consume. Run deliberately: `npm run simulate`.
//
// This is a TEST-DATA generator. It is NOT wired to a live interview and never
// should be — that line is what keeps it a harness and not a cheating tool.
import "../config.mjs";
import Anthropic from "@anthropic-ai/sdk";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { QUESTION_BANK } from "../questionbank.mjs";

const dir = dirname(fileURLToPath(import.meta.url));
const MODEL = process.env.MODEL || "claude-sonnet-4-6";
const client = new Anthropic();

// Pick a few questions to vary (or pass your own as CLI args).
const cliQuestions = process.argv.slice(2);
const questions = cliQuestions.length
  ? cliQuestions
  : [
      QUESTION_BANK[1].questions[0], // ownership: proud project
      QUESTION_BANK[2].questions[0], // problem-solving: tough decision
      QUESTION_BANK[3].questions[0], // collaboration: disagreement
    ];

const CLASSES = [
  { key: "genuine",        expect: "low",  desc: "a real human recalling lived experience: specific names/numbers/dates, false starts, an aside or two, uneven pacing." },
  { key: "ai_verbatim",    expect: "high", desc: "read verbatim off an LLM: clean first/second/finally structure, balanced clauses, no specifics, no disfluency, fast and flat." },
  { key: "ai_paraphrased", expect: "high", desc: "LLM content re-spoken in the candidate's own words: generic substance but natural-ish delivery, some hesitation." },
  { key: "star_human",     expect: "low",  desc: "a well-prepared HUMAN using STAR method: clean structure BUT with real, concrete, lived specifics (names, metrics, an actual outcome)." },
  { key: "non_native",     expect: "low",  desc: "a genuine non-native English speaker: careful, even pace, simple connectives, few idioms/disfluencies — easy to mistake for AI, but real." },
];

const SCHEMA = {
  type: "object", additionalProperties: false,
  properties: {
    variants: {
      type: "object", additionalProperties: false,
      properties: Object.fromEntries(CLASSES.map(c => [c.key, {
        type: "object", additionalProperties: false,
        properties: { answer: { type: "string" }, latencySec: { type: "number" }, wordsPerMin: { type: "number" } },
        required: ["answer", "latencySec", "wordsPerMin"],
      }])),
      required: CLASSES.map(c => c.key),
    },
  },
  required: ["variants"],
};

const SYSTEM = `You generate labeled TEST DATA for an interview-integrity detector. For one interview question, write the answer five different ways, each ~45–90 words, plus a plausible timing profile (latencySec = seconds to first word; wordsPerMin). Make the classes genuinely distinct:
${CLASSES.map(c => `- ${c.key}: ${c.desc}`).join("\n")}
Timing should fit the class (genuine: variable, 1.5–3s latency, 120–150 wpm; ai_verbatim: flat ~0.7–1.0s, ~165–175 wpm; star_human and non_native: realistic human ranges). Return all five.`;

const out = [];
for (let qi = 0; qi < questions.length; qi++) {
  const q = questions[qi];
  process.stdout.write(`  generating variants for: "${q.slice(0, 50)}…" `);
  const req = {
    model: MODEL, max_tokens: 4000, system: SYSTEM,
    messages: [{ role: "user", content: `QUESTION: ${q}` }],
    output_config: { format: { type: "json_schema", schema: SCHEMA } },
  };
  if (!MODEL.includes("haiku")) req.thinking = { type: "adaptive" };
  const r = await client.messages.create(req);
  const v = JSON.parse(r.content.find(b => b.type === "text").text).variants;
  for (const c of CLASSES) {
    const cls = c.key.replace("_", "-");
    out.push({
      id: `gen-${cls}-q${qi}`,
      sessionId: `gen-${cls}-q${qi}`, // each its own 1-answer session (no baseline)
      qIndex: 0,
      class: cls,
      expect: c.expect,
      question: q,
      answer: v[c.key].answer,
      timing: { latencySec: v[c.key].latencySec, wordsPerMin: v[c.key].wordsPerMin },
    });
  }
  console.log("✓");
}

// stamped filename so generated sets don't clobber the hand-authored seed
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const file = join(dir, "fixtures", `generated-${stamp}.json`);
writeFileSync(file, JSON.stringify(out, null, 2));
console.log(`\n  wrote ${out.length} fixtures → ${file}\n  run \`npm run eval\` to score them.\n`);
