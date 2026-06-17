// CandidatePulse — SQLite data layer. File-backed (persists across restarts).
// In production this becomes Cloudflare D1 (also SQLite) — the queries port directly.
// Keep ALL database access in this module so the prod swap is contained.
import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "data");
mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(join(DATA_DIR, "candidatepulse.db"));
db.pragma("journal_mode = WAL"); // better concurrency + durability

db.exec(`
CREATE TABLE IF NOT EXISTS sessions (
  id                 TEXT PRIMARY KEY,
  candidate_name     TEXT NOT NULL,
  role               TEXT,
  created_at         INTEGER NOT NULL,
  ended_at           INTEGER,
  status             TEXT NOT NULL DEFAULT 'live',   -- 'live' | 'complete'
  session_signal     TEXT,
  session_confidence REAL,
  baseline           TEXT,
  note               TEXT,
  resume             TEXT,
  generated_questions TEXT
);
CREATE TABLE IF NOT EXISTS answers (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id    TEXT NOT NULL,
  q_index       INTEGER NOT NULL,
  question      TEXT NOT NULL,
  answer        TEXT NOT NULL,
  signal        TEXT,
  confidence    REAL,
  drivers       TEXT,   -- JSON
  patterns      TEXT,   -- JSON
  followup      TEXT,   -- JSON
  rationale     TEXT,
  confound      TEXT,
  latency_sec   REAL,
  words_per_min REAL,
  created_at    INTEGER NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);
CREATE INDEX IF NOT EXISTS idx_answers_session ON answers(session_id);
`);

// lightweight migrations for DBs created before these columns existed (ignore "duplicate column")
for (const col of ["resume TEXT", "generated_questions TEXT"]) {
  try { db.exec(`ALTER TABLE sessions ADD COLUMN ${col}`); } catch {}
}

// ---- mappers -------------------------------------------------------------
function rowToSession(s) {
  return {
    id: s.id,
    candidateName: s.candidate_name,
    role: s.role,
    createdAt: s.created_at,
    endedAt: s.ended_at,
    status: s.status,
    answerCount: s.answer_count ?? undefined,
    resume: s.resume || null,
    generatedQuestions: s.generated_questions ? JSON.parse(s.generated_questions) : [],
    session: s.session_signal
      ? { signal: s.session_signal, confidence: s.session_confidence, baseline: s.baseline, note: s.note }
      : null,
  };
}
function rowToAnswer(a) {
  return {
    qIndex: a.q_index,
    question: a.question,
    answer: a.answer,
    signal: a.signal,
    confidence: a.confidence,
    drivers: a.drivers ? JSON.parse(a.drivers) : null,
    patterns: a.patterns ? JSON.parse(a.patterns) : null,
    followup: a.followup ? JSON.parse(a.followup) : null,
    rationale: a.rationale,
    confound: a.confound,
    latencySec: a.latency_sec,
    wordsPerMin: a.words_per_min,
    createdAt: a.created_at,
  };
}

// ---- queries -------------------------------------------------------------
export function createSession({ candidateName, role, resume }) {
  const id = "s_" + randomUUID().slice(0, 8);
  db.prepare(
    `INSERT INTO sessions (id, candidate_name, role, created_at, status, resume) VALUES (?, ?, ?, ?, 'live', ?)`
  ).run(id, candidateName, role || null, Date.now(), resume || null);
  return getSession(id);
}

export function setGeneratedQuestions(id, questions) {
  db.prepare(`UPDATE sessions SET generated_questions = ? WHERE id = ?`).run(JSON.stringify(questions || []), id);
}

export function listSessions() {
  return db
    .prepare(
      `SELECT s.*, (SELECT COUNT(*) FROM answers a WHERE a.session_id = s.id) AS answer_count
       FROM sessions s ORDER BY s.created_at DESC`
    )
    .all()
    .map(rowToSession);
}

export function getSession(id) {
  const s = db.prepare(`SELECT * FROM sessions WHERE id = ?`).get(id);
  if (!s) return null;
  const answers = db
    .prepare(`SELECT * FROM answers WHERE session_id = ? ORDER BY q_index ASC, id ASC`)
    .all(id)
    .map(rowToAnswer);
  return { ...rowToSession(s), answers };
}

export function getHistory(id) {
  return db
    .prepare(`SELECT question, answer FROM answers WHERE session_id = ? ORDER BY q_index ASC, id ASC`)
    .all(id);
}

export function addAnswer(sessionId, { qIndex, question, answer, analysis, signals }) {
  db.prepare(
    `INSERT INTO answers
       (session_id, q_index, question, answer, signal, confidence, drivers, patterns, followup, rationale, confound, latency_sec, words_per_min, created_at)
     VALUES
       (@session_id, @q_index, @question, @answer, @signal, @confidence, @drivers, @patterns, @followup, @rationale, @confound, @latency_sec, @words_per_min, @created_at)`
  ).run({
    session_id: sessionId,
    q_index: qIndex,
    question,
    answer,
    signal: analysis.signal,
    confidence: analysis.confidence,
    drivers: JSON.stringify(analysis.drivers),
    patterns: JSON.stringify(analysis.patterns),
    followup: JSON.stringify(analysis.followup),
    rationale: analysis.rationale,
    confound: analysis.confound,
    latency_sec: signals?.latencySec ?? null,
    words_per_min: signals?.wordsPerMin ?? null,
    created_at: Date.now(),
  });
  if (analysis.session) {
    db.prepare(
      `UPDATE sessions SET session_signal = ?, session_confidence = ?, baseline = ?, note = ? WHERE id = ?`
    ).run(analysis.session.signal, analysis.session.confidence, analysis.session.baseline, analysis.session.note, sessionId);
  }
}

export function endSession(id) {
  db.prepare(`UPDATE sessions SET status = 'complete', ended_at = ? WHERE id = ?`).run(Date.now(), id);
  return getSession(id);
}

export function deleteSession(id) {
  db.prepare(`DELETE FROM answers WHERE session_id = ?`).run(id);
  db.prepare(`DELETE FROM sessions WHERE id = ?`).run(id);
}
