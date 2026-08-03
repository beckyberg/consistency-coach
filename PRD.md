# Product Requirements Document — Consistency Coach

**Status:** Draft — complete (scope, screens, architecture, build plan)
**Owner:** Becky Berg
**Last updated:** July 29, 2026

> **How to read this doc:** Sections 1–7 are the product (what and why — no technical knowledge needed). Sections 8–10 are the screens and what has to be on them. Sections 11–14 are the technical requirements, written for a non-technical reader — every term is defined the first time it appears. Sections 15–18 are what to build, in what order, what could go wrong, and how beta settles the two things this doc can't. Section 19 is where this is ultimately headed — integration into a dating app — and what that means for the choices made now.

---

## 1. Overview

Consistency Coach is an AI-powered coaching feature embedded in a dating app. It watches the conversation that happens *after* a match and helps users judge whether it's a good idea to meet the person in real life — before they invest more time or take a safety risk on someone who isn't who they appear to be.

Most dating apps stop caring about the user once a match happens. Consistency Coach picks up where the match leaves off.

---

## 2. Problem Statement

People don't get burned by bad profiles — they get burned by conversations that don't match the profile. Someone can present as warm, curious, and genuine on their profile, then communicate in a way that feels generic, evasive, or inconsistent once the conversation actually starts. Daters currently have no structured way to notice this pattern — they rely on gut feeling, which is easy to talk yourself out of, especially when you're excited about a match.

Separately, timing patterns — long silences, wildly mismatched response speeds — are something daters instinctively read as red or yellow flags, but nobody has language for it or a consistent way to track it across a conversation.

This was validated with original user research (61 dating app users): quality of conversation was the #1 factor cited in deciding whether to meet someone — named by 62.3% of participants (38 of 61) — and multi-day non-responsiveness was specifically named as something that erodes trust.

---

## 3. Target Users

- Adults actively using dating apps who have matched with someone and are messaging before a first in-person meeting.
- People who've been burned before by a mismatch between someone's profile and how they actually showed up in conversation, and want a second opinion before meeting.
- Not intended for: conversations after a first date has already happened, or long-term relationship coaching. This is specifically a *pre-meeting* tool — a considered boundary, not an unfinished edge. The reasoning is in §19a.

---

## 4. Goals

- Help users notice, in plain language, when a match's conversation behavior doesn't line up with their profile — without being alarmist or making the call for them.
- Help users recognize when **both** people seem genuinely ready to meet, so they can suggest meeting up with more confidence.
- Surface timing patterns (slow replies, long silences) as neutral observations the user can factor into their own judgment.
- Give users a moment of reflection — including on their *own* communication patterns — not just a read on the other person.

## 4a. Non-Goals

- This is not a safety/verification tool (it does not verify identity, run background checks, or detect catfishing).
- This is not a personality or compatibility matching engine.
- This is not meant to replace a user's own judgment — it's meant to inform it.

---

## 5. Product Scope

### In Scope

**Conversation analysis**
- Compare what a person claims about themselves on their profile against how they actually communicate in the conversation.
- Flag positive signals (consistency, curiosity, follow-through) and concern signals (generic responses, deflection, mismatch between stated values and behavior).

**Mutual readiness read**
- Assess whether *both* people in the conversation seem to be moving toward wanting to meet in person — not just one side.
- Only encourage a meeting when both sides show genuine readiness.

**Timing pattern detection**
- Notice within-day differences in how quickly each person responds, framed as a neutral observation.
- Notice multi-day silences and name them for what research shows they usually mean — without shaming either person.
- When a real silence pattern is present, hold off on encouraging a meeting until it resolves.

**User-facing coaching output**
Presented as three simple, readable takeaways:
1. What the coach notices about your match's communication.
2. What the coach notices about how *you're* showing up.
3. Where things seem to be heading, and whether meeting up makes sense right now.

**Honesty about limited information**
- If there isn't enough conversation yet to say anything meaningful, the coach says so plainly instead of guessing.
- If there's a *little* conversation but not much, the coach gives a lighter, caveated read rather than a confident one, and won't suggest meeting yet.

**Two ways to use it**
- Try it instantly with pre-loaded example conversations that show different patterns.
- Paste in a real conversation to get a read on it, with the match's name automatically hidden before anything is analyzed, and a clear explanation of what's being shared and why.

### Out of Scope (for this version)

- Verifying whether a profile or person is real (catfishing/identity verification).
- In-app messaging, matching, or profile-building features — this sits on top of an existing conversation, it doesn't create one.
- Safety planning tools (location sharing, check-ins, safety checklists) — flagged as a future idea, not part of this version.
- Coaching for relationships beyond the "should we meet" decision point.

---

## 6. Success Looks Like

- A user can read the coach's output and immediately understand *why* it's saying what it's saying, in plain language, without feeling judged.
- The coach's read on "both people seem ready to meet" feels trustworthy enough that a user would actually act on it.
- Timing flags feel like useful context, not an accusation.
- Users trust the tool enough to paste in a real conversation rather than only trying the demo examples.

---

## 7. The Signals the Product Detects

These are the specific things the coach looks for. They come from the research and they are what the whole product is built to surface. Two categories, and the difference between them matters for how the app is built (see §12).

### 7a. Judgment signals — the AI reads the conversation and forms a view

**Profile-to-conversation consistency** *(always available for the match, whose profile is required; available for the user only if they chose to provide their own)*
- Specificity match — are their messages as personal and detailed as their profile promised?
- Tone consistency — does their conversational voice match the personality the profile signals?
- Values follow-through — do the values they stated show up naturally in how they talk?
- Interest follow-through — when a stated interest comes up, do they actually engage with it?
- Vulnerability consistency — profile signals emotional depth, but conversation stays surface-level.

**Authenticity signals** — positive, readable from the conversation alone
- Personal specificity, reciprocal curiosity, natural vulnerability, forward momentum, genuine humor.

**Concern signals** — negative, readable from the conversation alone
- Mirroring without substance, validation without content, no reciprocity, generic responses, premature meeting pressure, profile-conversation mismatch.

**Mutual readiness** — both people, not one
- Future-oriented language from both sides, personal questions in both directions, depth increasing rather than flat, explicit interest in meeting.
- **Hard rule:** a meeting is never suggested on one-sided signals.

### 7b. Timing signals — measured by counting, not by judgment

These are calculated from message timestamps. They are arithmetic, not opinion, which is why they are handled differently in the architecture.

| Signal | What triggers it | How it's presented |
|---|---|---|
| **Response rhythm mismatch** | On a single calendar day, one person's average reply time is 3× or more the other's | Neutral, gray. An observation, not a flag. Does **not** block a meeting suggestion. |
| **Multi-day silence** | A gap of 24+ hours between consecutive messages, attributed to whoever went quiet | Yellow. Named as a research-validated trust concern. **Does** block the meeting suggestion until it resolves. |

> ⚠️ **Known limitation, must be stated in the UI:** the 3× threshold is an educated guess, not a validated number. It needs real user data to calibrate. Until then, Signal 1 should never carry alarm language.

**Flag accuracy feedback (v1 requirement).** Each timing flag carries a lightweight "does this match your experience?" control — accurate / not accurate. This is the only realistic path to calibrating the 3× threshold, and it is far cheaper to build in now than to retrofit. What gets recorded is covered in §13 — it does not weaken the no-storage promise.

### 7c. Honesty about limited data

Before any of the above runs, the coach decides whether it has enough to say anything. Three outcomes:

| State | Condition | What the user sees |
|---|---|---|
| **Insufficient** | Fewer than ~6 messages, or no real back-and-forth yet | A holding message only. No assessment attempted. |
| **Thin** | Enough to read, but barely | Full output, but every card opens with a "first impression, not a conclusion" caveat, and meeting suggestions are blocked. |
| **Sufficient** | Real conversation with substance | Full output, normally. |

This is a product feature, not a technical safeguard. Being willing to say "I don't know yet" is a large part of why the coach is trustworthy.

---

## 8. User Flow

The app is a **three-step flow** — the user moves forward through three screens and gets a result at the end. This replaces the current three-panel desktop layout, which shows everything at once and assumes the user already knows what to do.

```
   ┌────────────────────────────────────────────────────────────┐
   │                    LANDING / ENTRY                          │
   │   "Get a read on your conversation before you meet up"      │
   │   [ Analyze my conversation ]   [ See an example first ]    │
   └───────────────┬───────────────────────┬────────────────────┘
                   │                       │
                   │                       └──► loads a demo, skips
                   ▼                            straight to Screen 3
   ┌────────────────────────────────────────────────────────────┐
   │  SCREEN 1 — PROFILES                                        │
   │  ┌──────────────────────────────────────────────────────┐  │
   │  │  Their profile   ★REQUIRED  [ paste or screenshot ]  │  │
   │  └──────────────────────────────────────────────────────┘  │
   │  ┌──────────────────────────────────────────────────────┐  │
   │  │  Your profile     encouraged [ paste or screenshot ] │  │
   │  └──────────────────────────────────────────────────────┘  │
   │  → confirm what was extracted (editable)                   │
   │                                  [ Continue → ]            │
   └───────────────────────────┬────────────────────────────────┘
                               ▼
   ┌────────────────────────────────────────────────────────────┐
   │  SCREEN 2 — CONVERSATION                  (required)        │
   │  ┌──────────────────────────────────────────────────────┐  │
   │  │  Paste your conversation    [ large paste box ]      │  │
   │  └──────────────────────────────────────────────────────┘  │
   │  → preview with their name replaced by "Your Match"        │
   │  → privacy disclosure + consent checkbox                   │
   │          [ ← Back ]              [ Analyze → ]             │
   └───────────────────────────┬────────────────────────────────┘
                               ▼
   ┌────────────────────────────────────────────────────────────┐
   │  SCREEN 3 — RESULTS                                         │
   │   ① About your match    ② How you're showing up            │
   │   ③ Where this is heading (+ meeting suggestion or reason   │
   │                            it's being held back)            │
   │          [ ← Edit conversation ]   [ Start over ]          │
   └────────────────────────────────────────────────────────────┘
```

### Flow rules

1. **The match's profile is required. The user's own profile is encouraged but skippable.** The two are not equally load-bearing. Card ① — the read on whether *they* are showing up as advertised — is the product's core claim and cannot run without their profile. Card ② degrades gracefully without the user's own profile: it loses the consistency layer but keeps the authenticity signals readable from the conversation alone (reciprocity, specificity, follow-up). Requiring one instead of two preserves the differentiated output while halving the effort spent before the user sees any value. *(See §16 — Screen 1 remains the flow's largest drop-off risk, and the reason screenshot input is not optional. See §18 — the skip rate on the user's own profile is a primary beta measurement.)*
2. **A persistent step indicator** ("Step 2 of 3") appears on Screens 1 and 2 so the user knows how much is left.
3. **Going back never loses work.** Moving back to Screen 1 or 2 must preserve everything already entered.
4. **The demo path bypasses input entirely.** "See an example first" loads a pre-written scenario and lands the user on Screen 3, so they can see the value before deciding whether to paste their own conversation.
5. **Screenshot upload is an alternative input method on Screens 1 and 2**, not a separate mode. The user chooses "paste text" or "upload screenshots" per screen; the flow is otherwise identical.

---

## 9. Screen-by-Screen Requirements

### Screen 0 — Landing

| Requirement | Detail |
|---|---|
| Value proposition | One sentence, above the fold, in the user's language — not "agentic AI trust detection." Something closer to: *"Before you meet up, get a read on whether the conversation matches the profile."* |
| Two entry points | Primary: start with my own conversation. Secondary: see an example first. |
| Research credibility | A single line citing the 61-user study — the percentage *and* the sample size, since a bare percentage from a small study invites "out of how many?" as the first question. This is what makes the tool feel like more than a horoscope. |
| Privacy promise, up front | "Nothing you paste is stored." Say this before asking for anything, not after. |

### Screen 1 — Profiles

| Requirement | Detail |
|---|---|
| Two boxes, match's first | **Top: their profile (required). Bottom: yours (encouraged).** Order matters — the required input should come first, and putting theirs on top frames the screen around the thing the user actually came for. |
| Free-form input | The user pastes everything — name, bio, prompts, whatever they copied. No structured form fields. The app sorts it out. |
| Asymmetric requirement, clearly signposted | Their profile cannot be empty. The user's own can be skipped, but the skip must be an explicit choice with a stated cost — not a greyed-out afterthought. |
| Justify each ask separately | Their profile: *"This is what lets the coach check whether how they talk matches how they presented themselves — it's the whole point."* Yours: *"Optional, but it's what lets the coach tell you how **you're** coming across, not just them."* A required step with a reason reads as a method; without one it reads as a form. |
| Two ways in, per box | Paste text **or** upload a screenshot. Several dating apps don't allow text selection on profiles, so screenshot input is the only viable path for some users — it is a requirement of this screen, not an enhancement. |
| Degraded Card ② is signalled | If the user skips their own profile, Screen 3's Card ② must say what it's working without — quietly, once. A shallower card with no explanation reads as a weak product rather than a missing input. |
| Parsed confirmation | After parsing, show the user what was extracted (name, bio, prompts, goal, interests) in editable fields. **Do not analyze on unconfirmed parsed data** — parsing can be wrong, and a wrong name breaks anonymization on the next screen. |
| Match name capture | The match's name is captured here and is what Screen 2 uses to anonymize. Because Screen 1 is required, Screen 2 never has to ask for it — but the name **must** be among the fields the user confirms, since a wrong name silently breaks anonymization downstream. |

### Screen 2 — Conversation

| Requirement | Detail |
|---|---|
| One large paste box | The primary and only required input. |
| Format guidance with an example | Show the expected shape inline: `Name: message text`, one message per line. A real example beats a description. |
| Timestamps explained as an unlock | Timestamps are optional, but **the timing signals cannot run without them.** Say so: *"If your conversation includes timestamps, paste them too — that's what lets the coach spot silences and response-time patterns."* Show the accepted format: `[Jun 2, 9:45 AM] Name: message` |
| Forgiving parsing | Real pasted conversations are messy. The parser must tolerate extra blank lines, inconsistent spacing, and read-receipt junk lines, and tell the user clearly when it can't make sense of the input. |
| Anonymization preview | Before anything is sent anywhere, show the parsed conversation with the match's name replaced by "Your Match" — including mentions inside message text. The user must be able to **see** that it worked. |
| Privacy disclosure | Plain-language statement of what gets sent to the AI provider, that nothing is stored, and — importantly — that this is a two-party conversation the other person hasn't consented to sharing. Do not bury this. |
| Explicit consent | A checkbox the user must actively tick before the analyze button becomes available. |
| Message count feedback | Show how many messages were detected. If it's below the sufficiency threshold, warn *before* the user spends time analyzing. |

### Screen 3 — Results

| Requirement | Detail |
|---|---|
| Card ① About your match | The direct read. Tone scales from warm to cautionary based on what was found. When concern signals are strong, safety-toned language is woven into the prose — never a red warning banner. |
| Card ② How you're showing up | The mirror. Observational and invitational — *"something worth noticing…"*, *"what would it look like to…"* — never verdict language like *"you failed to…"*. The user is here to grow, not to be graded. |
| Card ③ Where this is heading | The synthesis: trajectory, plus either a meeting suggestion or a clear statement of what would need to shift first. |
| Meeting suggestion is grounded | When it fires, it must reference something specific from the conversation (*"you've both talked about hiking"*), never a generic default like "grab coffee." Logistics stay with the user. |
| Suppression is explained | If a meeting suggestion is withheld — because of a silence gap or thin data — **say why**. Silence here reads as a bug or a judgment. |
| Signal chips | The specific signals detected, color-coded: green (authenticity), red (concern), yellow (multi-day silence), gray (rhythm mismatch — observational only). |
| Timing findings in plain language | *"On Mon, Jun 23, you averaged about 46 minutes to reply, compared to 3 minutes from your match."* Dates and durations spelled out, no jargon. |
| Insufficient-data state | A distinct screen state, not an empty version of the normal one. Holding message + an invitation to come back when there's more conversation. |
| Thin-data state | Full cards, but each opens with a first-impression caveat, and the meeting suggestion area explains it's being held back. |
| Exits | "Edit my conversation" (back to Screen 2, data preserved) and "Start over" (clears everything). |

---

## 10. States Every Screen Needs

Easy to forget, and the most common source of a prototype feeling broken. Each of these needs designed copy — not a spinner and a shrug.

| State | Requirement |
|---|---|
| **Empty** | Before input. Should teach what to do, not just sit blank. |
| **Loading** | Analysis takes several seconds. Show what's happening (*"Reading the conversation…"*), not an unlabelled spinner. |
| **Parse failure** | The paste didn't look like a conversation. Explain the expected format again and let them retry without losing what they typed. |
| **AI unavailable** | The AI service is down, rate-limited, or the key is missing. Say so honestly and let them retry — never show a fabricated analysis. |
| **Insufficient data** | Covered above. A real designed state. |
| **No timestamps found** | Not an error. A quiet note that timing signals were skipped and why. |

---

## 11. Technical Requirements — The First Layer

This is the "first layer" of architecture: the big pieces, what each one is responsible for, and the rules that don't change. It deliberately stops short of file structure and code organization.

### 11a. The three pieces

```
   ┌──────────────┐        ┌──────────────┐        ┌──────────────┐
   │   BROWSER    │───────►│  YOUR SERVER │───────►│  AI PROVIDER │
   │  (frontend)  │◄───────│  (backend)   │◄───────│   (OpenAI)   │
   └──────────────┘        └──────────────┘        └──────────────┘
    What the user          The middleman you        The model that
    sees and types.        own and control.         reads and judges.

    • Draws the screens    • Holds the secret       • Receives the
    • Holds their input      API key                  conversation
    • Anonymizes names     • Forwards requests      • Returns the
    • Counts timing        • Serves the app           assessment
    • Renders results      • Stores NOTHING
```

**Frontend** — the code that runs inside the user's web browser. It draws the screens, holds what the user typed, and displays results.

**Backend** — a small program you run on a computer somewhere (a "server"). Its only real job here is to hold the secret key that lets you talk to the AI provider. Without it, that key would sit in the browser where anyone could copy it and run up your bill.

**AI provider** — currently OpenAI. It receives the conversation and returns the judgment-based assessment.

### 11b. What each piece is responsible for

| Piece | Owns |
|---|---|
| **Frontend** | All three screens and their states · holding the user's input as they move between screens · **anonymizing the match's name before anything leaves the browser** · calculating the timing signals · rendering results |
| **Backend** | Serving the app files · holding the API key · forwarding analysis requests to the AI and returning the response · serving demo scenarios |
| **AI provider** | Judgment signals only — consistency, authenticity, concerns, readiness, and the coaching prose |

### 11c. Architectural rules

These are the decisions that shouldn't be revisited casually.

1. **Anonymize before the network, not after.** The match's name is replaced in the browser, before the conversation is sent anywhere. Anonymizing on the server would mean the real name already left the user's machine.

2. **Counting is done in code; judging is done by the AI.** Response times and silence gaps are arithmetic — the code calculates them, so they're exact, repeatable, and testable. Whether someone sounds evasive is a judgment — that goes to the AI. Never ask the AI to do arithmetic it can get wrong, and never hard-code a rule for something that needs interpretation.

3. **No conversation content is ever stored.** Conversations, profiles, and names exist in the browser's memory and in transit to the AI, and nowhere else. This is a product promise made to the user on Screen 0 — it is now an architectural constraint.

   **The one exception, and its boundary:** flag-accuracy feedback (§7b) records a small amount of anonymous calibration data — which flag fired, the numbers that triggered it, and whether the user called it accurate. **No message text, no names, no profile content, and nothing that could reconstruct a conversation.** The rule is not "we store nothing"; it is "we store nothing about *your conversation*." Any future feature that wants storage must clear the same bar.

4. **The secret key never reaches the browser.** All AI calls route through the backend. *(Note: earlier versions of this project supported the user pasting their own key in the browser. That path should be removed — it conflicts with this rule.)*

5. **The AI returns structured data, not a paragraph.** The model returns a defined, predictable shape — assessments, signal lists, an action decision — and the frontend decides how to display it. This keeps design changes from requiring prompt changes.

6. **Rules the AI must not be able to override are enforced in code.** Specifically: if a multi-day silence is detected, or the data is thin, the meeting suggestion is suppressed by the frontend regardless of what the AI returned. Safety-relevant rules live in code, not in a prompt.

7. **Fail honestly.** If the AI is unavailable, show an error. Never fall back to a canned or fabricated assessment that a user could mistake for a real read on their conversation.

8. **The analysis engine stays separable from the input flow.** How the conversation *arrives* — pasted, uploaded, or handed over directly by a host dating app — must be swappable without touching how it is *assessed*. The three-screen paste flow is one way in; it is not the product. This matters because the intended end state is integration into an existing dating app (§19c), where Screens 1 and 2 disappear entirely and the engine is fed directly. Building the engine as a dependency of the paste flow would mean rebuilding it to integrate.

### 11d. What the backend needs to do

Five capabilities. Whether these end up as five separate addresses or fewer is an implementation detail.

| Capability | Purpose |
|---|---|
| Serve the app | Deliver the screens to the browser |
| Analyze a conversation | The main event — takes profiles + conversation, returns the assessment |
| Parse a pasted profile | Turns a messy profile paste into structured fields for the Screen 1 confirmation step |
| Extract text from screenshots | Turns uploaded images into text (needed for the screenshot input path) |
| Provide demo scenarios | Supplies the pre-written examples for the "see an example" path |
| Record flag feedback | Accepts an anonymous accuracy rating on a timing flag (§7b) — the only thing the backend writes down |

### 11e. Non-functional requirements

| Requirement | Target |
|---|---|
| Analysis time | Under ~15 seconds, with visible progress feedback throughout |
| Mobile | **Must work on a phone.** Users are copying from a dating app on their phone — expecting them to move to a laptop breaks the core use case. This is a significant change from the current desktop three-panel layout. |
| Accessibility | Signal meaning must never rely on color alone — pair every color with a label or icon. Readable contrast in dark mode. |
| Cost per analysis | Known and monitored — each analysis costs real money per AI call. Worth understanding before any public launch. |
| Abuse protection | Some limit on how many analyses one visitor can run, so a single person can't drain the budget. |

---

## 12. What the App Holds While the User Is Using It

The app needs to keep track of a handful of things as the user moves through the three screens. This is the working set — all of it lives in the browser and disappears when the tab closes.

| Thing | Where it comes from | Notes |
|---|---|---|
| Their profile | Screen 1 (**required**) | Name, bio, prompts, stated goal, interests — user-confirmed |
| Your profile | Screen 1 (encouraged, skippable) | Same shape. If absent, Card ② runs in degraded mode and says so. |
| Their real name | Screen 1, confirmed by the user | **Used only in the browser, to anonymize. Never sent anywhere.** |
| The conversation | Screen 2 | A list of messages: who sent it, what it says, and when (if known) |
| Whether timestamps exist | Derived on Screen 2 | Determines whether timing signals can run at all |
| Consent given | Screen 2 checkbox | Must be true before analysis can start |
| Timing findings | Calculated in the browser | Rhythm mismatches and silence gaps |
| The AI's assessment | Returned from the backend | Signals, coaching prose, and the meeting decision |
| Data sufficiency state | Returned from the AI | Insufficient / thin / sufficient — drives which Screen 3 state renders |
| Flag feedback given | Screen 3 controls | Which flags the user rated, and how. Sent to the backend as anonymous calibration data — see §13.5. |

---

## 13. Privacy & Safety Requirements

These are product requirements, not legal boilerplate. The tool asks people to hand over a private two-party conversation, which is a genuinely large ask.

1. **Anonymize before sending.** The match's name is replaced in the browser, and the user can see the result before consenting.
2. **Show, don't just promise.** The anonymization preview is the mechanism that makes the privacy claim believable.
3. **Name the consent asymmetry.** The other person did not agree to have this conversation analyzed. Say that plainly and let the user make an informed choice.
4. **Consent is explicit and per-analysis.** An unticked checkbox every time — not a one-time setting.
5. **No conversation content is stored, and say so.** Stated on the landing screen, restated at the consent step. The one thing that *is* recorded — flag-accuracy feedback — is bounded as follows:

   | Recorded | Never recorded |
   |---|---|
   | Which flag type fired (rhythm mismatch / silence gap) | Any message text |
   | The numbers that triggered it (e.g. 46 min vs. 3 min; a 3-day gap) | Any name, yours or theirs |
   | Whether the user called it accurate | Any profile content |
   | A coarse timestamp | Anything linking the rating back to a person or conversation |

   The promise is not "we store nothing." It is **"we store nothing about your conversation"** — and the wording in the UI must say the true version, not the simpler one. Overpromising and then quietly storing something is worse than a slightly longer sentence.
6. **Feedback is optional and unobtrusive.** Rating a flag is never required to see results, and declining costs the user nothing.
7. **No verdicts about people.** The coach describes patterns in an interaction. It never rates a person, scores them, or tells the user what to do.
8. **Concern signals are worded to inform, not to alarm.** Especially where safety is implied — the goal is for the user to trust their own instincts, not to be frightened.

---

## 14. Design Requirements

| Area | Requirement |
|---|---|
| Voice | Warm, direct, never clinical. The coach speaks like a perceptive friend, not a report generator. |
| Signal color system | Green = authenticity · Red = concern · Yellow = multi-day silence · Gray = rhythm mismatch (observational). Always paired with a text label. |
| Card ② tone | The "how you're showing up" card is the easiest place to accidentally make someone feel judged. Copy here should be reviewed specifically for that. |
| Mobile-first | Design the phone layout first; the desktop layout is the adaptation, not the other way around. |
| Reading length | Three cards of prose is a lot on a phone. Consider what's visible before scrolling and what the user reads first. |
| Loading experience | Several seconds of waiting after pasting something personal. This moment deserves designed copy. |

---

## 15. Build Order

A suggested sequence. Each milestone leaves you with something you can actually look at and react to.

| # | Milestone | Why this order |
|---|---|---|
| 1 | **Screen flow shell** — three screens, forward and back navigation, step indicator, no real functionality | Makes the flow real enough to critique before any logic is attached |
| 2 | **Screen 2 end to end** — paste, parse, anonymize, consent, analyze, results | The required path. If only one thing works, it should be this one. |
| 3 | **Screen 3 states** — insufficient, thin, sufficient, error, loading | Where the product's honesty lives |
| 4 | **Screen 1** — profile paste, parse, confirmation | Adds the consistency layer — the product's core claim — on top of a working core |
| 5 | **Screenshot input for Screen 1** | Because Screen 1 is required and some apps block text selection, this is the only way through for a real share of users. It is a completion requirement, not an extra. |
| 6 | **Timing signals** | Depends on timestamps making it through parsing intact |
| 7 | **Flag feedback capture** | Must ship *with* the timing signals, not after — every beta session that runs without it is calibration data lost for good (§18) |
| 8 | **Demo path** | Needs Screen 3 finished to have somewhere to land |
| 9 | **Mobile layout pass** | Do this before it's "done," not after — and before beta, since most testers will be on a phone |
| 10 | **Screenshot input for Screen 2** | The lowest-value screenshot path — conversations are usually selectable text, so pasting already works |

---

## 16. Risks

| Risk | Why it matters | Mitigation |
|---|---|---|
| **Drop-off on Screen 1** | A required profile before the user has seen the tool do anything. Still the single largest risk in the flow, even with the user's own profile made optional (§8, rule 1). | Demo-first entry so value is seen before effort is spent; screenshot input so a non-selectable profile isn't a dead end; only one profile strictly required; a stated reason, not a bare form. **Measured directly in beta — see §18.** |
| Users won't paste a real conversation | The whole product depends on it. Privacy hesitancy is rational here. | Demo-first entry path; visible anonymization; privacy promise before the ask |
| Pasted conversations are messy | Every dating app copies differently. Parsing is the most likely failure point. | Forgiving parser, clear format guidance, a real parse-failure state |
| Most pastes won't have timestamps | Two of the signals silently do nothing | Explain the unlock on Screen 2; treat missing timestamps as a normal state, not an error |
| The 3× threshold is unvalidated | A wrong flag on something as loaded as "they're slow to reply" damages trust | Keep it gray and observational; never let it block anything; add feedback capture to calibrate |
| The AI is inconsistent between runs | Same conversation, different read, undermines credibility | Structured output, low variability settings, deterministic timing logic in code |
| Card ② lands as judgment | Being told how *you're* showing up is the most sensitive output in the product | Invitational language enforced in the prompt; dedicated copy review |
| Cost scales with use | Each analysis costs money | Rate limiting before any public link |

---

## 17. Open Questions

**Resolved**

- ~~Should users be able to rate whether a flag felt accurate?~~ **Yes — v1 requirement.** Bounded, anonymous calibration data only (§7b, §13.5).
- ~~Does the demo path survive into a public version?~~ **Yes — it is load-bearing.** With a profile required on Screen 1, the demo is the only way a user sees value before doing real work.

- ~~Is this strictly a pre-meeting tool?~~ **Yes, strictly — and deliberately.** Post-meeting is a categorically different product with different duties. See §19a.
- ~~Should the coach see patterns across matches over time?~~ **Not in v1. Recorded as a future direction** in §19b so it isn't lost.
- ~~Is there a version that works inside a dating app?~~ **That is the intended end state.** See §19c — it changes what v1 is *for*.

**Still open**

- What would a dating app partner actually need to see to take this seriously — the working prototype, the research, or evidence of user demand? *(Determines where effort goes after beta.)*

---

## 18. Beta Validation Plan

Two things in this PRD are explicitly unvalidated: **the 3× rhythm threshold** (§7b) and **whether requiring a profile costs more users than it earns** (§16). Beta exists to settle them. Everything below is scoped to those two questions plus the qualitative reads that only real users can give.

### 18a. Behaviour vs. opinion — which instrument answers which question

The single most important distinction in this plan:

> **Ask people about their *experience*. Measure their *behaviour*. Never ask people to predict what they would have done.**

Stated preference about friction is famously unreliable — people under-report how much a small obstacle stops them, and over-report willingness to do extra work for a tool they like. So:

| Question | Wrong instrument | Right instrument |
|---|---|---|
| Does requiring a profile cost users? | *"Would you have preferred to skip the profile step?"* | **Measure it.** What share of sessions that reach Screen 1 make it to Screen 3? What share skip the optional own-profile box? |
| Is the 3× threshold right? | *"Does 3× sound like the right cutoff?"* | **The in-product flag rating.** Accurate/not-accurate against the actual numbers that fired. |
| Is Card ② worth the extra profile? | *"Was your profile useful to provide?"* | **Compare.** Card ② reception among users who provided their own profile vs. those who skipped. |
| Did the flag feel valuable or naggy? | — | **Ask.** This one genuinely is an experience question. |

### 18b. What to measure in-product

| Measure | Answers |
|---|---|
| Screen 1 → Screen 3 completion rate | Whether the required profile is killing the funnel |
| Own-profile skip rate | Whether the encouraged-but-optional framing works, or whether almost everyone skips |
| Paste vs. screenshot split on Screen 1 | Whether screenshot input was worth building (§15, item 5) |
| Flag accuracy ratings, with trigger values | **Direct calibration data for the 3× threshold** |
| Rate of "not accurate" by flag type | Whether the problem is the threshold, the wording, or the whole signal |
| Demo-first vs. straight-to-input entry | Whether the demo actually reduces drop-off |

### 18c. What to ask beta testers directly

Grouped by what each group of questions is actually for.

**On the profile requirement — ask about the experience, not the hypothetical**
- Walk me through getting your match's profile into the app. Where did you get it from, and how did that go?
- *(If they skipped their own profile:)* What made you skip that one?
- *(If they provided it:)* The "how you're showing up" card is the part that uses your own profile. Was that card worth providing it for?

**On the timing flags — this is where your phrasing needs the most care**
- Tell me about the timing observation you saw. What did you make of it?
- Did it match what you'd already noticed yourself, or was it news?
- Did it feel like useful information or like the app nagging you?
- Was there a timing pattern you *had* noticed that the app missed?

> **A note on wording:** avoid *"Did you like this feature?"* — it's leading, and it invites politeness rather than accuracy. It also bundles two different questions (was it valuable / was it annoying) into one, so a single answer can't tell you which. Ask them separately, and ask what they *did* or *noticed*, not what they liked. That last question — what the app **missed** — is often the most valuable one in the set, and it's the one an in-product rating control can never capture.

**On the output overall**
- Which of the three cards did you read most carefully? Which did you skim?
- Was there anything the coach said that felt wrong about your match?
- How did the "how you're showing up" card land? *(Listen specifically for defensiveness — §16 flags this as the highest-risk output in the product.)*
- Did you do anything differently after reading it?

**On trust and privacy**
- How did you feel at the point where you were about to paste a real conversation?
- Did you notice the name being replaced? Did it matter to you?
- Was there anything you decided *not* to paste?

### 18d. Success criteria

Decide these before you run the beta, so the results can't be rationalised after the fact.

| Question | Signal to act on |
|---|---|
| Profile requirement | If Screen 1 → Screen 3 completion is poor, the requirement is too expensive — revisit before public launch |
| Own-profile framing | If nearly everyone skips it, either the value isn't communicated or it isn't there. Investigate which. |
| 3× threshold | A meaningful share of "not accurate" ratings means the number is wrong, not the feature. Recalibrate from the recorded trigger values. |
| Timing feature viability | If testers consistently describe it as nagging rather than informative, the problem is the feature, not the threshold |
| Card ② tone | Any defensive reaction is worth taking seriously — this card carries the most risk for the least essential value |

### 18e. Scope note

Beta is aimed at these two decisions. Resist expanding it into a general "what do you think of the app" study — a broad survey will produce a lot of pleasant, unusable feedback and won't settle either question. The two things you cannot learn any other way are the threshold calibration and the real cost of the profile requirement.

---

## 19. Future Direction

Not v1. Recorded here so the reasoning survives, and so the decisions that were made *against* these options can be revisited deliberately rather than by accident.

### 19a. Post-meeting coaching — deliberately excluded, and not just for scope reasons

The tool stops at the decision to meet. Extending past that point is not a bigger version of the same product; it is a different product with different obligations. Three reasons, in order of seriousness:

1. **Asking "how did it go?" invites disclosure the product cannot responsibly hold.** A pre-meeting coach reads text and comments on communication patterns — the worst case is being wrong about someone's texting style. A post-meeting coach is asking about a real encounter between two people, and some share of those answers will involve someone feeling unsafe, pressured, or harmed. **Once a product invites that disclosure, it owes the user a real response** — and an AI coach is not equipped to be the thing standing between a person and a disclosure of assault or coercion. The risk here is duty of care, not privacy.

2. **Storing post-date accounts of named people creates a de facto allegation record.** Even informally worded, a store of "how did your date with X go" is a database of claims about identifiable individuals — with all the accompanying exposure to false reports, retaliation, and legal liability. This is a materially different thing to operate than a tool that stores nothing.

3. **It breaks the product's central discipline.** §13 holds that the coach describes patterns in an interaction and never renders verdicts about people. Post-meeting assessment pulls hard toward exactly that.

> **If a dating-app partner raises this**, the honest answer is that post-meeting support belongs with trust-and-safety infrastructure — reporting flows, human review, escalation paths — not with a coaching feature. The pre-meeting scope is a considered boundary, and being able to explain *why* is a stronger position than having simply not gotten to it yet.

### 19b. Patterns across matches over time

**Documented as a future direction, not a v1 feature.**

The idea: rather than assessing one conversation in isolation, the coach observes patterns across the user's matches over time — recurring dynamics, how *they* tend to show up across different people, whether certain patterns repeat. This is a substantially more valuable product than single-conversation analysis, and it is the natural direction of the research.

**What it would require, honestly:**

| Requirement | Implication |
|---|---|
| Persistent conversation storage | Directly reverses §13's central promise. Not an amendment — a rewrite of the product's privacy position. |
| User accounts | The app currently has no concept of a returning user. |
| A much larger consent conversation | Storing one conversation to analyze is one ask. Retaining many, about several identifiable people, over months, is another entirely. |
| Real security obligations | Stored intimate conversations are a high-value breach target. This raises the operational bar substantially. |

**The strategic read:** this is far more plausible *inside* a dating app (§19c) than as a standalone tool. A host app already stores these conversations, already has accounts, and already carries the security obligation. The feature that is prohibitively heavy for a standalone product is comparatively natural as an integrated one — which is an argument for the integration path, not just a note about sequencing.

### 19c. Integration into a dating app — the intended end state

**This is the actual goal**, and it reframes what v1 is for. The standalone app is not the product being built toward; it is the demonstration that the analysis engine works and that the research holds. The destination is either a feature sold to an existing dating app, or a dating app built around this as its core differentiator.

**What changes when the coach lives inside a dating app:**

| Today (standalone) | Integrated |
|---|---|
| Screens 1 and 2 exist to get data in | **They disappear.** Profiles and messages are already there. |
| Screen 1 is the largest drop-off risk (§16) | The risk vanishes — nothing is being asked of the user |
| Name anonymization protects the match | Reconsidered — the host app already holds real names; the protection needed is different |
| Two-party consent is an unresolved tension (§13.3) | Handled at the platform level, in terms both users already accepted |
| Analysis runs once, on demand | Could run continuously, surfacing at the right moment rather than on request |
| Timing signals depend on pasted timestamps | Exact timestamps are already available — **the signals become fully reliable, and the 3× threshold gets real calibration data** |

**What this means for how v1 is built — three practical consequences:**

1. **Screen 3 is the product. Screens 1 and 2 are scaffolding.** They must work well enough for beta and for a portfolio walkthrough, but they are the part that gets deleted on integration. When effort has to be traded, it belongs in the quality of the analysis and the output, not in polishing the paste flow.

2. **Keep the engine separable** — formalized as architecture rule 8 (§11c). The input mechanism has to be swappable without touching the assessment logic, or integration means a rebuild.

3. **Beta results are the sales artifact.** §18's calibration data and completion metrics aren't just internal validation — for a partner conversation, evidence that real users found the signals accurate is worth considerably more than a working demo. That reframes beta from a build step into the thing that makes the pitch credible.

> **A caution worth holding:** the integrated version removes the friction *and* the user's active choice to seek a read on someone. A coach the user opens deliberately is a different experience from one that comments unprompted on a conversation in progress. That shift deserves its own design thinking — the honest version of this product is one the user invites, and that quality should survive integration rather than being optimized away.
