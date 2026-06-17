// CandidatePulse — demo data: sessions + a fully scripted live interview timeline.

const SESSIONS = [
  { id: 'js-9f2a', name: 'Jordan Bell', role: 'Senior Backend Engineer', status: 'live', when: 'In progress', signal: 'elevated', dept: 'Engineering', dur: '00:14:22' },
  { id: 'mk-71c4', name: 'Maya Krishnan', role: 'Product Designer', status: 'scheduled', when: 'Today, 3:30 PM', signal: null, dept: 'Design' },
  { id: 'dr-22b8', name: 'Devin Rao', role: 'Solutions Engineer', status: 'scheduled', when: 'Tomorrow, 10:00 AM', signal: null, dept: 'Sales' },
  { id: 'aw-04e1', name: 'Aisha Warsame', role: 'Senior Backend Engineer', status: 'complete', when: 'Yesterday', signal: 'normal', dept: 'Engineering', dur: '00:41:09' },
  { id: 'tl-88a0', name: 'Tom Lindqvist', role: 'Data Engineer', status: 'complete', when: 'Jun 4', signal: 'strong', dept: 'Engineering', dur: '00:38:51' },
  { id: 'pn-15d3', name: 'Priya Nair', role: 'Engineering Manager', status: 'complete', when: 'Jun 3', signal: 'mild', dept: 'Engineering', dur: '00:45:12' },
];

// The live session under analysis
const LIVE = {
  id: 'js-9f2a', name: 'Jordan Bell', role: 'Senior Backend Engineer',
  recruiter: 'You', company: 'Northwind', resume: 'jordan_bell_resume.pdf',
};

// Scripted question blocks. Each plays out: question asked -> latency -> answer streams ->
// signals resolve. Transcript split into tokens for streaming. Gaze metrics per block.
const SCRIPT = [
  {
    q: 1, signal: 'normal', confidence: 0.18, latency: 1.6, askAt: 0,
    question: 'To start — tell me about your current role and what you own day to day.',
    answer: "Sure. So right now I'm at Lumen Freight, I've been there about three years on the platform team. Day to day I mostly own our dispatch service — it's the thing that matches loads to drivers. Honestly it's a bit of a mess, we inherited it from a contractor, so a lot of my week is just… firefighting? Last Tuesday I was up until midnight because a Kafka consumer kept falling over. But yeah, dispatch is mine, plus I mentor two of the junior folks.",
    gaze: { variance: 0.71, blink: 17, fixation: 4, head: 0.62 },
    patterns: [],
    drivers: { structure: 0.20, specificity: 0.84, timing: 0.30, gaze: 0.18, drift: 0.15 },
    followup: null,
  },
  {
    q: 2, signal: 'mild', confidence: 0.44, latency: 1.1, askAt: 1,
    question: 'Tell me about a project you’re proud of.',
    answer: "A project I'm proud of. I'd say there are really three things that made it work. First, we improved reliability by moving to an event-driven architecture. Second, we reduced latency significantly through better caching. And third, we increased team velocity by improving our deployment pipeline. It was a really impactful project for the business and for the team overall.",
    gaze: { variance: 0.41, blink: 12, fixation: 11, head: 0.34 },
    patterns: [
      { t: 'Structural consistency', d: 'Clean first / second / third segmentation', sev: 'mild' },
      { t: 'Specificity dip', d: 'No named system, metric, or date', sev: 'mild' },
    ],
    drivers: { structure: 0.58, specificity: 0.40, timing: 0.46, gaze: 0.40, drift: 0.38 },
    followup: { q: 'Which service was it, and what was the actual latency number — before and after?', why: 'Specificity dip — invites a grounded metric.' },
  },
  {
    q: 3, signal: 'elevated', confidence: 0.71, latency: 0.8, askAt: 2,
    question: 'Tell me about a time you led a team through a difficult deadline.',
    answer: "Leading a team through a difficult deadline requires three key things. First, clear communication — making sure everyone understands the goal and their role. Second, prioritization — focusing on what truly matters and cutting scope where needed. Finally, supporting the team — removing blockers and keeping morale high under pressure. By focusing on these areas, I was able to successfully guide the team to deliver on time.",
    gaze: { variance: 0.12, blink: 6, fixation: 38, head: 0.08 },
    patterns: [
      { t: 'High structural consistency', d: '3-point format, balanced clause length', sev: 'elevated' },
      { t: 'Low specificity', d: 'No named individuals, project, or outcome', sev: 'elevated' },
      { t: 'Gaze fixed position', d: 'Sustained 38s at fixed screen coordinate', sev: 'elevated' },
      { t: 'Reduced hesitation variance', d: 'No self-correction or filler across answer', sev: 'mild' },
    ],
    drivers: { structure: 0.86, specificity: 0.22, timing: 0.72, gaze: 0.88, drift: 0.64 },
    followup: { q: 'What was that person’s name — and are they still at the company?', why: 'Low specificity + gaze fixation. A name is hard to read off an overlay.' },
  },
  {
    q: 4, signal: 'elevated', confidence: 0.68, latency: 0.9, askAt: 3,
    question: 'How do you handle disagreement with a manager?',
    answer: "When I disagree with a manager, I focus on a few key principles. First, I listen carefully to understand their perspective fully. Second, I present my view backed by data rather than opinion. And finally, I stay aligned on the shared goal even if we differ on approach. This way disagreements stay constructive and productive for everyone involved.",
    gaze: { variance: 0.14, blink: 7, fixation: 31, head: 0.10 },
    patterns: [
      { t: 'Repeated structural template', d: 'Same first / second / finally frame as Q3', sev: 'elevated' },
      { t: 'Gaze fixed position', d: 'Sustained 31s, same coordinate as Q3', sev: 'elevated' },
      { t: 'Entropy collapse', d: 'Answer length stable regardless of question type', sev: 'mild' },
    ],
    drivers: { structure: 0.83, specificity: 0.30, timing: 0.70, gaze: 0.85, drift: 0.74 },
    followup: { q: 'Walk me through the actual conversation — what did they say first?', why: 'Forces a concrete, lived recollection over a template.' },
  },
  {
    q: 5, signal: 'mild', confidence: 0.39, latency: 1.4, askAt: 4,
    question: 'What’s a weakness you’re actively working on?',
    answer: "Honestly? Saying no. I take on too much and then I'm the bottleneck. Last quarter I had like four things in flight and dropped a code review for two days, which held up a teammate — that stung. So now I'm trying to be more deliberate, I block my calendar and I've started actually declining stuff. It's a work in progress.",
    gaze: { variance: 0.58, blink: 14, fixation: 7, head: 0.44 },
    patterns: [
      { t: 'Register shift', d: 'Conversational tone returns after Q3–Q4 plateau', sev: 'mild' },
    ],
    drivers: { structure: 0.34, specificity: 0.70, timing: 0.36, gaze: 0.30, drift: 0.46 },
    followup: { q: 'Good — notice the contrast with earlier answers. Hold this register for the next question.', why: 'Natural variance returned. Useful baseline for comparison.' },
  },
  {
    q: 6, signal: 'strong', confidence: 0.82, latency: 0.7, askAt: 5,
    question: 'Describe a technical decision you later regretted.',
    answer: "A technical decision I regret involves three main lessons. First, I underestimated the long-term maintenance cost of the approach we chose. Second, I should have invested earlier in better testing and observability. And third, I learned the importance of aligning the team before committing to a direction. Ultimately it taught me to weigh trade-offs more carefully and communicate decisions more clearly going forward.",
    gaze: { variance: 0.09, blink: 5, fixation: 44, head: 0.06 },
    patterns: [
      { t: 'Cross-signal convergence', d: 'Structure + specificity + gaze + timing all elevated together', sev: 'strong' },
      { t: 'Third repeat of template', d: 'Identical 3-point frame across Q3, Q4, Q6', sev: 'strong' },
      { t: 'Gaze fixed position', d: 'Sustained 44s — longest of session, same coordinate', sev: 'strong' },
      { t: 'Blink rate floor', d: '5/min, sustained — consistent with reading', sev: 'elevated' },
      { t: 'Zero self-interruption', d: 'No restart or correction across entire block', sev: 'elevated' },
    ],
    drivers: { structure: 0.90, specificity: 0.18, timing: 0.80, gaze: 0.92, drift: 0.88 },
    followup: { q: 'Take me into the code — what file would I open, and what did the fix actually change?', why: 'Strong convergence. A regret you lived through has a concrete artifact.' },
  },
];

// gaze scan-path samples for the live gaze panel (normalized 0..1 of a screen rect)
function gazePath(kind, n = 80) {
  const pts = [];
  if (kind === 'reading') {
    // tight left->right sweeps returning to a fixed Y band
    let line = 0;
    for (let i = 0; i < n; i++) {
      const t = (i % 16) / 16;
      const x = 0.18 + t * 0.62 + (Math.random() - 0.5) * 0.02;
      const y = 0.42 + line * 0.04 + (Math.random() - 0.5) * 0.012;
      pts.push([x, y]);
      if (i % 16 === 15) line = (line + 1) % 3;
    }
  } else {
    // natural: wandering, larger excursions
    let x = 0.5, y = 0.5;
    for (let i = 0; i < n; i++) {
      x += (Math.random() - 0.5) * 0.22; y += (Math.random() - 0.5) * 0.20;
      x = Math.max(0.08, Math.min(0.92, x)); y = Math.max(0.12, Math.min(0.88, y));
      pts.push([x, y]);
    }
  }
  return pts;
}

Object.assign(window, { SESSIONS, LIVE, SCRIPT, gazePath });
