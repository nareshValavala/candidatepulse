# ReadSignal *(working name — see NAME.md)*

A real-time interview **integrity-signal** app. Create a session, run it live (mic +
live transcript), and each answer is scored against the candidate's **own baseline** —
drift across the whole interview is the signal, not any single 30-second clip. Every
session is **saved to a database** and the report is retrievable any time by URL.

> "A signal, not a verdict." It never claims cheating — it surfaces a behavioral
> signal and, most usefully, a sharp follow-up question to ask next.

## Run

```powershell
cd d:\ReadSignal\prototype
npm install                       # express, better-sqlite3, @anthropic-ai/sdk
Copy-Item .env.example .env       # then paste your ANTHROPIC_API_KEY into .env
node server.mjs                   # → http://localhost:5173
```

(`node server.mjs` avoids the PowerShell `npm.ps1` execution-policy block. `npm start` also works.)

## The flow

1. **`/`** — Recruiter home. Create a session (candidate + role) → starts a live session.
2. **`/live?s=<id>`** — Live dashboard (dark instrument UI). For each question: **Ask** (mic on,
   captures real time-to-first-word), speak/read the answer (live transcript), **Done & analyze**.
   The question is editable (interviews are dynamic). Each answer is sent to the server, scored
   against the running baseline, and **persisted**.
3. **End & view report** → **`/report?s=<id>`** — the stored report: overall session read +
   baseline, signal timeline, and per-answer evidence (drivers, patterns, follow-up, reality-check).
   Reloadable any time from the home page.

Live transcription uses the browser **Web Speech API** (Chrome/Edge) — a demo shortcut;
production swaps in Deepgram per the spec. The only API spend is the Claude analysis.

## Architecture

| File | Role |
|---|---|
| `server.mjs` | Express — serves pages + REST API |
| `db.mjs` | **SQLite** (better-sqlite3) — `sessions` + `answers`. File-backed → persists across restarts. |
| `analyze.mjs` | The Claude call (structured output) + the system prompt + baseline/drift logic |
| `config.mjs` | Loads `.env` |
| `public/index.html` · `live.html` · `report.html` | the three screens |
| `data/readsignal.db` | where reports live (gitignored) |

**Prod:** Cloudflare. SQLite → **D1** (also SQLite) is a near-zero migration; all DB access is in
`db.mjs` so the swap is contained. (`/text` still serves the original paste-a-Q/A analysis tester.)

## Model / cost

Set `MODEL` in `.env`: `claude-haiku-4-5` (cheapest, ~1,200 analyses/$5), `claude-sonnet-4-6`
(default, ~200/$5), or `claude-opus-4-8` (max quality). Each analysis is one short call.
