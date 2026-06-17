// CandidatePulse — unit tests for deterministic logic + fixture integrity.
// No Claude calls (per the testing strategy). Run with: node --test
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { bandFor, isHigh, aiLikeContribution } from "../signal.mjs";

const dir = dirname(fileURLToPath(import.meta.url));

test("bandFor — band thresholds", () => {
  assert.equal(bandFor(0.0), "normal");
  assert.equal(bandFor(0.32), "normal");
  assert.equal(bandFor(0.33), "mild"); // lower boundary inclusive
  assert.equal(bandFor(0.54), "mild");
  assert.equal(bandFor(0.55), "elevated");
  assert.equal(bandFor(0.71), "elevated");
  assert.equal(bandFor(0.72), "strong");
  assert.equal(bandFor(1.0), "strong");
});

test("bandFor — junk input is safe", () => {
  assert.equal(bandFor(undefined), "normal");
  assert.equal(bandFor(null), "normal");
  assert.equal(bandFor("nope"), "normal");
});

test("isHigh — only elevated/strong are flags", () => {
  assert.equal(isHigh("normal"), false);
  assert.equal(isHigh("mild"), false);
  assert.equal(isHigh("elevated"), true);
  assert.equal(isHigh("strong"), true);
});

test("aiLikeContribution — human-leaning drivers are inverted", () => {
  const c = aiLikeContribution({ structure: 0.9, specificity: 0.2, concreteness: 0.1, naturalness: 0.15, drift: 0.8 });
  assert.equal(c.structure, 0.9);     // already AI-leaning-high
  assert.equal(c.drift, 0.8);         // already AI-leaning-high
  assert.ok(Math.abs(c.specificity - 0.8) < 1e-9);   // inverted
  assert.ok(Math.abs(c.concreteness - 0.9) < 1e-9);  // inverted
  assert.ok(Math.abs(c.naturalness - 0.85) < 1e-9);  // inverted
});

test("seed fixtures — shape + valid labels", () => {
  const fx = JSON.parse(readFileSync(join(dir, "fixtures", "seed.json"), "utf8"));
  assert.ok(Array.isArray(fx) && fx.length > 0, "fixtures load");
  const classes = new Set(["genuine", "ai-verbatim", "ai-paraphrased", "star-human", "non-native"]);
  for (const f of fx) {
    assert.ok(f.id && f.sessionId, `${f.id}: id + sessionId`);
    assert.ok(Number.isInteger(f.qIndex), `${f.id}: qIndex int`);
    assert.ok(classes.has(f.class), `${f.id}: known class (${f.class})`);
    assert.ok(f.expect === "low" || f.expect === "high", `${f.id}: expect low|high`);
    assert.ok(f.question?.trim() && f.answer?.trim(), `${f.id}: has Q + A`);
    assert.ok(f.timing && typeof f.timing.latencySec === "number" && typeof f.timing.wordsPerMin === "number", `${f.id}: timing`);
  }
});

test("seed fixtures — every session has at least one false-positive guard somewhere", () => {
  const fx = JSON.parse(readFileSync(join(dir, "fixtures", "seed.json"), "utf8"));
  const lowGuards = fx.filter(f => f.expect === "low" && ["genuine", "star-human", "non-native"].includes(f.class));
  assert.ok(lowGuards.length >= 3, "have FP-guard fixtures to keep us honest");
});
