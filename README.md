# Consistency Coach — Agentic Dating Prototype
**Portfolio Project | Becky Berg (2025)**

## What This Is
A working prototype of an agentic AI consistency coach for dating apps.  
Built from original user research: *"Bridging the Gap from Swiping to IRL"* (Berg, 2025).

## Research Foundation
62 dating app users participated in a study on trust and authenticity.  
Key finding: **62% cited "quality of conversation"** as the #1 factor in deciding to meet in person.

## How It Works
The agent monitors:
1. **Profile → Conversation Consistency** — Do users communicate in ways that align with how they presented themselves?
2. **Mutual Readiness Cues** — Are both users showing signals of readiness to meet offline?
3. **Autonomous Action** — When both signals align, the agent surfaces a low-friction, safe path to an in-person meeting.

## Setup
```bash
# 1. Clone and install
npm install

# 2. Add your OpenAI API key
cp .env.example .env
# Edit .env and add: OPENAI_API_KEY=your_key_here

# 3. Run
npm start
# Open http://localhost:3000
```

## Project Structure
```
consistency-coach/
├── server.js       — Express server + API routes
├── agent.js        — Core agent logic + research-grounded system prompt
├── public/
│   ├── index.html  — Main UI
│   ├── style.css   — Dark-mode styling
│   └── app.js      — Frontend interaction logic
└── README.md
```

## The Agent Prompt
The agent's detection logic is directly grounded in study findings.  
See `agent.js` for the full system prompt and signal framework.

## Signal Framework
**Authenticity signals:** Personal specificity, humor consistency, natural vulnerability, reciprocal curiosity  
**Concern signals:** Generic responses, no reciprocity, profile-conversation mismatch, hidden agenda patterns  
**Readiness cues:** Future-oriented language, logistics emerging, explicit meeting interest, sustained depth  

## Next Steps (Production Roadmap)
- Option 2: Fine-tune on public conversational datasets using this prompt as annotation guide
- Longitudinal study: IRB-approved study to collect domain-specific training data
- Safety layer: Add pre-meeting safety checklist and location sharing prompts
