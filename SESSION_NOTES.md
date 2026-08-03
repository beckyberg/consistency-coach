# Consistency Coach — Session Notes

---

## Session: July 19–20, 2026
**Branch:** `feature/v1.1-v2.0`

### Feature Built: Timeliness & Response Pattern Detection

#### Timestamps + Day Dividers (Conversation Panel)
- Every demo scenario message given realistic ISO timestamps across multiple days
- Conversation panel now shows time on each bubble (e.g. `Becky · 9:14 AM`)
- Day dividers inserted between calendar dates (e.g. `Day 1 · Mon, Jun 2`)
- Import mode parses optional `[Jun 2, 9:45 AM] Name: message` timestamp prefix
- Composer messages auto-timestamped with current time

#### Signal 1 — Within-Day Response Rhythm Mismatch
- Unit of analysis: per calendar day (not overall average)
- Cross-sender gaps only — back-to-back same-sender messages ignored
- Gap filter: > 0 min and <= 480 min (8h ceiling — longer = offline, excluded)
- Threshold: one person 3x slower than the other on a given day
- Each flagged day reported independently with its own averages
- Output: "Mismatch detected in message timing. Response time: On Mon, Jun 23, you averaged about 46m to reply, compared to 3m from Jamie..."
- Routing: match slower → About Your Match / you slower → How You Are Showing Up / both → both cards
- Visual: neutral gray (signal-neutral) — intentionally muted, no alarm color
- Does NOT affect meeting suggestion logic
- Research status: single anecdotal data point — included in beta to test user value

#### Signal 2 — Multi-Day Silence Detection
- Threshold: >= 1440 min (24h) between consecutive cross-sender messages
- Attribution: sender of message after the gap went silent
- Output: "Silence gap detected: Jamie went quiet for Sun, Jun 23 to Thu, Jun 26 (3 days). Unsolicited multi-day silences are a pattern that can erode trust."
- Multiple silences listed as separate sentences in one flag
- Routing: match silent → About Your Match (red) / you silent → How You Are Showing Up (yellow)
- If match has silence gap: meeting suggestion fully suppressed, badge changes to "on hold", Where This Is Heading text overridden
- Research status: directly grounded in study findings — validated signal

#### Design Decisions
- Signal 1 does not suppress meeting suggestion — insufficient research weight
- Signal 1 neutral color — doesn't have data to carry red or yellow
- Per-day reporting replacing blended averages — blending was misleading
- Removed "on 1 day" language — caused confusion with Day 1 of conversation
- Removed "your research found that..." — replaced with "Unsolicited multi-day silences..."
- Signal 1 kept in beta deliberately — add feedback hooks, validate before promoting

#### Demo Conversations Built
1. Becky & Daniel — Signal 1 fires on Becky only (How You Are Showing Up)
2. Becky & Priya — Signal 1 fires on both users on different days
3. Becky & Noah — Signal 1 fires on both over 5 days, multiple dates
4. Becky & Liam — Signal 2 fires on both users (multi-day silences each)
5. Becky & Jamie — All four flags fire: Signal 1 + Signal 2 for both users

#### Outstanding / Next Session
- Built-in demo scenarios do not have timestamps yet — timeliness features won't show on those
- Beta feedback hooks (thumbs up/down on Signal 1) not yet built
- Signal 1 threshold (3x) is an educated guess — needs real user data to validate or adjust
- README not yet updated to reflect V2.0 features
- Deployment / public beta URL not yet set up

---

## Session: July 15, 2026
**Branch:** `feature/v1.1-v2.0`

### Import Mode (v1.1)
- Added Import tab alongside Demo Scenarios
- Match name anonymized to "Your Match" throughout — inline mentions also replaced
- Conversation parsed line by line: Name: message text format
- Disclosure box with consent checkbox before analysis — explains data handling and two-party consent
- Import uses direct OpenAI browser call — no server involved
- Profile cards switch to import placeholder state

### Prompt Architecture (v2.0)
- Rebuilt system prompt with two-layer architecture:
  - Layer 1: Dyadic Assessment — neutral, interaction as the unit of analysis
  - Layer 2: Coaching Output — user-facing, personalized to User A
- Data sufficiency check: Insufficient / Thin / Sufficient states
- Insufficient: returns early, no assessment attempted
- Thin: proceeds but opens each field with caveat, blocks meeting suggestion
- Sufficient: full output
- New output schema: dyadic_assessment + coaching_output + agent_action
- Meeting suggestion grounded in conversation content — no generic defaults
- Coaching voice guidelines per section

---

## Session: July 13, 2026
**Branch:** `feature/v1.1-v2.0` (opened this session)

### Initial V1 Build
- Express server + OpenAI proxy
- Three demo scenarios: High / Low / Moderate Consistency
- Three-panel layout: Profile A | Conversation | Profile B
- Agent analysis: consistency signals, readiness cues, meeting suggestion
- Dark mode UI
- Research signal framework reference card
- Direct browser OpenAI call — API key stored in localStorage
- Message composer: add messages + auto-re-analyze
