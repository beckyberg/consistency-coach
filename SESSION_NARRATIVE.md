# Consistency Coach — Project Narrative
**Researcher:** Becky Berg  
**Date:** July 13, 2026  
**Purpose:** Readable summary of everything built and decided in this session

---

## What This Project Is

The Consistency Coach is a working prototype of an agentic AI tool designed for dating apps. The idea came directly from Becky's original user research, which found that people evaluate trust and authenticity not just from a dating profile alone, but from whether someone's behavior in conversation matches who they claimed to be in that profile.

The prototype does three things automatically:

First, it reads both users' dating profiles — their bios, prompt answers, stated relationship goals, and interests. Second, it monitors their conversation in real time, looking for specific signals that indicate whether each person is communicating in a way that aligns with how they presented themselves. Third, when both people show signs of genuine connection and readiness to meet, the agent autonomously surfaces a warm, low-pressure suggestion to take the conversation offline — along with a safety reminder.

This is called an "agentic" AI because it doesn't just respond when asked. It watches, evaluates, and decides when to act on its own — which is what separates it from a simple chatbot or search tool.

---

## The Research Foundation

Everything the agent looks for is grounded in a study Becky conducted in 2025 called "Bridging the Gap from Swiping to IRL." Sixty-one dating app users participated, answering questions about how they evaluate trust, what makes someone seem authentic, what makes someone seem fake, and what ultimately motivates them to agree to meet someone in person.

The single most important finding, which directly justifies building this tool, was this: **62.3% of participants — 38 of the 61 — said that quality of conversation was the number one factor in their decision to meet someone in person.** Not photos. Not verification status. Not proximity. Conversation quality.

Other key findings that power the agent's detection logic:

**What made someone seem fake or inauthentic:**
- Giving generic, cookie-cutter answers that could apply to anyone
- Telling the other person what they wanted to hear rather than expressing genuine opinions
- No reciprocity — talking about themselves without asking anything about the other person
- A bio or profile that felt "off" relative to their photos or conversation style
- Overly polished, too-perfect presentation
- Inconsistency between what they claimed to value and how they actually communicated

**What made someone seem trustworthy and real:**
- Specific, personal stories that connected to their profile content
- Humor that matched the personality they showed in their prompts
- Natural vulnerability — admitting nervousness, sharing something personal
- Genuine curiosity about the other person — asking real follow-up questions
- Being candid and forward about their intentions
- Profile-to-conversation consistency — when what they said matched how they talked

**What readiness to meet actually looks like:**
- Future-oriented language from both sides ("we should," "have you been to," "sometime we could")
- Conversation naturally moving toward logistics and shared plans
- One or both people explicitly expressing interest in meeting
- Sustained depth over multiple exchanges, not just initial excitement

These findings are published at dating.beckyberg.com and dating.beckyberg.com/safety.

It is important to note that this study was not IRB approved — it was conducted as a portfolio research project without institutional oversight. This means it cannot be submitted to peer-reviewed academic journals, but it is entirely appropriate as the research foundation for a portfolio prototype. It functions as a pilot study that motivates a more rigorous follow-up.

---

## How the Agent Works Technically

The prototype is a web application with a three-panel layout. The left panel shows two dating profiles. The center panel shows their conversation and allows the user to add new messages. The right panel shows the agent's analysis after it runs.

The technology stack is straightforward: the interface is built in plain HTML, CSS, and JavaScript. A lightweight Node.js server runs in the background to serve the files and provide demo scenario data. The AI analysis is performed by GPT-4o, OpenAI's most capable model.

All OpenAI calls are routed through the server, not made from the browser. The browser sends the conversation to a server endpoint (`/api/openai`), the server attaches the API key and forwards the request to OpenAI, and the response comes back the same way. The key lives only in the server's environment and is never sent to the browser or stored there.

*(An earlier version of the prototype did call OpenAI directly from the browser, as a workaround for a proxy issue in the original preview environment. That approach required putting a live API key into the browser, which exposes it to anything running in the page. It has been replaced with the server-side proxy described above.)*

The heart of the prototype is a document called the system prompt, which lives in a file called `analyze.js`. This is the most research-critical file in the entire project. It is essentially Becky's study findings translated into instructions for GPT-4o. Every signal category — every green flag, every red flag, every readiness cue — is drawn directly from what her 61 participants described in their own words. When someone asks "where did the agent logic come from," the answer is: from the study. The system prompt is the bridge between the research and the technology.

The files and what each one does:

- **server.js** — The backend server. Serves the web files and provides demo scenario data through API endpoints.
- **agent.js** — An alternate version of the agent logic written for server-side use. Not currently active in the UI, but preserved for a future upgrade when the prototype moves to a fine-tuned model.
- **public/index.html** — The HTML structure of the three-panel interface.
- **public/style.css** — All the visual styling. Dark mode, purple accent color, card layouts.
- **public/app.js** — The frontend logic. Handles loading scenarios, rendering profiles and conversations, parsing imported text, and displaying analysis results.
- **public/analyze.js** — Builds the request to OpenAI (sent via the server proxy) and holds the full system prompt. This is where the research lives in code form.
- **.env** — A local file containing the OpenAI API key. Read by the server at startup; never sent to the browser and never uploaded to GitHub.
- **.env.example** — A template showing what the .env file should look like, safe to share publicly.
- **.gitignore** — Tells Git which files to exclude from version control. Protects the .env file and the node_modules folder.
- **README.md** — Portfolio documentation for the GitHub repository.
- **SESSION_NOTES.md** — Technical session notes for continuity across work sessions.

---

## The Three Demo Scenarios

The prototype comes loaded with three pre-built scenarios, each designed to demonstrate a different signal pattern identified in the research.

**Scenario One: High Consistency — Readiness Building**
Jordan and Sam. Both profiles emphasize genuine connection, cooking, outdoor activities, and specific personal values. Their conversation matches those profiles exactly — they reference real memories, ask genuine follow-up questions, share specific stories, and naturally move toward suggesting a meeting. The agent detects high consistency across both profiles, identifies readiness cues from both users, and fires a meeting suggestion.

**Scenario Two: Low Consistency — Concern Signals**
Alex and Riley. Riley's profile makes strong claims about valuing genuineness and loyalty, stating "I can spot fake from a mile away." But Riley's conversation tells a different story — deflecting every specific question with a vague answer, pivoting to compliments instead of engagement, never asking Alex anything, and jumping to a meeting request after barely two real exchanges. The agent catches the gap between Riley's stated values and actual behavior and surfaces concern flags rather than a meeting suggestion.

**Scenario Three: Moderate Consistency — Potential Building**
Taylor and Morgan. Taylor is a nurse who admits in their profile to being "a little guarded at first." True to that, Taylor's conversation is careful and slightly reserved — but importantly, this is consistent with the profile. The agent is designed to recognize this distinction: guardedness that matches a self-disclosed profile trait is not a red flag. It is consistency. So the agent monitors without acting, waiting for more signals to develop.

---

## Secret Management

The OpenAI API key is kept out of the codebase entirely. It lives in a local `.env` file that `.gitignore` excludes from version control, so it is never committed or pushed. The server reads it at startup and attaches it to outgoing OpenAI requests; the browser never receives it.

A companion file, `.env.example`, is committed to the repository. It contains the *names* of the required settings with placeholder values, so anyone cloning the project knows what to configure without any real credential being shared.

---

## Version History

**Version 1.0 — Current Baseline**

This is the foundation. Everything described in this document is version 1.0. It is tagged in Git, meaning it is permanently saved and can be restored at any point regardless of what gets built afterward. The tag is `v1.0` and the commit hash is `f3490a2`.

To restore version 1.0 at any time, run:
```
cd /workspace/consistency-coach
git checkout v1.0
```

---

## Feature Roadmap

**Version 1.1 — Conversation Import**

This is the next feature to build. It will allow users to paste a real dating app conversation directly into the Consistency Coach and analyze it against a profile they describe.

The design combines two ethical approaches. Option B means no data is ever stored — the conversation is sent to OpenAI for analysis in transit and immediately discarded. A clear disclosure notice is shown to the user before any analysis runs, and they must explicitly confirm before proceeding. Option C adds anonymization — the user provides their own name and their match's name, and the app automatically replaces the match's name with "Your Match" throughout the conversation before anything is sent to OpenAI.

Combined, this gives: anonymization protecting the match's identity, transparent disclosure before analysis, no storage of any conversation data, and explicit user acknowledgment. The ethical reasoning for this design choice is itself a portfolio talking point — it demonstrates that Becky understands the two-party consent problem in digital privacy, which is one of the most active challenges facing trust and safety teams at dating app companies right now.

**Version 1.2 — Pre-Meeting Safety Checklist**

When the agent fires a meeting suggestion, it will surface an expandable checklist drawn from Becky's safety research. Items include: meet in a public place, tell a friend where you're going, arrange your own transportation, trust your gut and know it's okay to cancel. This connects the prototype directly to the safety study published at dating.beckyberg.com/safety.

**Version 1.3 — Scenario Editor**

A tool that lets users build and save their own profile and conversation pairs to test. This would allow the prototype to be used as a research instrument — showing participants scenarios and asking them to compare their intuitive reactions to the agent's output.

**Version 2.0 — Fine-Tuned Model**

The long-term technical upgrade. Replace the GPT-4o prompt with a model that has been fine-tuned on labeled conversational data. The training data would come from publicly available consented datasets — candidates include the CMU Deception Detection dataset, the PAN Author Profiling datasets, and the Stanford NLP Sentiment datasets. The system prompt from version 1.0 would serve as the annotation guide, defining exactly what the model should learn to detect. Eventually, data from a properly designed longitudinal study would replace the public datasets entirely.

---

## Research Roadmap

The prototype currently rests on one study — the 2025 portfolio study with 61 participants. That study provides the conceptual foundation and the signal framework. But to build a production-ready model, two additional research efforts are needed.

**Study A — Consistency Signal Operationalization**

This study would answer the question: what does profile-to-conversation consistency look like at the word and sentence level, specifically enough that an NLP model can detect it? The Berg (2025) study captures perceptual ratings — people's holistic sense of whether someone seemed consistent. Study A would drill into the linguistic specifics: vocabulary overlap between profile and messages, emotional tone patterns, self-disclosure progression, question-asking behavior. The output would be a codebook of labeled examples that a model can actually learn from.

The good news is that the Berg (2025) study partially covers Study A's ground. The qualitative responses — particularly the open-ended questions about what made someone seem fake or trustworthy — provide a strong starting framework. The gap is the linguistic operationalization at scale.

**Study B — Longitudinal Readiness Study**

This study would answer the question: at what point in a real dating app conversation do both users become ready to meet, and what behavioral signals mark that moment? This is the study that was discussed at length during this session under the name "From Match to Meeting."

The design would recruit 100 active dating app users, follow them for six to eight weeks of active app usage, collect profile data and conversation excerpts with full informed consent explicitly covering ML use, and gather readiness ratings from participants every few days. Human annotators would code the conversations using the signal framework derived from the prototype's system prompt. The output would be a labeled dataset of readiness windows — the training signal for Mechanism 2 of the agent.

**The IRB Question**

Without institutional affiliation, IRB approval requires one of three paths: an independent IRB service such as Advarra or WCG (cost: $1,500–$5,000), a faculty sponsor at Columbia or Teachers College (possible given alumni status — worth reaching out to a former advisor), or an industry partnership where a dating app company sponsors and IRB-approves the study. The third path is the most realistic and most valuable, and it becomes available once a role at a dating app company is secured.

The recommended sequencing is to build the prototype first and pursue the longitudinal study with institutional backing once a sponsoring partner is in place. This is not a compromise — a pilot that motivates a rigorous follow-up is how this kind of research normally progresses.

---

## How to Start the Next Work Session

When opening a new Agent Mom session, paste this message:

*"I'm continuing work on my Consistency Coach prototype — a portfolio project grounded in my dating app user research. Please read my session notes here: https://github.com/beckyberg/consistency-coach/blob/master/SESSION_NOTES.md — then clone the repo at https://github.com/beckyberg/consistency-coach into the workspace and get the server running so we can continue development."*

The first commands to run after cloning:
```
cd /workspace/consistency-coach
npm install
mom serve 3000 "Consistency Coach" -- node /workspace/consistency-coach/server.js
```

Make sure the `.env` file exists in the project folder and contains a valid `OPENAI_API_KEY=` line. The server reads it at startup — there is no key entry in the app interface. If the key has been rotated, update `.env` with the new one and restart the server.

To start building version 1.1:
```
cd /workspace/consistency-coach
git checkout -b feature/conversation-import
```

---

## Known Issues and Small Cleanup Tasks

- A file called `test.txt` was accidentally committed during setup. It can be removed with: `git rm test.txt` followed by `git commit -m "remove test file"`
- The `agent.js` file is not currently used by the UI. It is preserved intentionally for the Version 2.0 upgrade path.
- Credential status and rotation steps are tracked privately, outside this repository.

---

*End of session narrative — Becky Berg, July 13, 2026*
