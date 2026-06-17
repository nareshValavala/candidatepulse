// CandidatePulse — Express server: serves the pages + REST API, persists to SQLite.
import "./config.mjs"; // load .env first
import express from "express";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { analyze, MODEL, generateResumeQuestions } from "./analyze.mjs";
import { QUESTION_BANK } from "./questionbank.mjs";
import * as db from "./db.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 5173;

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(express.static(join(__dirname, "public")));

// ---- pages ----
app.get("/", (_req, res) => res.sendFile(join(__dirname, "public", "index.html")));
app.get("/live", (_req, res) => res.sendFile(join(__dirname, "public", "live.html")));
app.get("/report", (_req, res) => res.sendFile(join(__dirname, "public", "report.html")));

// ---- API ----
app.post("/api/sessions", async (req, res) => {
  const { candidateName, role, resume } = req.body || {};
  if (!candidateName?.trim()) return res.status(400).json({ error: "candidateName is required" });
  const session = db.createSession({ candidateName: candidateName.trim(), role: (role || "").trim(), resume: (resume || "").trim() });
  // If a résumé was provided, generate tailored questions — best-effort, never block session creation.
  if (resume?.trim() && process.env.ANTHROPIC_API_KEY) {
    try {
      const questions = await generateResumeQuestions({ resume: resume.trim(), role: (role || "").trim() });
      db.setGeneratedQuestions(session.id, questions);
    } catch (e) { console.error("résumé question gen failed:", e?.message); }
  }
  res.json(db.getSession(session.id));
});

app.get("/api/sessions", (_req, res) => res.json(db.listSessions()));

app.get("/api/questions", (_req, res) => res.json(QUESTION_BANK));

app.get("/api/sessions/:id", (req, res) => {
  const s = db.getSession(req.params.id);
  if (!s) return res.status(404).json({ error: "session not found" });
  res.json(s);
});

app.post("/api/sessions/:id/analyze", async (req, res) => {
  if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: "ANTHROPIC_API_KEY is not set in .env" });
  const session = db.getSession(req.params.id);
  if (!session) return res.status(404).json({ error: "session not found" });
  const { qIndex, question, answer, signals } = req.body || {};
  if (!question?.trim() || !answer?.trim()) return res.status(400).json({ error: "question and answer are required" });
  try {
    const history = db.getHistory(req.params.id); // server owns the baseline
    const analysis = await analyze({ question, answer, signals, history });
    db.addAnswer(req.params.id, { qIndex: qIndex ?? history.length, question, answer, analysis, signals });
    res.json(analysis);
  } catch (e) {
    console.error("analyze error:", e);
    res.status(500).json({ error: e?.message || "analysis failed" });
  }
});

app.post("/api/sessions/:id/end", (req, res) => {
  const s = db.endSession(req.params.id);
  if (!s) return res.status(404).json({ error: "session not found" });
  res.json(s);
});

app.delete("/api/sessions/:id", (req, res) => {
  db.deleteSession(req.params.id);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`\n  CandidatePulse → http://localhost:${PORT}`);
  if (process.env.ANTHROPIC_API_KEY) console.log(`  ✓ API key detected. Model: ${MODEL}. Reports persist to data/candidatepulse.db\n`);
  else console.log(`  ⚠ ANTHROPIC_API_KEY not set — pages load, but analysis 500s until you set it in .env\n`);
});
