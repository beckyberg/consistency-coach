# Consistency Coach — Session Notes
**Date:** July 19–20, 2026
**Branch:** `feature/v1.1-v2.0`
**Repo:** https://github.com/beckyberg/consistency-coach

---

## What Was Accomplished

### 1. Timeliness Feature — Full Build

Added a new relational parameter to the Consistency Coach based on research finding that responsiveness affects trust between users. The feature has two distinct signals.

---

### Signal 1 — Within-Day Response Rhythm Mismatch

**What it does:**
Detects days where one person's average response time is 3× or more than the other's within a single calendar day.

**Parameters:**
- Unit of analysis: per calendar day (not a blended overall average)
- Only cross-sender gaps measured — back-to-back messages from same person ignored
- Gap filter: > 0 minutes and ≤ 480 minutes (8h ceiling — gaps longer than 8h treated as offline and excluded)
- Threshold: one person 3× slower than the other triggers a flag
- Each flagged day reported independently with its own averages — no blending across days

**Output example:**
> "Mismatch detected in message timing. Response time: On Mon, Jun 23, you averaged about 46m to reply, compared to 3m from Jamie. That's not necessarily a problem — but if the gap is unintentional, it's worth being aware of."

**Routing:**
- Match is slower → flag appears in **About Your Match**
- You are slower → flag appears in **How You Are Showing Up**
- Both (on different days) → both cards get a flag independently

**Visual treatment:** Neutral gray — intentionally muted, no alarm color

**Research status:** Single anecdotal data point in study data. Included in beta to test whether users find it meaningful. Does **not** affect meeting suggestion logic.

---

### Signal 2 — Multi-Day Silence Detection

**What it does:**
Detects gaps of 24+ hours between messages and attributes the silence to whoever stopped responding.

**Parameters:**
- Threshold: ≥ 1440 minutes (24 hours) between consecutive messages
- Attribution: the person who sent the message *before* the gap was waiting — the person who sent the message *after* the gap went silent
- Multiple silences within the same conversation listed as separate sentences

**Output example:**
> "Silence gap detected: Jamie went quiet for Sun, Jun 23 to Thu, Jun 26 (3 days). Unsolicited multi-day silences are a pattern that can erode trust."

**Routing:**
- Match went silent → **About Your Match** (red)
- You went silent → **How You Are Showing Up** (yellow)
- Both can fire independently

**Effect on meeting suggestion:**
- If the match has a silence gap → meeting suggestion fully suppressed
- Badge changes from `MEETING_SUGGESTION` to `on hold`
- Where This Is Heading text overridden to acknowledge the gap rather than push toward meeting
- If only you have a silence gap → meeting suggestion unaffected

**Research status:** Directly grounded in study findings — participants explicitly cited multi-day non-responsiveness as something that eroded trust. This is the validated signal.

---

### 2. Timestamps + Day Dividers (Conversation Panel)

- Every demo scenario message given realistic ISO timestamps across multiple days
- Conversation panel now shows time on each bubble (e.g. `Becky · 9:14 AM`)
- Day dividers inserted between calendar dates (e.g. `Day 1 · Mon, Jun 2`)
- Import mode updated to optionally parse timestamps using format: `[Jun 2, 9:45 AM] Name: message`
- Messages added via the composer are auto-timestamped with current time

---

### 3. Design Decisions Made

| Decision | Rationale |
|---|---|
| Signal 1 does not suppress meeting suggestion | Insufficient research weight |
| Signal 1 uses neutral gray color | Doesn't have data to carry red or yellow |
| Per-day reporting instead of blended averages | Blending multiple days into one number was misleading |
| Removed "on 1 day" language | Users confused it with Day 1 of the conversation |
| Removed "your research found that..." | Replaced with "Unsolicited multi-day silences..." — cleaner, less self-referential |
| Signal 1 kept in beta deliberately | Plan to add feedback hooks and validate before promoting |

---

### 4. Color Hierarchy Established

| Signal | Color | Weight |
|---|---|---|
| Authenticity signals ✓ | Green | Positive |
| AI concern flags | Red | Strong concern |
| Signal 2 — multi-day silence | Yellow | Research-backed concern |
| Signal 1 — rhythm mismatch | Neutral gray | Observational only |

---

### 5. Demo Conversations Built

Six import-ready test conversations created to validate specific timing patterns:

| Conversation | What it tests |
|---|---|
| Becky & Daniel | Signal 1 fires on Becky (How You Are Showing Up) |
| Becky & Priya | Signal 1 fires on both users on different days |
| Becky & Noah | Signal 1 fires on both over 5 days, multiple dates |
| Becky & Liam | Signal 2 fires on both users (multi-day silences each) |
| Becky & Jamie | All four flags fire — Signal 1 + Signal 2 for both users |

---

### 6. GitHub

- All changes committed to branch `feature/v1.1-v2.0`
- Successfully pushed to: https://github.com/beckyberg/consistency-coach/tree/feature/v1.1-v2.0
- Commit message: `feat: timeliness feature — Signal 1 (rhythm mismatch) + Signal 2 (multi-day silence)`
- `SESSION_NOTES.md` updated in repo with full session history across all three build sessions

**Next step when ready:** Open a Pull Request on GitHub from `feature/v1.1-v2.0` → `main` to make V2.0 the official version.

---

## Outstanding / Next Session

- [ ] Add timestamps to the three built-in demo scenarios (High / Low / Moderate) so timeliness features show when presenting those
- [ ] Add beta feedback hooks (thumbs up/down) directly on Signal 1 flags to measure user value
- [ ] Signal 1 threshold (3×) is an educated guess — needs real user data to validate or adjust
- [ ] Update README to reflect all V2.0 features
- [ ] Set up deployment / public beta URL
- [ ] Decide on Pull Request to merge `feature/v1.1-v2.0` into `main`

---

*Consistency Coach V2.0 — Becky Berg (2026)*
