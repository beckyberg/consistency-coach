# Consistency Coach — Session Notes
**Last updated:** July 15, 2026  
**Researcher:** Becky Berg  
**Portfolio project for:** Dating outcomes / trust & safety researcher roles at dating app companies

---

## 🎯 What This Project Is

A working agentic AI prototype called the **Consistency Coach** — a tool that:
1. Detects alignment between how a dating app user presents in their **profile** vs. how they communicate in **conversation**
2. Monitors for **mutual readiness cues** that signal both users are ready to meet offline
3. Autonomously surfaces a **low-friction, safe path to an in-person meeting** when both signals align

Built as a portfolio piece to demonstrate the intersection of relationship psychology research and agentic AI product development.

---

## 📖 Research Foundation

**Study:** "Bridging the Gap from Swiping to IRL" — Becky Berg (2025)  
**Participants:** 62 dating app users  
**Published at:** https://dating.beckyberg.com and https://dating.beckyberg.com/safety  
**Note:** Non-IRB portfolio study — not for academic publication. Appropriate for portfolio use.

### Key Findings That Power the Agent
- **62%** of participants cited "quality of conversation" as the #1 factor in deciding to meet in person
- Trust signals operate across two stages: profile AND conversation
- Profile-to-conversation **consistency** is the primary mechanism through which trust is built or eroded
- **Inauthenticity signals:** no reciprocity, telling people what they want to hear, generic responses, hidden agenda
- **Authenticity signals:** personal specificity, vulnerability, humor consistency, forward momentum
- **Readiness cues:** future-oriented language, logistics emerging, explicit meeting interest, sustained depth

---

## 🏗️ Technical Architecture

### Stack
- **Frontend:** Vanilla HTML/CSS/JavaScript (no framework)
- **Backend:** Node.js + Express (serves static files + demo scenario API)
- **AI:** GPT-4o via OpenAI API — called **directly from the browser** (not through the server)
- **Version control:** Git + GitHub

### Why Browser-Direct API Call
The app calls OpenAI directly from the browser (`analyze.js`) rather than routing through the server. This bypasses proxy issues in the pi preview environment. The server exists only to serve static files and provide demo scenario data.

### File Structure
```
consistency-coach/
├── server.js           — Express server (static files + /api/scenario routes)
├── agent.js            — Server-side agent logic (not currently used by UI — kept for Option 2 upgrade)
├── public/
│   ├── index.html      — 3-panel UI layout
│   ├── style.css       — Dark mode styling
│   ├── app.js          — Frontend logic, scenario data, UI rendering
│   └── analyze.js      — Browser-direct OpenAI API call + system prompt
├── .env                — OpenAI API key (NOT in GitHub)
├── .env.example        — Template (safe to share)
├── .gitignore          — Excludes .env and node_modules
└── README.md           — Portfolio documentation
```

### The Agent System Prompt
Lives in `/public/analyze.js`. This is the most research-critical file — every signal category in the prompt is directly grounded in the Berg (2025) study findings. Editing this file = editing the research framework.

---

## 🔑 Credentials & Keys

### OpenAI API Key
- Stored in: `/workspace/consistency-coach/.env`
- Also saved in: browser localStorage as `cc_openai_key`
- ⚠️ Key appeared in chat session — **recommend regenerating** at platform.openai.com/api-keys
- Billing: ~$0.005 per analysis (GPT-4o) — $5 credit loaded

### GitHub
- Repo: **https://github.com/beckyberg/consistency-coach**
- Remote: `https://github.com/beckyberg/consistency-coach.git`
- ⚠️ GitHub token appeared in chat — **recommend regenerating** at github.com/settings/tokens
- To push future changes: get new token, use `git remote set-url origin https://TOKEN@github.com/beckyberg/consistency-coach.git`, push, then remove token from URL

---

## 📦 Version History

### v1.0 — Baseline Portfolio Prototype
**Tag:** `v1.0`  
**Commit:** `f3490a2`  
**Features:**
- 3 research-grounded demo scenarios:
  - **High Consistency** — Jordan + Sam, strong alignment, agent fires meeting suggestion
  - **Low Consistency** — Alex + Riley, Riley shows no reciprocity/deflects, concern flags fire
  - **Moderate Consistency** — Taylor + Morgan, Taylor is guarded (consistent with profile), agent holds back
- Live GPT-4o consistency detection
- Live readiness cue detection  
- Autonomous meeting suggestion with safety reminder
- API key bar with localStorage persistence
- Dark mode 3-panel UI

**To restore v1.0 at any time:**
```bash
cd /workspace/consistency-coach
git checkout v1.0
```

---

### v1.1 — Conversation Import
**Branch:** `feature/v1.1-v2.0`  
**Latest commit:** `e48a82d`  
**Features:**
- Import tab alongside Demo Scenarios tab
- 3-step import form: your name → match name → paste conversation
- Auto-anonymization: match name replaced with "Your Match" everywhere (including inline mentions)
- Disclosure notice with explicit consent checkbox before any analysis runs
- No storage — conversation exists only in transit to OpenAI
- Profile cards stay visible in import mode (populated with import-mode placeholder text)

---

### v2.0 — Prompt Architecture Overhaul (same branch)
**Design decisions made July 15, 2026 — full structured prompt review session**

#### Two-Layer Architecture
- **Layer 1 — Dyadic assessment:** neutral, relational — the interaction is the unit of analysis, not either person in isolation
- **Layer 2 — Coaching output:** user-facing, three lenses: About Your Match / How You Are Showing Up / Where This Is Heading

#### Key Design Decisions (all deliberate)
- **No concern_level metric** — complexity stays in prose, no scalar score for the match. Avoids users over-relying on a number that boxes something complex.
- **Asymmetric coaching voice:** match assessed directly and clearly; user assessed lightly, suggestively, invitionally — never verdict language
- **Safety observations woven into prose** — no separate warning card. Integrated into "About Your Match" coaching text, tone shifts naturally from warm → cautionary → safety-toned based on signals.
- **Option B meeting suggestions** — conversation-grounded, never generic ("coffee or a walk"). Agent references what came up specifically between these two people. User decides logistics.

#### Three-Tier Data Sufficiency System
| Tier | Threshold | Behavior |
|---|---|---|
| Insufficient | Under 6 messages OR no substantive exchange | "Keep going" message only — no analysis |
| Thin | 6–9 messages (client-side count) | Full analysis + yellow caveat banner — NO meeting suggestion |
| Full | 10+ messages | Complete analysis, meeting suggestion can fire |

**Important:** Meeting suggestion is suppressed at both prompt level AND client-side guard in thin-data state.

#### New Right Panel Structure (replaces v1 cards)
- **About Your Match** — direct assessment prose + match signal chips
- **How You Are Showing Up** — light observational prose + your signal chips + relational pattern in italics
- **Where This Is Heading** — combined readiness read + meeting suggestion box (when earned)

#### 6 Test Conversations Built (July 15, 2026)
All use Becky as the user name for import mode testing:

| # | Match | Consistency | Length | Key signal |
|---|---|---|---|---|
| 1 | Marcus | High | 16 msgs | Meeting suggestion should fire, conversation-grounded |
| 2 | Daniel | Medium | 10 msgs | Partial engagement, deflects personal depth |
| 3 | Ryan | Low | 8 msgs | Profile-conversation mismatch |
| 4 | Chris | Red flag | 8 msgs | "Saying what they want to hear" signal |
| 5 | Tom | Medium-thin | 6 msgs | Thin-data yellow banner, NO meeting suggestion |
| 6 | Nate | High-insufficient | 3 msgs | Insufficient data message only |

All 6 tested and confirmed working correctly as of July 15, 2026.

---

## 🗺️ Feature Roadmap

### v1.1 — Conversation Import (NEXT — ready to build)
**Branch to create:** `feature/v1.1-v2.0`  
**Design:** Combined Option B + C:
- User pastes real dating app conversation
- User provides their name and match's name
- App **auto-strips match's name** → replaces with "Your Match" (anonymization)
- **Disclosure notice** shown before analysis: "This conversation is sent to OpenAI for analysis and is never stored"
- User explicitly confirms before proceeding
- **Ethical rationale:** No storage + anonymization + explicit consent = defensible design
- **Legal note:** Gray area on two-party consent — mitigated by no storage and clear disclosure

### v1.2 — Pre-Meeting Safety Checklist
**Branch to create:** `feature/safety-checklist`  
**Design:** When agent fires a meeting suggestion, surface a checklist:
- [ ] Meet in a public place
- [ ] Tell a friend where you're going
- [ ] Have your own transportation
- [ ] Trust your gut — it's ok to cancel
- Grounded in Becky's safety research at dating.beckyberg.com/safety

### v1.3 — Scenario Editor
**Branch to create:** `feature/scenario-editor`  
**Design:** Let users build and save their own profile + conversation pairs to test

### v2.0 — Fine-Tuned Model (Option 2)
Replace GPT-4o prompt with a fine-tuned model trained on:
- Public consented datasets (CMU Deception Detection, PAN Author Profiling, etc.)
- Annotation guide derived from the Option 3 prompt logic
- Eventually: longitudinal study data (IRB path TBD)

---

## 🧠 Broader Research & Product Strategy

### The Two-Mechanism Framework
The agent addresses two distinct mechanisms:

| Mechanism | What It Does | Research Basis |
|---|---|---|
| **Mechanism 1** | Consistency detection — profile vs. conversation alignment | Berg (2025) study findings |
| **Mechanism 2** | Readiness timing — when to surface the offline meeting | Partially covered by Berg (2025); needs longitudinal study |

### Research Roadmap
```
CURRENT:   Berg (2025) non-IRB study → informs agent prompt (partial Study A)
NEXT:      Longitudinal study (Study B) → IRB path needed
OPTIONS:   Independent IRB ($1,500–$5,000) | Faculty sponsor at Columbia/Teachers College | Industry partnership after hiring
IDEAL:     Land role at dating app company → run longitudinal study with institutional backing
```

### Career Positioning
**Target roles:**
- Dating Outcomes Researcher (Hinge has this role)
- Trust & Safety Research Scientist
- Conversation Design Researcher
- AI Ethics / Responsible AI (Dating)

**The pitch:**
> "I identified a gap at Stages 3 and 5 of the dating app pipeline — conversation and offline transition — where agentic AI is essentially absent. I ran original user research, identified the specific behavioral signals that predict authentic connection, and built a working prototype that demonstrates the concept. Here's the system prompt, here's the research it came from, and here's the production roadmap."

### Pipeline Context
Dating app product pipeline and where agentic AI currently sits:
- **Stage 1 Onboarding:** Assistive AI (profile coaching)
- **Stage 2 Matching:** Going fully agentic NOW — hottest battleground (Tinder Chemistry, Bumble Bee, Hinge ML)
- **Stage 3 Conversation:** Assistive → Agentic transition — ethically fraught ← **YOUR PROTOTYPE LIVES HERE**
- **Stage 4 Safety:** Already largely agentic (reactive fraud/abuse detection)
- **Stage 5 Offline Transition:** EMPTY — no AI, no research ← **YOUR PROTOTYPE ALSO ADDRESSES THIS**
- **Stage 6 Retention:** Partially agentic (engagement-focused, not outcome-focused)

---

## 🚀 How to Pick This Up Next Session

### Starting the Server
```bash
cd /workspace/consistency-coach
node server.js
# Then run: mom serve 3000 "Consistency Coach" -- node /workspace/consistency-coach/server.js
```

### Opening the App
- Launch preview on port 3000
- Enter OpenAI API key in the key bar at the top
- Demo mode: click a scenario → click "🔍 Run Consistency Coach"
- Import mode: click "📥 Import Conversation" tab → fill in names → paste conversation → Preview & Anonymize → check consent box → Run

### Current Branch
```bash
cd /workspace/consistency-coach
git checkout feature/v1.1-v2.0
git log --oneline -5  # see recent commits
```

### Pushing Changes to GitHub
```bash
# Get a fresh GitHub token from github.com/settings/tokens first
cd /workspace/consistency-coach
git remote set-url origin https://YOUR_NEW_TOKEN@github.com/beckyberg/consistency-coach.git
git push origin feature/v1.1-v2.0
git remote set-url origin https://github.com/beckyberg/consistency-coach.git  # remove token immediately
```

### Merging to Master + Tagging v1.1
```bash
git checkout master
git merge feature/v1.1-v2.0
git tag v1.1 && git push origin master && git push origin v1.1
```

### What to Work on Next (Priority Order)
1. **Run all 6 test conversations and document observations** — empirical log for portfolio
2. **Deploy** — `mom deploy` → get public HTTPS URL → generate QR code for beta testing
3. **Mobile responsive layout** — single-column redesign for phone, device-detection for feature splits
4. **Profile screenshot import** — drag-and-drop GPT-4o vision extraction
5. **v1.2 Safety checklist** — surfaces when meeting suggestion fires

---

## ⚠️ Known Issues / To Fix
- `test.txt` was accidentally committed — can be removed with `git rm test.txt && git commit -m "remove test file"`
- API key needs rotating (appeared in chat session)
- GitHub token needs rotating (appeared in chat session)
- `agent.js` (server-side) is currently unused by the UI — kept for future Option 2 upgrade

---

## 📚 Key References
- Berg, B. (2025). *Bridging the Gap from Swiping to IRL.* Portfolio study. https://dating.beckyberg.com
- Hinge "Most Compatible" — Gale-Shapley algorithm (Nobel Prize 1962)
- Tinder "Chemistry" feature — camera roll + conversational AI matching (2025–2026)
- Bumble "Bee" / "Dates" — fully agentic matchmaker (2026)
- Grindr "Wingman" — conversational AI advisor (beta)
- ResearchGate (2025): *Emerging Trends in Dating App Innovation* — MaxDiff survey, 79 users, 28 features
