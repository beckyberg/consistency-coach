require('dotenv').config({ path: require('path').join(__dirname, '.env') });
// Also try loading key directly as fallback
if (!process.env.OPENAI_API_KEY) {
  try {
    const fs = require('fs');
    const env = fs.readFileSync(require('path').join(__dirname, '.env'), 'utf8');
    env.split('\n').forEach(line => {
      const [k, ...v] = line.split('=');
      if (k && v.length) process.env[k.trim()] = v.join('=').trim();
    });
  } catch(e) {}
}
const express = require('express');
const cors = require('cors');
const path = require('path');
const OpenAI = require('openai');
const { runConsistencyAgent } = require('./agent');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize OpenAI client only if key exists
let openaiClient = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
  openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// Demo data — pre-loaded scenario pairs based on research signal categories
const DEMO_SCENARIOS = {
  high_consistency: {
    label: "High Consistency — Readiness Building",
    description: "Both users show strong profile-to-conversation alignment and early readiness signals",
    profileA: {
      name: "Jordan",
      bio: "Grad student in environmental science. I spend weekends hiking or at the farmer's market. Looking for someone genuine to explore the city with.",
      prompt1: { question: "The most important thing I'm looking for", answer: "Someone who actually means what they say. I've been on enough dates to know the difference between someone performing and someone being real." },
      prompt2: { question: "A typical Saturday looks like", answer: "Morning run, then the farmer's market on 5th. I always end up buying too many heirloom tomatoes. Afternoons are for reading or a long hike if the weather cooperates." },
      goal: "Long-term relationship",
      interests: "Hiking, cooking, environmental advocacy, reading"
    },
    profileB: {
      name: "Sam",
      bio: "I teach middle school science and I love it more than I expected to. Weekends I'm usually outdoors or trying a new recipe. Genuine connection > small talk.",
      prompt1: { question: "I want someone who", answer: "Has actual opinions and isn't afraid to share them. The best conversations I've had start with a disagreement." },
      prompt2: { question: "My love language is", answer: "Quality time — but the unplanned kind. Not a fancy dinner reservation, more like ending up at a bookstore for two hours." },
      goal: "Long-term relationship",
      interests: "Teaching, science, outdoor cooking, bookstores, hiking"
    },
    conversation: [
      { sender: "Jordan", text: "Ok your farmer's market comment made me laugh — I also always over-buy. Last week it was four bunches of basil. What am I doing with four bunches of basil?" },
      { sender: "Sam", text: "Ha! Pesto. The answer is always pesto. Also basil ice cream is surprisingly good if you're feeling ambitious." },
      { sender: "Jordan", text: "That's either genius or a crime and I genuinely can't tell which. Do you actually cook or is this theoretical kitchen knowledge?" },
      { sender: "Sam", text: "Fully functional kitchen, I promise. Though I have had a few disasters. Made a soup so spicy last month my roommate genuinely cried. What about you — is the cooking real or farmer's market aesthetic?" },
      { sender: "Jordan", text: "Real, definitely real. I grew up cooking with my dad, so it's kind of a thing for me. We used to do Sunday dinners every week. I miss that honestly." },
      { sender: "Sam", text: "That's really nice — Sunday dinners are underrated. My family did Taco Tuesdays which sounds less romantic but honestly still one of my favorite memories." },
      { sender: "Jordan", text: "There's something about a recurring ritual, right? Ok this might be forward but — have you been to the farmers market on Clement Street? I was thinking about going this Sunday and it seemed like maybe a low-key good first thing to do together." },
      { sender: "Sam", text: "I haven't but I've been meaning to go! Sunday works. I like that it's low-pressure — we can see if the basil conversation translates to real life." }
    ]
  },
  low_consistency: {
    label: "Low Consistency — Concern Signals",
    description: "User B's conversation behavior shows several misalignment signals compared to their profile",
    profileA: {
      name: "Alex",
      bio: "Writer and weekend rock climber. I value honesty and deep conversations. Not here for small talk.",
      prompt1: { question: "The most important thing I'm looking for", answer: "Real conversation. Someone who asks follow-up questions and actually listens to the answers." },
      prompt2: { question: "I'll know it's the right person if", answer: "We can sit in comfortable silence AND talk for four hours. Both." },
      goal: "Long-term relationship",
      interests: "Writing, rock climbing, philosophy, independent film"
    },
    profileB: {
      name: "Riley",
      bio: "Outdoor enthusiast, dog dad, looking for something real. I work in finance but don't let that fool you — I spend more time outside than inside.",
      prompt1: { question: "I'm known for", answer: "Being the person who actually shows up. Loyalty is everything to me. I'd rather have three real friends than thirty acquaintances." },
      prompt2: { question: "The way to my heart is", answer: "Be genuine. I can spot fake from a mile away and it's the fastest way to lose my interest." },
      goal: "Long-term relationship",
      interests: "Hiking, dogs, climbing, travel"
    },
    conversation: [
      { sender: "Alex", text: "Hey! Your profile mentioned rock climbing — do you boulder or do more trad/sport routes?" },
      { sender: "Riley", text: "Hey! Yeah I love climbing. It's so fun right?" },
      { sender: "Alex", text: "Ha yeah — I mostly boulder but I've been wanting to try outdoor sport climbing. Have you done any routes around here?" },
      { sender: "Riley", text: "Yeah totally, there are some great spots. You seem really cool by the way." },
      { sender: "Alex", text: "Thanks! What made you get into climbing originally? I got into it through a friend and kind of got obsessed." },
      { sender: "Riley", text: "Oh you know how it is, just tried it one day and loved it. You're really pretty in your photos by the way." },
      { sender: "Alex", text: "...thanks. So do you have any other big interests outside of climbing? Your profile mentioned you have a dog?" },
      { sender: "Riley", text: "Yeah I love my dog! He's so great. Hey do you want to meet up sometime? I feel like we have great chemistry." }
    ]
  },
  moderate_consistency: {
    label: "Moderate Consistency — Potential Building",
    description: "Genuine connection emerging but one user is still holding back — consistency building over time",
    profileA: {
      name: "Taylor",
      bio: "Nurse practitioner. I work hard and I play hard. Love live music, good food, and honest people. A little guarded at first but worth the patience.",
      prompt1: { question: "A non-negotiable for me is", answer: "Emotional honesty. I deal with enough performance at work — I don't want it in my personal life too." },
      prompt2: { question: "My ideal Sunday", answer: "Farmers market, live jazz somewhere, maybe a long walk. Nothing scheduled, everything meandering." },
      goal: "Open to either casual or serious",
      interests: "Live music, nursing, cooking, hiking, jazz"
    },
    profileB: {
      name: "Morgan",
      bio: "Software engineer by day, amateur chef by night. I'm probably too passionate about coffee. Looking for someone to have real conversations with.",
      prompt1: { question: "I get too excited about", answer: "Coffee origins. I know it's a lot. I went to Ethiopia last year specifically to visit coffee farms and I have zero regrets." },
      prompt2: { question: "The best type of date is", answer: "Something we both didn't plan on. Walk that turns into dinner that turns into a long conversation neither of us expected." },
      goal: "Long-term relationship",
      interests: "Cooking, coffee, software, travel, hiking"
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

// Route: get demo scenarios list
app.get('/api/scenarios', (req, res) => {
  const list = Object.entries(DEMO_SCENARIOS).map(([key, s]) => ({
    key,
    label: s.label,
    description: s.description
  }));
  res.json(list);
});

// Route: get full scenario data
app.get('/api/scenario/:key', (req, res) => {
  const scenario = DEMO_SCENARIOS[req.params.key];
  if (!scenario) return res.status(404).json({ error: 'Scenario not found' });
  res.json(scenario);
});

// Route: run the agent
app.post('/api/analyze', async (req, res) => {
  const { profileA, profileB, conversation } = req.body;

  if (!profileA || !profileB || !conversation) {
    return res.status(400).json({ error: 'Missing required fields: profileA, profileB, conversation' });
  }

  // If no API key, return a mock response for demo purposes
  if (!openaiClient) {
    return res.json({
      mock: true,
      message: "No OpenAI API key configured. Add your key to a .env file to enable live analysis.",
      consistency_assessment: {
        score: "moderate",
        signals_detected: ["Profile prompt specificity carries into conversation tone", "Shared interest in outdoor activities referenced organically"],
        flags: ["API key required for live analysis"],
        summary: "This is a mock response. Configure your OpenAI API key to see real analysis."
      },
      readiness_assessment: {
        user_a_ready: false,
        user_b_ready: false,
        both_ready: false,
        readiness_signals: ["Add API key to see live readiness detection"],
        summary: "Live readiness detection requires an OpenAI API key."
      },
      agent_action: {
        should_act: false,
        action_type: "none",
        message_to_user: "Add your OpenAI API key to .env to enable the live agent.",
        meeting_suggestion: { active: false }
      }
    });
  }

  try {
    const result = await runConsistencyAgent(openaiClient, profileA, profileB, conversation);
    res.json(result);
  } catch (err) {
    console.error('Agent error:', err.message);
    res.status(500).json({ error: 'Agent analysis failed', details: err.message });
  }
});

// Route: add a message and re-analyze
app.post('/api/message', async (req, res) => {
  const { profileA, profileB, conversation, newMessage } = req.body;
  const updatedConversation = [...conversation, newMessage];

  if (!openaiClient) {
    return res.json({
      mock: true,
      updatedConversation,
      analysis: { message: "Add OpenAI API key to enable live analysis" }
    });
  }

  try {
    const result = await runConsistencyAgent(openaiClient, profileA, profileB, updatedConversation);
    res.json({ updatedConversation, analysis: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Consistency Coach running on port ${PORT}`);
  console.log(`OpenAI client: ${openaiClient ? 'ACTIVE' : 'NOT CONFIGURED (mock mode)'}`);
});
