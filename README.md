# Consistency Coach V2.0
**Portfolio Project | Becky Berg (2026)**

An agentic AI coach embedded in a dating app prototype that detects trust signals and helps users make better decisions about when — and whether — to meet someone in person.

Built from original user research: *"Bridging the Gap from Swiping to IRL"* (Berg, 2025).

---

## What This Is

Most dating apps optimize for matches. This prototype asks a different question: **what happens after the match?**

Consistency Coach monitors the conversation that follows a match and surfaces three things:

1. **Is this person communicating consistently with how they presented themselves on their profile?**
2. **Are both people showing readiness to move toward an in-person meeting?**
3. **Are there timing patterns — ghosting, rhythm mismatches — that are worth noticing?**

When the signals align, the agent suggests a low-friction, safety-aware path to meeting offline. When they don't, it explains what it's seeing without being alarmist.

---

## Research Foundation

62 dating app users participated in a study on trust and authenticity in digital dating.

Key findings driving this prototype:
- **62% cited "quality of conversation"** as the #1 factor in deciding to meet in person
- Participants described frustration with people who seemed authentic on their profile but communicated differently in conversation
- Multi-day non-responsiveness was specifically cited as a trust-eroding behavior

---

## How It Works — Three Detection Layers

### Layer 1 — Profile → Conversation Consistency
The agent compares what each person claimed in their profile (bio, prompts, stated values) against how they actually communicate. It looks for:

- **Specificity match** — are messages as personal and detailed as profile prompts suggested?
- **Tone consistency** — does the conversational voice match the profile personality?
- **Values follow-through** — do stated values surface naturally in conversation?
- **Reciprocal curiosity** — are they asking questions and following up, or broadcasting?
- **Concern signals** — generic responses, mirroring without substance, compliments-as-deflection, hidden agenda patterns

### Layer 2 — Mutual Readiness Detection
The agent reads both sides of the conversation to assess whether both people are moving toward wanting to meet. It surfaces readiness signals like future-oriented language, logistics emerging naturally, and sustained conversational depth — and only suggests meeting when both users are showing them.

### Layer 3 — Timeliness & Response Pattern Detection *(V2.0)*
Two new signals track how people communicate over time, not just what they say.

**Signal 1 — Within-Day Response Rhythm Mismatch**
Detects days where one person's average response time is 3× slower than the other's on the same calendar day. Reported per day — not blended across the whole conversation. Flagged as a neutral observation; does not affect the meeting suggestion logic.

> *"Mismatch detected in message timing. On Mon, Jun 23, you averaged about 46 minutes to reply, compared to 3 minutes from your match."*

**Signal 2 — Multi-Day Silence Detection** *(research-validated)*
Detects gaps of 24+ hours between messages and attributes the silence to whoever stopped responding. Directly grounded in study findings — participants explicitly named this as something that eroded trust.

> *"Silence gap detected: your match went quiet from Sun, Jun 23 to Thu, Jun 26 (3 days). Unsolicited multi-day silences are a pattern that can erode trust."*

If the match has a multi-day silence gap, the meeting suggestion is suppressed entirely until the pattern resolves.

---

## Two Modes

### Demo Mode
Three pre-loaded research scenarios illustrate different signal patterns:

| Scenario | What It Shows |
|---|---|
| High Consistency — Readiness Building | Strong profile-to-conversation alignment, mutual readiness emerging |
| Low Consistency — Concern Signals | User B's conversation behavior misaligns with their stated profile values |
| Moderate Consistency — Potential Building | Genuine connection emerging, one person still holding back |

### Import Mode
Paste any real conversation from a dating app. Your match's name is automatically anonymized to "Your Match" before anything is analyzed — including inline mentions. A disclosure step explains exactly what gets sent to OpenAI and why.

Import format: `Name: message text` — one message per line.
Optional timestamps: `[Jun 2, 9:45 AM] Name: message text`

---

## Agent Output Structure

The agent operates in two layers internally:

**Dyadic Assessment (internal)** — the interaction is the unit of analysis, not either person in isolation. Both people are contributing to the dynamic. The agent assesses each person's contribution before drawing any conclusions.

**Coaching Output (user-facing)** — synthesized into three cards:
- **About Your Match** — what the agent observes about their communication patterns
- **How You Are Showing Up** — your own patterns, including timing flags if relevant
- **Where This Is Heading** — combined readiness read + meeting suggestion when appropriate

The agent also runs a data sufficiency check before any analysis:
- **Insufficient** — returns a holding message, no assessment attempted
- **Thin** — proceeds but opens each card with a first-impression caveat, blocks meeting suggestions
- **Sufficient** — full output

---

## Setup

```bash
# 1. Clone and install
npm install

# 2. Add your OpenAI API key
cp .env.example .env
# Edit .env: OPENAI_API_KEY=your_key_here

# 3. Run
npm start
# Open http://localhost:3000
```

The app also supports entering your API key directly in the UI — stored in localStorage and sent directly to OpenAI from the browser (never touches the server).

---

## Project Structure

```
consistency-coach/
├── server.js            — Express server + demo scenario API routes
├── public/
│   ├── index.html       — Three-panel UI (profiles | conversation | analysis)
│   ├── app.js           — Frontend logic, scenario loading, import parsing, timeliness detection
│   ├── analyze.js       — System prompt + direct OpenAI call from browser
│   └── style.css        — Dark-mode styling, color-coded signal system
├── SESSION_NOTES.md     — Full build history across all sessions
└── README.md
```

---

## Signal Color System

| Signal Type | Color | What It Means |
|---|---|---|
| Authenticity signals ✓ | Green | Positive consistency indicator |
| AI concern flags | Red | Significant concern worth noticing |
| Multi-day silence (Signal 2) | Yellow | Research-validated trust concern |
| Response rhythm mismatch (Signal 1) | Gray | Observational — no alarm, just awareness |

---

## Version History

| Version | What Changed |
|---|---|
| **V2.0** (July 2026) | Timeliness feature (Signal 1 + Signal 2), timestamps + day dividers in conversation panel, import mode with anonymization, rebuilt two-layer prompt architecture, data sufficiency check |
| **V1.1** (July 2026) | Import mode, direct browser OpenAI call, match anonymization, disclosure flow |
| **V1.0** (July 2026) | Initial build — three demo scenarios, agent analysis, meeting suggestion, dark-mode UI |

---

## What's Next

- [ ] Add timestamps to built-in demo scenarios so timeliness features fire during demos
- [ ] Beta feedback hooks on Signal 1 flags (thumbs up/down) to validate the 3× threshold
- [ ] Signal 1 threshold is an educated guess — needs real user data to calibrate
- [ ] Public deployment / beta URL
- [ ] Merge `feature/v1.1-v2.0` → `main` and open for feedback

---

## Production Roadmap (If This Were Real)

- **Fine-tuning:** Use this prompt as an annotation guide for a domain-specific training run on public conversational datasets
- **Longitudinal study:** IRB-approved data collection to validate signal weights
- **Safety layer:** Pre-meeting safety checklist, location sharing prompts, check-in reminders
- **Signal 1 calibration:** Replace the 3× threshold with user-validated data from the feedback hooks

---

*Consistency Coach — Portfolio Prototype | Becky Berg (2026)*
*Research: "Bridging the Gap from Swiping to IRL" (Berg, 2025)*
