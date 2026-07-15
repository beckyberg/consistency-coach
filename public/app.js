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
    conversation: [
      { sender: "Jordan", text: "Ok your farmer's market comment made me laugh — I also always over-buy. Last week it was four bunches of basil. What am I doing with four bunches of basil?" },
      { sender: "Sam",    text: "Ha! Pesto. The answer is always pesto. Also basil ice cream is surprisingly good if you're feeling ambitious." },
      { sender: "Jordan", text: "That's either genius or a crime and I genuinely can't tell which. Do you actually cook or is this theoretical kitchen knowledge?" },
      { sender: "Sam",    text: "Fully functional kitchen, I promise. Though I have had a few disasters. Made a soup so spicy last month my roommate genuinely cried. What about you — is the cooking real or farmer's market aesthetic?" },
      { sender: "Jordan", text: "Real, definitely real. I grew up cooking with my dad, so it's kind of a thing for me. We used to do Sunday dinners every week. I miss that honestly." },
      { sender: "Sam",    text: "That's really nice — Sunday dinners are underrated. My family did Taco Tuesdays which sounds less romantic but honestly still one of my favorite memories." },
      { sender: "Jordan", text: "There's something about a recurring ritual, right? Ok this might be forward but — have you been to the farmers market on Clement Street? I was thinking about going this Sunday and it seemed like maybe a low-key good first thing to do together." },
      { sender: "Sam",    text: "I haven't but I've been meaning to go! Sunday works. I like that it's low-pressure — we can see if the basil conversation translates to real life." }
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
    conversation: [
      { sender: "Alex",  text: "Hey! Your profile mentioned rock climbing — do you boulder or do more trad/sport routes?" },
      { sender: "Riley", text: "Hey! Yeah I love climbing. It's so fun right?" },
      { sender: "Alex",  text: "Ha yeah — I mostly boulder but I've been wanting to try outdoor sport climbing. Have you done any routes around here?" },
      { sender: "Riley", text: "Yeah totally, there are some great spots. You seem really cool by the way." },
      { sender: "Alex",  text: "Thanks! What made you get into climbing originally? I got into it through a friend and kind of got obsessed." },
      { sender: "Riley", text: "Oh you know how it is, just tried it one day and loved it. You're really pretty in your photos by the way." },
      { sender: "Alex",  text: "...thanks. So do you have any other big interests outside of climbing? Your profile mentioned you have a dog?" },
      { sender: "Riley", text: "Yeah I love my dog! He's so great. Hey do you want to meet up sometime? I feel like we have great chemistry." }
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
    conversation: [
      { sender: "Morgan", text: "Ethiopia for coffee farms — yes. That's dedication I respect. Are you also a coffee person or is that going to be a dealbreaker?" },
      { sender: "Taylor", text: "Haha I'm a nurse so I'm basically an IV drip of caffeine walking around. I appreciate good coffee but I'm not as serious about it as you clearly are." },
      { sender: "Morgan", text: "Fair. I promise I won't quiz you on origin notes. What's your usual order?" },
      { sender: "Taylor", text: "Whatever keeps me awake during a 12-hour shift honestly. But outside of work — a good pour over. Something simple." },
      { sender: "Morgan", text: "That's actually perfect. Simple pour over taste = good taste. Do you work nights or days?" },
      { sender: "Taylor", text: "Rotating shifts currently. It's a lot but I love the actual work." },
      { sender: "Morgan", text: "That takes a certain kind of person. I've always had a lot of respect for nurses — especially the honesty it probably requires to do that job every day." },
      { sender: "Taylor", text: "Yeah. It does make you less tolerant of pretense in other parts of your life. Anyway — your profile mentioned you were into live music?" }
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
function renderConversation(messages, nameA, nameB) {
  const win = document.getElementById('chat-window');
  win.innerHTML = '';
  messages.forEach(m => appendBubble(win, m, nameA, nameB, false));
  win.scrollTop = win.scrollHeight;
}

function appendBubble(win, msg, nA, nB, isNew) {
  const isA = msg.sender === nA || msg.sender === 'A';
  const senderName = msg.sender === 'A' ? nA : msg.sender === 'B' ? nB : msg.sender;
  const wrap = document.createElement('div');
  wrap.className = `bubble-wrap ${isA ? 'from-a' : 'from-b'}${isNew ? ' bubble-new' : ''}`;
  wrap.innerHTML = `
    <span class="bubble-sender">${senderName}</span>
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
  const newMsg = { sender: senderName, text };
  currentConversation.push(newMsg);

  const win = document.getElementById('chat-window');
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

  if (da && co) renderCoaching(da, co, thin);
  if (aa) renderAction(aa, thin);
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
  document.getElementById('action-type-badge').textContent = 'waiting';
  document.getElementById('action-type-badge').className = 'action-type-badge';
  document.getElementById('agent-message').textContent = 'Keep the conversation going.';
  document.getElementById('agent-message').style.fontStyle = 'italic';
  document.getElementById('meeting-suggestion-box').style.display = 'none';
}

// ---- MAIN COACHING RENDER ----
function renderCoaching(da, co, thin) {
  // Show cards at full opacity
  ['match-card', 'you-card', 'heading-card'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.opacity = '1';
  });
  // Hide insufficient notice
  const insufficientEl = document.getElementById('insufficient-notice');
  if (insufficientEl) insufficientEl.style.display = 'none';

  // Thin data caveat
  const thinNotice = document.getElementById('thin-data-notice');
  if (thinNotice) thinNotice.style.display = thin ? 'block' : 'none';

  // ABOUT YOUR MATCH
  const matchText = document.getElementById('match-coaching-text');
  if (matchText) matchText.textContent = co.about_your_match || '';

  // Match signals (from dyadic)
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
  }

  // RELATIONAL PATTERN
  const patternEl = document.getElementById('relational-pattern');
  if (patternEl) patternEl.textContent = da.relational_pattern || '';

  // WHERE THIS IS HEADING
  const headingText = document.getElementById('heading-coaching-text');
  if (headingText) headingText.textContent = co.where_this_is_heading || '';
}

function renderAction(aa, thin = false) {
  const badge    = document.getElementById('action-type-badge');
  const msgBox   = document.getElementById('agent-message-box');
  const msgEl    = document.getElementById('agent-message');
  const meetingBox = document.getElementById('meeting-suggestion-box');

  badge.textContent = aa.action_type || 'none';
  if (aa.should_act && aa.action_type !== 'none') {
    badge.className = 'action-type-badge action-active';
    msgBox.className = 'agent-message-box agent-message-active';
  } else {
    badge.className = 'action-type-badge';
    msgBox.className = 'agent-message-box';
  }

  msgEl.textContent = aa.message_to_user || '';
  msgEl.style.fontStyle = aa.should_act ? 'normal' : 'italic';

  // Never show meeting suggestion during thin-data state
  if (!thin && aa.meeting_suggestion && aa.meeting_suggestion.active) {
    meetingBox.style.display = 'block';
    document.getElementById('meeting-format').textContent = aa.meeting_suggestion.suggested_format || '';
    document.getElementById('safety-reminder').textContent = aa.meeting_suggestion.safety_reminder || '';
  } else {
    meetingBox.style.display = 'none';
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
  setText('relational-pattern', '');
  setText('heading-coaching-text', 'Run the agent to see analysis');

  const insuf = document.getElementById('insufficient-notice');
  if (insuf) insuf.style.display = 'none';
  const thin = document.getElementById('thin-data-notice');
  if (thin) thin.style.display = 'none';

  document.getElementById('action-type-badge').textContent = 'waiting';
  document.getElementById('action-type-badge').className = 'action-type-badge';
  document.getElementById('agent-message-box').className = 'agent-message-box';
  document.getElementById('agent-message').textContent = 'The agent will surface a message here when it detects the right moment.';
  document.getElementById('agent-message').style.fontStyle = 'italic';
  document.getElementById('meeting-suggestion-box').style.display = 'none';
  const warning = document.querySelector('.mock-warning');
  if (warning) warning.remove();
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
  const statusEl   = document.getElementById('import-status');

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

  lines.forEach((line, i) => {
    if (yourRe.test(line)) {
      const text = line.replace(new RegExp('^' + escRegex(yourName) + '\\s*:\\s*', 'i'), '').trim();
      parsed.push({ sender: yourName, text });
    } else if (matchRe.test(line)) {
      // Anonymize the match's name right here
      const text = line.replace(new RegExp('^' + escRegex(matchName) + '\\s*:\\s*', 'i'), '').trim();
      parsed.push({ sender: 'Your Match', text });
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

  // Render anonymized preview in chat window
  const win = document.getElementById('chat-window');
  win.innerHTML = '';
  parsed.forEach(m => {
    const isYou = m.sender === yourName;
    const wrap = document.createElement('div');
    wrap.className = `bubble-wrap ${isYou ? 'from-a' : 'from-b'}`;
    wrap.innerHTML = `
      <span class="bubble-sender">${escapeHTML(m.sender)}</span>
      <div class="bubble">${escapeHTML(m.text)}</div>
    `;
    win.appendChild(wrap);
  });
  win.scrollTop = win.scrollHeight;

  // Show summary
  let statusMsg = `✓ ${parsed.length} messages parsed and anonymized.`;
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
  // The agent will analyze conversation-only consistency (no rich profile to compare against)
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
// Keeps the User A / User B cards visible in import mode with placeholder info
function renderImportProfileCards(yourName, matchName) {
  // Card A — you
  document.getElementById('nameA').textContent = yourName || 'You';
  document.getElementById('bioA').textContent = 'Profile not submitted — analysis based on conversation only.';
  document.getElementById('p1qA').textContent = 'Import mode';
  document.getElementById('p1aA').textContent = 'Consistency signals will be inferred from your conversation patterns.';
  document.getElementById('p2qA').textContent = '';
  document.getElementById('p2aA').textContent = '';
  document.getElementById('goalA').textContent = '🎯 Not specified';
  document.getElementById('interestsA').textContent = '';

  // Card B — your match
  document.getElementById('nameB').textContent = 'Your Match';
  document.getElementById('bioB').textContent = 'Profile not submitted — analysis based on conversation only.';
  document.getElementById('p1qB').textContent = 'Import mode';
  document.getElementById('p1aB').textContent = 'Authenticity signals will be inferred from message specificity, reciprocity, and engagement depth.';
  document.getElementById('p2qB').textContent = '';
  document.getElementById('p2aB').textContent = '';
  document.getElementById('goalB').textContent = '🎯 Not specified';
  document.getElementById('interestsB').textContent = '';
}
