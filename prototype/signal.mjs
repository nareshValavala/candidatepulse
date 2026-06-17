// CandidatePulse — deterministic signal helpers. Pure functions, no Claude.
// These are the bits worth unit-testing (banding, driver mapping); the LLM's
// judgement is evaluated separately in evals/run-evals.mjs.

// Confidence (0..1) → signal band. Single source of truth for the thresholds.
export function bandFor(confidence) {
  const c = Number(confidence) || 0;
  if (c < 0.33) return "normal";
  if (c < 0.55) return "mild";
  if (c < 0.72) return "elevated";
  return "strong";
}

// "High" = a band a recruiter would treat as a flag worth acting on.
export function isHigh(signal) {
  return signal === "elevated" || signal === "strong";
}

// Raw drivers (0..1; specificity/concreteness/naturalness are human-leaning-high)
// → "AI-like contribution" (higher = more AI-leaning), for display + scoring.
export function aiLikeContribution(d) {
  return {
    structure: d.structure,
    specificity: 1 - d.specificity,
    concreteness: 1 - d.concreteness,
    naturalness: 1 - d.naturalness,
    drift: d.drift,
  };
}
