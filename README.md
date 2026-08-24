# ReadSignal (formerly CandidatePulse)

A real-time interview integrity-signal tool. Watches a candidate's spoken answers during a live interview and flags behavioral drift consistent with AI-assisted answering — a signal, not a verdict. It never outputs pass/fail language, and the system prompt explicitly bans words like "cheating," "fraud," and "dishonest."

## Status: prototype, two honest halves

**UI (`app/`)** — a 9-screen React prototype (login, sessions, create, dashboard, picture-in-picture, candidate consent, candidate active, report, settings). All session data is scripted and hard-coded (`app/data.jsx`). There is no real WebRTC, Deepgram, WebGazer, or Claude call behind it — playback is a JS timer, not a live stream. This is disclosed in the code itself, not hidden.

**Backend (`prototype/`)** — real Express + SQLite + Claude-based analyzer, with a labeled eval harness (`prototype/evals/`, fixtures tagged `genuine` / `ai-verbatim`). This code is real, but it has never been run end to end — no database file has ever been created, and the eval harness has never been fired. Built, not verified.

The two root-level files (`ReadSignal Prototype.html`, `ReadSignal Prototype (standalone).html`) are static exports of the same UI prototype — open either directly in a browser, no build step required.

## Stack

- Frontend: React 18, no build step (Babel-standalone)
- Backend: Express, better-sqlite3, `@anthropic-ai/sdk` (Claude)
- Eval harness: Node's built-in test runner (`node --test`), fixture replay

## Design principle

The analyzer is instructed to flag drift and suggest a follow-up question — never to render a verdict. A false accusation is a worse failure mode than a missed one, so the system prompt is written to make that failure mode structurally harder to produce, not just discouraged.

## License

Unlicensed. All rights reserved by default until that changes.
