// CandidatePulse — curated first-round question bank.
// Designed for a non-expert recruiter to run a structured screen: behavioral +
// experience-grounding prompts that surface real, lived detail (which feeds the
// specificity/baseline signal) WITHOUT requiring the recruiter to judge technical
// correctness. Ask 1–2 "Warm-up" questions first — they set the candidate's baseline.
//
// Expand this later from public sources (Kaggle interview-question sets, etc.).

export const QUESTION_BANK = [
  {
    category: "Warm-up · sets the baseline (ask first)",
    questions: [
      "To start, walk me through your current role and what you own day to day.",
      "What does a typical week look like for you right now?",
      "How did you get into this kind of work?",
      "What are you working on at the moment that you find interesting?",
    ],
  },
  {
    category: "Ownership & impact",
    questions: [
      "Tell me about a project you're proud of — and what your specific contribution was.",
      "Describe something you built or shipped end to end. What was hardest about it?",
      "Tell me about a time you took ownership of a problem nobody else wanted.",
      "What's something you changed or improved that you can point to as clearly yours?",
    ],
  },
  {
    category: "Problem-solving & decisions",
    questions: [
      "Walk me through a difficult technical decision you made and the trade-offs you weighed.",
      "Tell me about a time something you built failed or broke. What happened, and what did you do?",
      "Describe a problem where your first approach didn't work. How did you figure out the next one?",
      "Tell me about a time you had to make a call without enough information.",
    ],
  },
  {
    category: "Collaboration & conflict",
    questions: [
      "Tell me about a time you disagreed with a teammate or manager. How did it play out?",
      "Describe a time you had to get people who didn't agree to move in one direction.",
      "Tell me about feedback that was hard to hear and what you did with it.",
      "How do you handle it when a project is behind and the team is stressed?",
    ],
  },
  {
    category: "Communication · explain it simply",
    questions: [
      "Explain something technical you worked on as if I'm not technical.",
      "Pick a tool or system you know well and tell me how you'd describe it to a new teammate.",
      "Tell me about a time you had to convince someone non-technical of a technical point.",
      "What's a concept in your field that people commonly get wrong?",
    ],
  },
  {
    category: "Reflection",
    questions: [
      "What's a weakness you're actively working on?",
      "Describe a technical decision you later regretted.",
      "What would you do differently if you started your current project over?",
      "Where are you trying to grow next, and why?",
    ],
  },
];
