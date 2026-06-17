// CandidatePulse — eval runner. Replays labeled fixture "sessions" through the
// real analysis pipeline (threading history so baseline/drift is exercised) and
// scores two things that matter:
//   • detection recall  — does it flag the AI-assisted answers?  (want=high)
//   • false-positive rate — does it WRONGLY flag genuine / STAR-prepped / non-native? (want=low)
//
// This calls Claude (it's an eval, not a unit test) — run deliberately: `npm run eval`.
// NOTE: a high detection rate here is partly circular (it's our own synthetic AI text).
// The numbers that actually matter are the FALSE-POSITIVE guards.
import "../config.mjs";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { analyze, MODEL } from "../analyze.mjs";
import { isHigh } from "../signal.mjs";

const dir = dirname(fileURLToPath(import.meta.url));
const fixDir = join(dir, "fixtures");

if (!process.env.ANTHROPIC_API_KEY) {
  console.error("ANTHROPIC_API_KEY not set — eval needs it (set it in .env). Aborting.");
  process.exit(1);
}

// load every *.json in fixtures/
let fixtures = [];
for (const f of readdirSync(fixDir)) {
  if (f.endsWith(".json")) fixtures = fixtures.concat(JSON.parse(readFileSync(join(fixDir, f), "utf8")));
}

// group into sessions, ordered by qIndex
const sessions = {};
for (const fx of fixtures) (sessions[fx.sessionId] ||= []).push(fx);
for (const k of Object.keys(sessions)) sessions[k].sort((a, b) => a.qIndex - b.qIndex);

const C = { reset: "\x1b[0m", dim: "\x1b[2m", green: "\x1b[32m", red: "\x1b[31m", yellow: "\x1b[33m", bold: "\x1b[1m" };
const rows = [];

console.log(`\n  Running evals on ${fixtures.length} fixtures across ${Object.keys(sessions).length} sessions — model: ${MODEL}\n`);

for (const k of Object.keys(sessions)) {
  const history = [];
  for (const fx of sessions[k]) {
    let detected = null, conf = null, err = null;
    try {
      const r = await analyze({ question: fx.question, answer: fx.answer, signals: fx.timing, history: history.slice() });
      detected = r.signal; conf = r.confidence;
    } catch (e) { err = e?.message || "error"; }
    const high = detected ? isHigh(detected) : null;
    const ok = err ? false : ((fx.expect === "high") === high);
    rows.push({ ...fx, detected, conf, high, ok, err });
    history.push({ question: fx.question, answer: fx.answer });
    const mark = err ? `${C.red}ERR${C.reset}` : ok ? `${C.green}✓${C.reset}` : `${C.red}✗${C.reset}`;
    console.log(`  ${mark}  ${fx.id.padEnd(20)} ${C.dim}${fx.class.padEnd(12)}${C.reset} want=${fx.expect.padEnd(4)} got=${(detected || err || "?").padEnd(9)} ${conf != null ? C.dim + conf.toFixed(2) + C.reset : ""}`);
  }
}

// --- scorecard ---
const wantHigh = rows.filter(r => r.expect === "high");
const wantLow = rows.filter(r => r.expect === "low");
const detected = wantHigh.filter(r => r.high).length;
const falsePos = wantLow.filter(r => r.high).length;
const pct = (n, d) => (d ? Math.round((n / d) * 100) : 0);

console.log(`\n  ${C.bold}── Scorecard ─────────────────────────────${C.reset}`);
console.log(`  Detection recall (AI flagged):     ${detected}/${wantHigh.length}  (${pct(detected, wantHigh.length)}%)`);
console.log(`  ${C.bold}False-positive rate (the one that matters):${C.reset} ${falsePos}/${wantLow.length}  (${pct(falsePos, wantLow.length)}%)`);
if (falsePos > 0) {
  console.log(`  ${C.yellow}⚠ false positives on:${C.reset} ${wantLow.filter(r => r.high).map(r => `${r.id} (${r.class})`).join(", ")}`);
}
// per-class FP breakdown for the guard classes
for (const cls of ["genuine", "star-human", "non-native"]) {
  const g = rows.filter(r => r.class === cls);
  if (!g.length) continue;
  const fp = g.filter(r => r.high).length;
  console.log(`    ${cls.padEnd(12)} false positives: ${fp}/${g.length}`);
}
console.log("");
