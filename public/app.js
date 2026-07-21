/* ============================================================
   CONSISTENCY COACH — Frontend App Logic
   Portfolio Prototype — Becky Berg (2025)
   ============================================================ */

let currentScenario = null;
let currentProfiles = null;
let currentConversation = [];
let nameA = 'User A';
let nameB = 'User B';

// ---- INIT ----
let savedApiKey = localStorage.getItem('cc_openai_key') || '';

document.addEventListener('DOMContentLoaded', async () => {
  await loadScenarios();
  document.getElementById('analyze-btn').addEventListener('click', runAnalysis);
  document.getElementById('send-btn').addEventListener('click', sendMessage);
  document.getElementById('message-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') sendMessage();
  });

  // API key bar
  const keyInput = document.getElementById('api-key-input');
  const saveBtn  = document.getElementById('save-key-btn');
  const keyStatus = document.getElementById('key-status');

  if (savedApiKey) {
    keyInput.value = savedApiKey;
    keyStatus.textContent = '✅ Key loaded';
    keyStatus.className = 'key-status key-ok';
  }

  saveBtn.addEventListener('click', () => {
    savedApiKey = keyInput.value.trim();
    localStorage.setItem('cc_openai_key', savedApiKey);
    keyStatus.textContent = savedApiKey ? '✅ Key saved' : '⚠️ No key entered';
    keyStatus.className = savedApiKey ? 'key-status key-ok' : 'key-status key-warn';
  });
});

// ---- LOAD SCENARIOS ----
async function loadScenarios() {
  // Hardcoded so buttons always appear regardless of fetch/proxy issues
  const scenarios = [
    { key: 'high_consistency',     label: 'High Consistency — Readiness Building',    description: 'Both users show strong profile-to-conversation alignment and early readiness signals' },
    { key: 'low_consistency',      label: 'Low Consistency — Concern Signals',         description: "User B's conversation shows misalignment signals compared to their profile" },
    { key: 'moderate_consistency', label: 'Moderate Consistency — Potential Building', description: 'Genuine connection emerging but one user is still holding back' }
  ];
  const container = document.getElementById('scenario-buttons');
  container.innerHTML = '';
  scenarios.forEach(s => {
    const btn = document.createElement('button');
    btn.className = 'scenario-btn';
    btn.dataset.key = s.key;
    btn.innerHTML = '<span class="s-label">' + s.label + '</span><span class="s-desc">' + s.description + '</span>';
    btn.addEventListener('click', () => loadScenario(s.key, btn));
    container.appendChild(btn);
  });
}

// ---- EMBEDDED SCENARIO DATA (no fetch dependency) ----
const SCENARIOS = {
  high_consistency: {
    label: "High Consistency — Readiness Building",
    description: "Both users show strong profile-to-conversation alignment and early readiness signals",
    profileA: {
      name: "Jordan", bio: "Grad student in environmental science. I spend weekends hiking or at the farmer's market. Looking for someone genuine to explore the city with.",
      prompt1: { question: "The most important thing I'm looking for", answer: "Someone who actually means what they say. I've been on enough dates to know the difference between someone performing and someone being real." },
      prompt2: { question: "A typical Saturday looks like", answer: "Morning run, then the farmer's market on 5th. I always end up buying too many heirloom tomatoes. Afternoons are for reading or a long hike if the weather cooperates." },
      goal: "Long-term relationship", interests: "Hiking, cooking, environmental advocacy, reading"
    },
    profileB: {
      name: "Sam", bio: "I teach middle school science and I love it more than I expected to. Weekends I'm usually outdoors or trying a new recipe. Genuine connection > small talk.",
      prompt1: { question: "I want someone who", answer: "Has actual opinions and isn't afraid to share them. The best conversations I've had start with a disagreement." },
      prompt2: { question: "My love language is", answer: "Quality time — but the unplanned kind. Not a fancy dinner reservation, more like ending up at a bookstore for two hours." },
      goal: "Long-term relationship", interests: "Teaching, science, outdoor cooking, bookstores, hiking"
    },
    // Day 1: fast, balanced back-and-forth (7–9 min avg each)
    // Day 2: morning continuation, mutual readiness emerges
    conversation: [
      { sender: "Jordan", text: "Ok your farmer's market comment made me laugh — I also always over-buy. Last week it was four bunches of basil. What am I doing with four bunches of basil?", timestamp: "2025-06-02T09:14:00" },
      { sender: "Sam",    text: "Ha! Pesto. The answer is always pesto. Also basil ice cream is surprisingly good if you're feeling ambitious.", timestamp: "2025-06-02T09:22:00" },
      { sender: "Jordan", text: "That's either genius or a crime and I genuinely can't tell which. Do you actually cook or is this theoretical kitchen knowledge?", timestamp: "2025-06-02T09:25:00" },
      { sender: "Sam",    text: "Fully functional kitchen, I promise. Though I have had a few disasters. Made a soup so spicy last month my roommate genuinely cried. What about you — is the cooking real or farmer's market aesthetic?", timestamp: "2025-06-02T09:33:00" },
      { sender: "Jordan", text: "Real, definitely real. I grew up cooking with my dad, so it's kind of a thing for me. We used to do Sunday dinners every week. I miss that honestly.", timestamp: "2025-06-03T08:03:00" },
      { sender: "Sam",    text: "That's really nice — Sunday dinners are underrated. My family did Taco Tuesdays which sounds less romantic but honestly still one of my favorite memories.", timestamp: "2025-06-03T08:10:00" },
      { sender: "Jordan", text: "There's something about a recurring ritual, right? Ok this might be forward but — have you been to the farmers market on Clement Street? I was thinking about going this Sunday and it seemed like maybe a low-key good first thing to do together.", timestamp: "2025-06-03T08:14:00" },
      { sender: "Sam",    text: "I haven't but I've been meaning to go! Sunday works. I like that it's low-pressure — we can see if the basil conversation translates to real life.", timestamp: "2025-06-03T08:22:00" }
    ]
  },
  low_consistency: {
    label: "Low Consistency — Concern Signals",
    description: "User B's conversation behavior shows several misalignment signals compared to their profile",
    profileA: {
      name: "Alex", bio: "Writer and weekend rock climber. I value honesty and deep conversations. Not here for small talk.",
      prompt1: { question: "The most important thing I'm looking for", answer: "Real conversation. Someone who asks follow-up questions and actually listens to the answers." },
      prompt2: { question: "I'll know it's the right person if", answer: "We can sit in comfortable silence AND talk for four hours. Both." },
      goal: "Long-term relationship", interests: "Writing, rock climbing, philosophy, independent film"
    },
    profileB: {
      name: "Riley", bio: "Outdoor enthusiast, dog dad, looking for something real. I work in finance but don't let that fool you — I spend more time outside than inside.",
      prompt1: { question: "I'm known for", answer: "Being the person who actually shows up. Loyalty is everything to me. I'd rather have three real friends than thirty acquaintances." },
      prompt2: { question: "The way to my heart is", answer: "Be genuine. I can spot fake from a mile away and it's the fastest way to lose my interest." },
      goal: "Long-term relationship", interests: "Hiking, dogs, climbing, travel"
    },
    // Both on Day 1 — Alex responds almost instantly, Riley takes 40–45 min each time
    // Discrepancy: Alex avg ~2m, Riley avg ~43m — notable pattern
    conversation: [
      { sender: "Alex",  text: "Hey! Your profile mentioned rock climbing — do you boulder or do more trad/sport routes?", timestamp: "2025-06-05T19:30:00" },
      { sender: "Riley", text: "Hey! Yeah I love climbing. It's so fun right?", timestamp: "2025-06-05T20:14:00" },
      { sender: "Alex",  text: "Ha yeah — I mostly boulder but I've been wanting to try outdoor sport climbing. Have you done any routes around here?", timestamp: "2025-06-05T20:16:00" },
      { sender: "Riley", text: "Yeah totally, there are some great spots. You seem really cool by the way.", timestamp: "2025-06-05T21:00:00" },
      { sender: "Alex",  text: "Thanks! What made you get into climbing originally? I got into it through a friend and kind of got obsessed.", timestamp: "2025-06-05T21:02:00" },
      { sender: "Riley", text: "Oh you know how it is, just tried it one day and loved it. You're really pretty in your photos by the way.", timestamp: "2025-06-05T21:46:00" },
      { sender: "Alex",  text: "...thanks. So do you have any other big interests outside of climbing? Your profile mentioned you have a dog?", timestamp: "2025-06-05T21:48:00" },
      { sender: "Riley", text: "Yeah I love my dog! He's so great. Hey do you want to meet up sometime? I feel like we have great chemistry.", timestamp: "2025-06-05T22:32:00" }
    ]
  },
  moderate_consistency: {
    label: "Moderate Consistency — Potential Building",
    description: "Genuine connection emerging but one user is still holding back — consistency building over time",
    profileA: {
      name: "Taylor", bio: "Nurse practitioner. I work hard and I play hard. Love live music, good food, and honest people. A little guarded at first but worth the patience.",
      prompt1: { question: "A non-negotiable for me is", answer: "Emotional honesty. I deal with enough performance at work — I don't want it in my personal life too." },
      prompt2: { question: "My ideal Sunday", answer: "Farmers market, live jazz somewhere, maybe a long walk. Nothing scheduled, everything meandering." },
      goal: "Open to either casual or serious", interests: "Live music, nursing, cooking, hiking, jazz"
    },
    profileB: {
      name: "Morgan", bio: "Software engineer by day, amateur chef by night. I'm probably too passionate about coffee. Looking for someone to have real conversations with.",
      prompt1: { question: "I get too excited about", answer: "Coffee origins. I know it's a lot. I went to Ethiopia last year specifically to visit coffee farms and I have zero regrets." },
      prompt2: { question: "The best type of date is", answer: "Something we both didn't plan on. Walk that turns into dinner that turns into a long conversation neither of us expected." },
      goal: "Long-term relationship", interests: "Cooking, coffee, software, travel, hiking"
    },
    // Day 1: Morgan fast, Taylor slow (shift at work — 74m avg)
    // Day 2: Taylor opens up, both much faster (Taylor 7m, Morgan 8m)
    conversation: [
      { sender: "Morgan", text: "Ethiopia for coffee farms — yes. That's dedication I respect. Are you also a coffee person or is that going to be a dealbreaker?", timestamp: "2025-06-08T14:15:00" },
      { sender: "Taylor", text: "Haha I'm a nurse so I'm basically an IV drip of caffeine walking around. I appreciate good coffee but I'm not as serious about it as you clearly are.", timestamp: "2025-06-08T15:29:00" },
      { sender: "Morgan", text: "Fair. I promise I won't quiz you on origin notes. What's your usual order?", timestamp: "2025-06-08T15:34:00" },
      { sender: "Taylor", text: "Whatever keeps me awake during a 12-hour shift honestly. But outside of work — a good pour over. Something simple.", timestamp: "2025-06-08T16:50:00" },
      { sender: "Morgan", text: "That's actually perfect. Simple pour over taste = good taste. Do you work nights or days?", timestamp: "2025-06-08T16:56:00" },
      { sender: "Taylor", text: "Rotating shifts currently. It's a lot but I love the actual work.", timestamp: "2025-06-09T09:20:00" },
      { sender: "Morgan", text: "That takes a certain kind of person. I've always had a lot of respect for nurses — especially the honesty it probably requires to do that job every day.", timestamp: "2025-06-09T09:28:00" },
      { sender: "Taylor", text: "Yeah. It does make you less tolerant of pretense in other parts of your life. Anyway — your profile mentioned you were into live music?", timestamp: "2025-06-09T09:35:00" }
    ]
  }
};

// ---- LOAD SCENARIO ----
async function loadScenario(key, btn) {
  document.querySelectorAll('.scenario-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const scenario = SCENARIOS[key];
  if (!scenario) { console.error('Unknown scenario:', key); return; }

  currentScenario = key;
  currentProfiles = { a: scenario.profileA, b: scenario.profileB };
  currentConversation = [...scenario.conversation];
  nameA = scenario.profileA.name;
  nameB = scenario.profileB.name;

  renderProfile('A', scenario.profileA);
  renderProfile('B', scenario.profileB);
  renderConversation(scenario.conversation, scenario.profileA.name, scenario.profileB.name);

  document.getElementById('chat-subtitle').textContent = scenario.description;
  document.getElementById('analyze-btn').disabled = false;
  document.getElementById('message-composer').style.display = 'flex';

  resetAnalysisPanel();
  setStatus('', '');
}

// ---- RENDER PROFILE ----
function renderProfile(side, profile) {
  const s = side;
  document.getElementById(`name${s}`).textContent = profile.name;
  document.getElementById(`bio${s}`).textContent = `"${profile.bio}"`;
  document.getElementById(`p1q${s}`).textContent = profile.prompt1.question;
  document.getElementById(`p1a${s}`).textContent = `"${profile.prompt1.answer}"`;
  document.getElementById(`p2q${s}`).textContent = profile.prompt2.question;
  document.getElementById(`p2a${s}`).textContent = `"${profile.prompt2.answer}"`;
  document.getElementById(`goal${s}`).textContent = `🎯 ${profile.goal}`;
  document.getElementById(`interests${s}`).textContent = `✨ ${profile.interests}`;
}

// ---- RENDER CONVERSATION ----
function renderConversation(messages, nA, nB) {
  const win = document.getElementById('chat-window');
  win.innerHTML = '';

  const groups = groupMessagesByDay(messages);

  if (!groups) {
    // No timestamps — render plain bubbles as before
    messages.forEach(m => appendBubble(win, m, nA, nB, false));
  } else {
    const allDates = groups.map(g => g.date).filter(Boolean);
    groups.forEach(group => {
      if (group.date) {
        const dayNum = allDates.indexOf(group.date) + 1;
        win.appendChild(createDayDivider(dayNum, group.date));
      }
      group.messages.forEach(m => appendBubble(win, m, nA, nB, false));
    });
  }

  win.scrollTop = win.scrollHeight;
}

function appendBubble(win, msg, nA, nB, isNew) {
  const isA = msg.sender === nA || msg.sender === 'A';
  const senderName = msg.sender === 'A' ? nA : msg.sender === 'B' ? nB : msg.sender;
  const timeStr = formatBubbleTime(msg.timestamp);
  const wrap = document.createElement('div');
  wrap.className = `bubble-wrap ${isA ? 'from-a' : 'from-b'}${isNew ? ' bubble-new' : ''}`;
  wrap.innerHTML = `
    <span class="bubble-sender">${escapeHTML(senderName)}${
      timeStr ? `<span class="bubble-time">${timeStr}</span>` : ''
    }</span>
    <div class="bubble">${escapeHTML(msg.text)}</div>
  `;
  win.appendChild(wrap);
}

// ---- SEND MESSAGE ----
function sendMessage() {
  const input = document.getElementById('message-input');
  const senderSel = document.getElementById('sender-select').value;
  const text = input.value.trim();
  if (!text || !currentProfiles) return;

  const senderName = senderSel === 'A' ? nameA : nameB;
  const newMsg = { sender: senderName, text, timestamp: new Date().toISOString() };
  currentConversation.push(newMsg);

  const win = document.getElementById('chat-window');
  // Check if we need a new day divider
  const prevMsgsWithDates = currentConversation.slice(0, -1).filter(m => m.timestamp);
  if (prevMsgsWithDates.length > 0) {
    const lastDate = prevMsgsWithDates[prevMsgsWithDates.length - 1].timestamp.split('T')[0];
    const todayDate = newMsg.timestamp.split('T')[0];
    if (todayDate !== lastDate) {
      // New day — insert a divider
      const allDates = [...new Set(currentConversation.map(m => m.timestamp ? m.timestamp.split('T')[0] : null).filter(Boolean))];
      const dayNum = allDates.length;
      win.appendChild(createDayDivider(dayNum, todayDate));
    }
  }
  appendBubble(win, newMsg, nameA, nameB, true);
  win.scrollTop = win.scrollHeight;
  input.value = '';

  // Auto-run analysis
  runAnalysis();
}

// ---- RUN ANALYSIS ----
async function runAnalysis() {
  if (!currentProfiles) return;

  const apiKey = savedApiKey || localStorage.getItem('cc_openai_key') || '';
  if (!apiKey) {
    setStatus('Enter your OpenAI API key above first', 'error');
    document.getElementById('api-key-input').focus();
    return;
  }

  setStatus('Analyzing...', 'loading');
  document.getElementById('analyze-btn').disabled = true;

  try {
    const result = await analyzeWithOpenAI(apiKey, currentProfiles.a, currentProfiles.b, currentConversation);
    renderAnalysis(result);
    setStatus('Analysis complete ✓', 'success');
  } catch (err) {
    setStatus('Error: ' + err.message, 'error');
    console.error(err);
  } finally {
    document.getElementById('analyze-btn').disabled = false;
  }
}

// ---- RENDER ANALYSIS ----
function renderAnalysis(result) {
  const existingWarning = document.querySelector('.mock-warning');
  if (existingWarning) existingWarning.remove();

  // INSUFFICIENT DATA
  if (result.insufficient_data) {
    renderInsufficientData(result.message);
    return;
  }

  const da  = result.dyadic_assessment;
  const co  = result.coaching_output;
  const aa  = result.agent_action;
  // Client-side thin-data override — if the conversation is short,
  // force the caveat regardless of what the agent returned.
  // Threshold: fewer than 10 total messages = thin data.
  const msgCount = currentConversation ? currentConversation.length : 0;
  const thin = result.data_sufficient === false || msgCount < 10;

  // Suppress meeting suggestion if multi-day silence from the match is detected —
  // trust signal hasn't been established, so a meeting nudge is premature.
  const silenceCheck = computeSilenceGapInsight(currentConversation, nameA, nameB);
  const suppressMeeting = silenceCheck.forMatch != null;

  if (da && co) renderCoaching(da, co, thin, suppressMeeting);
  if (aa) renderAction(aa, thin, suppressMeeting);
}

// ---- INSUFFICIENT DATA STATE ----
function renderInsufficientData(msg) {
  // Coaching cards
  ['match-card', 'you-card', 'heading-card'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.opacity = '0.4';
  });
  const insufficientEl = document.getElementById('insufficient-notice');
  if (insufficientEl) {
    insufficientEl.style.display = 'block';
    insufficientEl.textContent = msg || "There isn't enough conversation here yet for a meaningful read. Keep going — I'll have more to say once the conversation develops.";
  }
  // Reset action card
  document.getElementById('agent-message-box').style.display = 'none';
  document.getElementById('meeting-suggestion-box').style.display = 'none';
}

// ---- MAIN COACHING RENDER ----
function renderCoaching(da, co, thin, suppressMeeting = false) {
  // Show cards at full opacity
  ['match-card', 'you-card', 'heading-card'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.opacity = '1';
  });
  // Hide insufficient notice
  const insufficientEl = document.getElementById('insufficient-notice');
  if (insufficientEl) insufficientEl.style.display = 'none';

  // ABOUT YOUR MATCH
  const matchText = document.getElementById('match-coaching-text');
  if (matchText) matchText.textContent = co.about_your_match || '';

  // Match signals (from dyadic)
  // Compute timing insights once — used by both match and your signals blocks
  const gapInsight     = computeResponseGapInsight(currentConversation, nameA, nameB);
  const silenceInsight = computeSilenceGapInsight(currentConversation, nameA, nameB);

  const matchSigs = document.getElementById('match-signals');
  if (matchSigs) {
    matchSigs.innerHTML = '';
    (da.match_consistency?.signals || []).forEach(s => {
      const item = document.createElement('div');
      item.className = 'signal-item signal-green';
      item.innerHTML = `<span>✓</span><span>${escapeHTML(s)}</span>`;
      matchSigs.appendChild(item);
    });
    (da.match_consistency?.flags || []).forEach(f => {
      if (!f) return;
      const item = document.createElement('div');
      item.className = 'signal-item signal-red';
      item.innerHTML = `<span>!</span><span>${escapeHTML(f)}</span>`;
      matchSigs.appendChild(item);
    });

    // Signal 1 — response rhythm gap (match)
    if (gapInsight.forMatch) {
      const item = document.createElement('div');
      item.className = 'signal-item signal-neutral';
      item.innerHTML = `<span>⏱</span><span>${escapeHTML(gapInsight.forMatch)}</span>`;
      matchSigs.appendChild(item);
    }
    // Signal 2 — multi-day silence (match)
    if (silenceInsight.forMatch) {
      const item = document.createElement('div');
      item.className = 'signal-item signal-red';
      item.innerHTML = `<span>⏱</span><span>${escapeHTML(silenceInsight.forMatch)}</span>`;
      matchSigs.appendChild(item);
    }
  }

  // HOW YOU ARE SHOWING UP
  const youText = document.getElementById('you-coaching-text');
  if (youText) youText.textContent = co.about_you || '';

  // Your signals (from dyadic)
  const yourSigs = document.getElementById('your-signals');
  if (yourSigs) {
    yourSigs.innerHTML = '';
    (da.your_consistency?.signals || []).forEach(s => {
      const item = document.createElement('div');
      item.className = 'signal-item signal-green';
      item.innerHTML = `<span>✓</span><span>${escapeHTML(s)}</span>`;
      yourSigs.appendChild(item);
    });
    (da.your_consistency?.flags || []).forEach(f => {
      if (!f) return;
      const item = document.createElement('div');
      item.className = 'signal-item signal-yellow';
      item.innerHTML = `<span>→</span><span>${escapeHTML(f)}</span>`;
      yourSigs.appendChild(item);
    });

    // Signal 1 — response rhythm gap (you)
    if (gapInsight.forYou) {
      const item = document.createElement('div');
      item.className = 'signal-item signal-neutral';
      item.innerHTML = `<span>⏱</span><span>${escapeHTML(gapInsight.forYou)}</span>`;
      yourSigs.appendChild(item);
    }
    // Signal 2 — multi-day silence (you)
    if (silenceInsight.forYou) {
      const item = document.createElement('div');
      item.className = 'signal-item signal-yellow';
      item.innerHTML = `<span>⏱</span><span>${escapeHTML(silenceInsight.forYou)}</span>`;
      yourSigs.appendChild(item);
    }
  }


  // WHERE THIS IS HEADING
  const headingText = document.getElementById('heading-coaching-text');
  if (suppressMeeting) {
    // Silence gap detected from match — override AI's meeting-oriented text
      if (headingText) headingText.textContent = 'There are gaps in response patterns that are worth paying attention to before moving toward a meeting. The conversation has positive signals, but unsolicited multi-day silences can affect the trust needed to take things offline comfortably. See the timing notes in the signals above.';
  } else {
    if (headingText) headingText.textContent = co.where_this_is_heading || '';
  }
}

function renderAction(aa, thin = false, suppressMeeting = false) {
  const msgBox   = document.getElementById('agent-message-box');
  const msgEl    = document.getElementById('agent-message');
  const meetingBox = document.getElementById('meeting-suggestion-box');

  // Show agent message box only when the agent has something meaningful to say
  const hasMessage = aa.should_act && aa.message_to_user && aa.message_to_user.trim();
  if (hasMessage) {
    msgBox.style.display = 'block';
    msgBox.className = 'agent-message-box agent-message-active';
    msgEl.textContent = aa.message_to_user;
    msgEl.style.fontStyle = 'normal';
  } else {
    msgBox.style.display = 'none';
  }

  // Show meeting suggestion only when data is sufficient and no silence suppression
  const thinNotice = document.getElementById('thin-data-notice');
  if (!thin && !suppressMeeting && aa.meeting_suggestion && aa.meeting_suggestion.active) {
    meetingBox.style.display = 'block';
    document.getElementById('meeting-format').textContent = aa.meeting_suggestion.suggested_format || '';
    document.getElementById('safety-reminder').textContent = aa.meeting_suggestion.safety_reminder || '';
    if (thinNotice) thinNotice.style.display = 'none';
  } else {
    meetingBox.style.display = 'none';
    // Show thin notice in this space when data is thin and no meeting suggestion
    if (thinNotice) thinNotice.style.display = thin ? 'block' : 'none';
  }
}

// ---- RESET ----
function resetAnalysisPanel() {
  // Coaching cards
  ['match-card', 'you-card', 'heading-card'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.opacity = '1';
  });
  const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  const setHTML = (id, val) => { const el = document.getElementById(id); if (el) el.innerHTML = val; };

  setText('match-coaching-text', 'Run the agent to see analysis');
  setHTML('match-signals', '');
  setText('you-coaching-text', 'Run the agent to see analysis');
  setHTML('your-signals', '');
  setText('heading-coaching-text', 'Run the agent to see analysis');

  const insuf = document.getElementById('insufficient-notice');
  if (insuf) insuf.style.display = 'none';
  const thinEl = document.getElementById('thin-data-notice');
  if (thinEl) thinEl.style.display = 'none';

  document.getElementById('agent-message-box').style.display = 'none';
  document.getElementById('agent-message').textContent = 'The agent will surface a message here when it detects the right moment.';
  document.getElementById('agent-message').style.fontStyle = 'italic';
  document.getElementById('meeting-suggestion-box').style.display = 'none';
  const warning = document.querySelector('.mock-warning');
  if (warning) warning.remove();
}

// ============================================================
// TIMESTAMP & DAY DIVIDER HELPERS
// ============================================================

// Format time for bubble label: "9:14 AM"
function formatBubbleTime(isoTimestamp) {
  if (!isoTimestamp) return '';
  try {
    return new Date(isoTimestamp).toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit', hour12: true
    });
  } catch(e) { return ''; }
}

// Format date for day divider header: "Mon, Jun 2"
function formatDayHeader(isoDate) {
  try {
    return new Date(isoDate + 'T12:00:00').toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric'
    });
  } catch(e) { return isoDate; }
}

// Human-readable minutes: "7m", "1h 14m", "2h"
function formatMinutes(mins) {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60), m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// Group message array by calendar date. Returns null if no timestamps present.
function groupMessagesByDay(messages) {
  const hasDateTS = messages.some(m => m.timestamp && /^\d{4}-\d{2}-\d{2}/.test(m.timestamp));
  if (!hasDateTS) return null;

  const grouped = {}, order = [];
  messages.forEach(msg => {
    const date = msg.timestamp ? msg.timestamp.split('T')[0] : '__nodate__';
    if (!grouped[date]) { grouped[date] = []; order.push(date); }
    grouped[date].push(msg);
  });
  return order.map(date => ({
    date: date === '__nodate__' ? null : date,
    messages: grouped[date]
  }));
}

// Build the Day N divider DOM element — label only, no stats
function createDayDivider(dayNum, isoDate) {
  const el = document.createElement('div');
  el.className = 'day-divider';
  const dateLabel = formatDayHeader(isoDate);
  el.innerHTML = `
    <div class="day-divider-row">
      <div class="day-divider-line"></div>
      <span class="day-divider-label">Day ${dayNum} &middot; ${dateLabel}</span>
      <div class="day-divider-line"></div>
    </div>
  `;
  return el;
}

// Compute response-gap insights per calendar day, then summarise across all days.
// Returns { forMatch: string|null, forYou: string|null }
// Each flag fires independently — both can be true if each person was slow on different days.
function computeResponseGapInsight(messages, nA, nB) {
  const avg = arr => arr.length
    ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null;

  // Group messages by calendar date
  const dayMap = {};
  messages.forEach(m => {
    if (!m.timestamp) return;
    const d = m.timestamp.split('T')[0];
    if (!dayMap[d]) dayMap[d] = [];
    dayMap[d].push(m);
  });

  const days = Object.values(dayMap);
  if (days.length === 0) return { forMatch: null, forYou: null };

  // Per-day averages — collect days where each person was notably slower
  const daysMatchSlow = []; // days where B avg >= 3x A avg
  const daysYouSlow   = []; // days where A avg >= 3x B avg

  days.forEach(dayMsgs => {
    const tA = [], tB = [];
    for (let i = 1; i < dayMsgs.length; i++) {
      const cur = dayMsgs[i], prev = dayMsgs[i - 1];
      if (!cur.timestamp || !prev.timestamp) continue;
      if (cur.sender === prev.sender) continue;
      const diff = Math.round((new Date(cur.timestamp) - new Date(prev.timestamp)) / 60000);
      if (diff <= 0 || diff > 480) continue;
      const isA = cur.sender === nA || cur.sender === 'A';
      if (isA) tA.push(diff); else tB.push(diff);
    }
    if (tA.length === 0 || tB.length === 0) return;
    const aAvg = avg(tA), bAvg = avg(tB);
    const ratio = Math.max(aAvg, bAvg) / Math.min(aAvg, bAvg);
    if (ratio < 3) return;
    if (bAvg > aAvg) daysMatchSlow.push({ aAvg, bAvg, date: dayMsgs[0].timestamp.split('T')[0] });
    else             daysYouSlow.push({ aAvg, bAvg, date: dayMsgs[0].timestamp.split('T')[0] });
  });

  // Format an ISO date as "Mon, Jun 16"
  const fmtDate = iso => new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  // Summarise into coaching text — each flagged day as its own sentence, old framing preserved
  const summariseMatch = () => {
    const dayLines = daysMatchSlow.map(d =>
      `On ${fmtDate(d.date)}, ${nB} averaged about ${formatMinutes(d.bAvg)} to reply, compared to ${formatMinutes(d.aAvg)} from you.`
    ).join(' ');
    return `Mismatch detected in message timing. Response time: ${dayLines} Response pace can reflect a lot of things — busyness, communication style, or level of investment. Worth noticing if the pattern holds.`;
  };

  const summariseYou = () => {
    const dayLines = daysYouSlow.map(d =>
      `On ${fmtDate(d.date)}, you averaged about ${formatMinutes(d.aAvg)} to reply, compared to ${formatMinutes(d.bAvg)} from ${nB}.`
    ).join(' ');
    return `Mismatch detected in message timing. Response time: ${dayLines} That's not necessarily a problem — but if the gap is unintentional, it's worth being aware of.`;
  };

  return {
    forMatch: daysMatchSlow.length > 0 ? summariseMatch() : null,
    forYou:   daysYouSlow.length   > 0 ? summariseYou()   : null
  };
}
// Signal 2 — Multi-day silence detection (research-backed)
// Scans all consecutive message pairs for gaps >= 24 hours.
// Attributes each silence to whoever stopped responding.
// Returns { forMatch: string|null, forYou: string|null }
function computeSilenceGapInsight(messages, nA, nB) {
  const fmtDate = iso => new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const fmtDays = mins => {
    const d = Math.floor(mins / 1440);
    return d === 1 ? '1 day' : `${d} days`;
  };

  const matchSilences = []; // gaps where nB went quiet (nA sent last before gap)
  const youSilences   = []; // gaps where nA went quiet (nB sent last before gap)

  for (let i = 1; i < messages.length; i++) {
    const cur  = messages[i];
    const prev = messages[i - 1];
    if (!cur.timestamp || !prev.timestamp) continue;
    const diffMins = Math.round((new Date(cur.timestamp) - new Date(prev.timestamp)) / 60000);
    if (diffMins < 1440) continue; // under 24h — not a silence gap

    // The person who sent prev was waiting — the person who sent cur went silent
    const curIsA = cur.sender === nA || cur.sender === 'A';
    const entry = {
      from: fmtDate(prev.timestamp.split('T')[0]),
      to:   fmtDate(cur.timestamp.split('T')[0]),
      duration: fmtDays(diffMins)
    };
    // cur broke the silence — meaning the OTHER person went quiet
    if (curIsA) matchSilences.push(entry); // match (B) went quiet, A came back
    else        youSilences.push(entry);   // you (A) went quiet, B came back
  }

  const buildMatchText = () => {
    const lines = matchSilences.map(s =>
      `${s.from} to ${s.to} (${s.duration})`
    ).join('; ');
    const plural = matchSilences.length > 1 ? 'gaps' : 'gap';
    return `Silence ${plural} detected: ${nB} went ${matchSilences.length > 1 ? matchSilences.length + ' times' : ''} quiet for ${lines}. Unsolicited multi-day silences are a pattern that can erode trust.`;
  };

  const buildYouText = () => {
    const lines = youSilences.map(s =>
      `${s.from} to ${s.to} (${s.duration})`
    ).join('; ');
    const plural = youSilences.length > 1 ? 'gaps' : 'gap';
    return `Silence ${plural} detected: you went quiet for ${lines}. Unsolicited multi-day silences can affect how a match experiences the connection.`;
  };

  return {
    forMatch: matchSilences.length > 0 ? buildMatchText() : null,
    forYou:   youSilences.length   > 0 ? buildYouText()   : null
  };
}


// ---- HELPERS ----
function setStatus(msg, type) {
  const el = document.getElementById('analyze-status');
  el.textContent = msg;
  el.className = `status-text ${type}`;
}

function escapeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}


/* ============================================================
   IMPORT MODE — v1.1
   Combined Option B + C: anonymize match name + disclosure
   ============================================================ */

let currentMode = 'demo'; // 'demo' | 'import'
let importedConversation = []; // anonymized messages
let importYourName = '';

// ---- MODE SWITCH ----
function switchMode(mode) {
  currentMode = mode;
  document.getElementById('tab-demo').classList.toggle('active', mode === 'demo');
  document.getElementById('tab-import').classList.toggle('active', mode === 'import');
  document.getElementById('demo-panel').style.display = mode === 'demo' ? '' : 'none';
  document.getElementById('import-panel').style.display = mode === 'import' ? '' : 'none';

  if (mode === 'import') {
    // Reset import UI state
    document.getElementById('disclosure-box').style.display = 'none';
    document.getElementById('import-analyze-btn').style.display = 'none';
    document.getElementById('import-status').textContent = '';
    document.getElementById('disclosure-consent').checked = false;
    // Deselect any active scenario
    document.querySelectorAll('.scenario-btn').forEach(b => b.classList.remove('active'));
    // Reset center panel
    const win = document.getElementById('chat-window');
    win.innerHTML = '<div class="chat-empty"><span>👆</span><p>Fill in the fields above and click Preview &amp; Anonymize</p></div>';
    document.getElementById('chat-subtitle').textContent = 'Imported conversation — anonymized';
    document.getElementById('message-composer').style.display = 'none';
    document.getElementById('analyze-btn').disabled = true;
    // Keep profile cards visible; populate with import placeholders
    renderImportProfileCards('', '');
    resetAnalysisPanel();
  }
}

// ---- PREVIEW & ANONYMIZE ----
function previewImport() {
  const yourName   = document.getElementById('import-your-name').value.trim();
  const matchName  = document.getElementById('import-match-name').value.trim();
  const rawText    = document.getElementById('import-textarea').value.trim();

  // Validation
  if (!yourName) {
    showImportStatus('Please enter your name (Step 1)', 'error');
    document.getElementById('import-your-name').focus();
    return;
  }
  if (!matchName) {
    showImportStatus("Please enter your match's name (Step 2)", 'error');
    document.getElementById('import-match-name').focus();
    return;
  }
  if (!rawText) {
    showImportStatus('Please paste a conversation (Step 3)', 'error');
    document.getElementById('import-textarea').focus();
    return;
  }

  // Parse lines
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const parsed = [];
  const unrecognized = [];

  const escRegex = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const yourRe  = new RegExp('^' + escRegex(yourName)  + '\\s*:', 'i');
  const matchRe = new RegExp('^' + escRegex(matchName) + '\\s*:', 'i');

  // Optional timestamp prefix: [Jun 2, 9:45 AM] or [2025-06-02 09:45] etc.
  const tsBracketRe = /^\[([^\]]+)\]\s*/;

  lines.forEach((line, i) => {
    let timestamp = null;
    let cleanLine = line;

    // Try extracting a leading [timestamp] bracket
    const tsMatch = line.match(tsBracketRe);
    if (tsMatch) {
      const tsRaw = tsMatch[1].trim();
      let d = new Date(tsRaw);
      // Try "Jun 2 9:45 AM" → add year
      if (isNaN(d)) d = new Date(tsRaw.replace(/^(\w{3}\s+\d{1,2}),?\s+(\d+:\d+)/i, '$1 2025 $2'));
      // Try "6/2 9:45 AM" → coerce
      if (isNaN(d)) d = new Date('2025/' + tsRaw.replace(/^(\d{1,2}\/\d{1,2})\s+/, '$1/2025 '));
      if (!isNaN(d)) {
        timestamp = d.toISOString();
        cleanLine  = line.slice(tsMatch[0].length);
      }
    }

    if (yourRe.test(cleanLine)) {
      const text = cleanLine.replace(new RegExp('^' + escRegex(yourName) + '\\s*:\\s*', 'i'), '').trim();
      parsed.push({ sender: yourName, text, timestamp });
    } else if (matchRe.test(cleanLine)) {
      // Anonymize the match's name right here
      const text = cleanLine.replace(new RegExp('^' + escRegex(matchName) + '\\s*:\\s*', 'i'), '').trim();
      parsed.push({ sender: 'Your Match', text, timestamp });
    } else {
      unrecognized.push(i + 1);
    }
  });

  if (parsed.length === 0) {
    showImportStatus(
      `No messages recognized. Make sure lines start with "${yourName}:" or "${matchName}:" (case-insensitive).`,
      'error'
    );
    return;
  }

  // Also anonymize any inline mentions of match name within message text
  const matchNameRe = new RegExp(escRegex(matchName), 'gi');
  parsed.forEach(m => {
    m.text = m.text.replace(matchNameRe, 'Your Match');
  });

  importedConversation = parsed;
  importYourName = yourName;

  // Update profile cards with real names now that we have them
  renderImportProfileCards(yourName, matchName);

  // Render anonymized preview in chat window using the full renderConversation
  // so day dividers + timestamps appear if present
  nameA = yourName;
  nameB = 'Your Match';
  renderConversation(parsed, yourName, 'Your Match');

  // Show summary
  const hasTimestamps = parsed.some(m => m.timestamp);
  let statusMsg = `✓ ${parsed.length} messages parsed and anonymized.`;
  if (hasTimestamps) statusMsg += ' Timestamps detected — day dividers and response time will be shown.';
  if (unrecognized.length > 0) {
    statusMsg += ` (${unrecognized.length} line${unrecognized.length > 1 ? 's' : ''} skipped — line${unrecognized.length > 1 ? 's' : ''} ${unrecognized.join(', ')})`;
  }
  showImportStatus(statusMsg, 'success');

  // Show disclosure + analyze button
  document.getElementById('disclosure-box').style.display = 'flex';
  document.getElementById('disclosure-consent').checked = false;
  document.getElementById('import-analyze-btn').style.display = '';
  document.getElementById('import-analyze-btn').disabled = true;

  // Keep the main analyze button hidden (import uses its own button)
  document.getElementById('analyze-btn').disabled = true;
}

// ---- TOGGLE ANALYZE BUTTON based on checkbox ----
function toggleAnalyzeBtn() {
  const checked = document.getElementById('disclosure-consent').checked;
  document.getElementById('import-analyze-btn').disabled = !checked;
}

// ---- RUN IMPORT ANALYSIS ----
async function runImportAnalysis() {
  const apiKey = savedApiKey || localStorage.getItem('cc_openai_key') || '';
  if (!apiKey) {
    showImportStatus('Enter your OpenAI API key at the top first.', 'error');
    document.getElementById('api-key-input').focus();
    return;
  }
  if (importedConversation.length === 0) {
    showImportStatus('No conversation loaded — use Preview & Anonymize first.', 'error');
    return;
  }

  // Build lightweight profile stubs for import mode
  const profileA = {
    name: importYourName,
    bio: '(Profile not provided — conversation-only analysis)',
    prompt1: { question: 'Note', answer: 'No profile data submitted. Assess conversation authenticity and readiness signals only.' },
    prompt2: { question: 'Note', answer: 'Infer personality and communication style from conversation patterns.' },
    goal: 'Not specified',
    interests: 'Not specified'
  };
  const profileB = {
    name: 'Your Match',
    bio: '(Profile not provided — conversation-only analysis)',
    prompt1: { question: 'Note', answer: 'No profile data submitted. Assess conversation authenticity and readiness signals only.' },
    prompt2: { question: 'Note', answer: 'Infer authenticity from message specificity, reciprocity, and engagement depth.' },
    goal: 'Not specified',
    interests: 'Not specified'
  };

  // Set global state so renderAnalysis works
  currentProfiles = { a: profileA, b: profileB };
  nameA = importYourName;
  nameB = 'Your Match';
  currentConversation = importedConversation;

  document.getElementById('import-analyze-btn').disabled = true;
  showImportStatus('Analyzing…', 'loading');

  try {
    const result = await analyzeWithOpenAI(apiKey, profileA, profileB, importedConversation);
    renderAnalysis(result);
    showImportStatus('Analysis complete ✓', 'success');
    // Scroll right panel into view on mobile
    document.querySelector('.panel-right').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (err) {
    showImportStatus('Error: ' + err.message, 'error');
    console.error(err);
  } finally {
    document.getElementById('import-analyze-btn').disabled = false;
  }
}

// ---- IMPORT STATUS HELPER ----
function showImportStatus(msg, type) {
  const el = document.getElementById('import-status');
  el.textContent = msg;
  el.className = 'import-status status-' + type;
}

// ---- RENDER IMPORT PROFILE CARDS ----
function renderImportProfileCards(yourName, matchName) {
  document.getElementById('nameA').textContent = yourName || 'You';
  document.getElementById('bioA').textContent = 'Profile not submitted — analysis based on conversation only.';
  document.getElementById('p1qA').textContent = 'Import mode';
  document.getElementById('p1aA').textContent = 'Consistency signals will be inferred from your conversation patterns.';
  document.getElementById('p2qA').textContent = '';
  document.getElementById('p2aA').textContent = '';
  document.getElementById('goalA').textContent = '🎯 Not specified';
  document.getElementById('interestsA').textContent = '';

  document.getElementById('nameB').textContent = 'Your Match';
  document.getElementById('bioB').textContent = 'Profile not submitted — analysis based on conversation only.';
  document.getElementById('p1qB').textContent = 'Import mode';
  document.getElementById('p1aB').textContent = 'Authenticity signals will be inferred from message specificity, reciprocity, and engagement depth.';
  document.getElementById('p2qB').textContent = '';
  document.getElementById('p2aB').textContent = '';
  document.getElementById('goalB').textContent = '🎯 Not specified';
  document.getElementById('interestsB').textContent = '';
}
