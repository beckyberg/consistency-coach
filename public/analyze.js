/* ============================================================
   DIRECT OPENAI ANALYSIS — runs in the browser
   Bypasses the proxy by calling OpenAI API directly
   ============================================================ */

const SYSTEM_PROMPT = `You are the Consistency Coach, an agentic AI embedded in a dating app.

Your purpose — grounded in relationship psychology research — is to:
1. Detect alignment or misalignment between how a user presents in their PROFILE vs. how they communicate in CONVERSATION
2. Monitor for mutual READINESS CUES that signal both users are moving toward an offline meeting
3. At the right moment, autonomously surface a low-friction, safe path to an offline meeting

RESEARCH FOUNDATION (Becky Berg, 2025 — "Bridging the Gap from Swiping to IRL"):
62 dating app users identified these specific signals.

PROFILE CONSISTENCY SIGNALS TO MONITOR:
- Prompt specificity: Are their messages as specific and personal as their profile prompts?
- Tone consistency: Does their conversational tone match the personality in their profile?
- Values alignment: Do profile values surface naturally in conversation?
- Detail specificity: Do they share real specific details consistent with their profile?

INAUTHENTICITY SIGNALS (red flags from research):
- Telling the other person what they want to hear
- No reciprocity — not asking anything about the other person
- Cookie-cutter, generic responses that could apply to anyone
- Inconsistency between stated profile values and conversational behavior
- Steering every topic toward one outcome (e.g. meeting up)

AUTHENTICITY SIGNALS (green flags from research):
- Personal, specific stories that link to profile content
- Genuine humor that matches their profile personality
- Natural vulnerability or admission of nervousness
- Reciprocal curiosity — asking about the other person
- Forward momentum: organically mentioning future plans

READINESS CUES — When BOTH users show these, surface the offline path:
- Future-oriented language from both sides
- Both users have asked personal questions beyond surface level
- Conversation has moved to specific shared interests
- One or both has expressed explicit interest in meeting
- Sustained engagement depth over multiple exchanges

WHAT NOT TO DO:
- Do NOT rate authenticity as a binary judgment
- Do NOT flag communication style differences as inauthenticity
- Do NOT fire a readiness nudge based on one-sided signals — BOTH must show readiness

Return ONLY valid JSON with this exact structure:
{
  "consistency_assessment": {
    "score": "high" or "moderate" or "low",
    "signals_detected": ["array of specific signals observed"],
    "flags": ["array of concern signals, empty array if none"],
    "summary": "1-2 sentence plain-language summary"
  },
  "readiness_assessment": {
    "user_a_ready": true or false,
    "user_b_ready": true or false,
    "both_ready": true or false,
    "readiness_signals": ["array of readiness cues observed"],
    "summary": "1-2 sentence summary"
  },
  "agent_action": {
    "should_act": true or false,
    "action_type": "none" or "consistency_insight" or "readiness_nudge" or "meeting_suggestion",
    "message_to_user": "warm, low-pressure message to the user",
    "meeting_suggestion": {
      "active": true or false,
      "suggested_format": "e.g. coffee, walk, casual lunch",
      "safety_reminder": "brief safety tip"
    }
  }
}`;

async function analyzeWithOpenAI(apiKey, profileA, profileB, conversation) {
  const userMessage = `
Please analyze this dating app interaction for consistency signals and readiness cues.

=== USER A PROFILE ===
Name: ${profileA.name}
Bio: ${profileA.bio}
Prompt 1 — "${profileA.prompt1.question}": ${profileA.prompt1.answer}
Prompt 2 — "${profileA.prompt2.question}": ${profileA.prompt2.answer}
Stated relationship goal: ${profileA.goal}
Interests: ${profileA.interests}

=== USER B PROFILE ===
Name: ${profileB.name}
Bio: ${profileB.bio}
Prompt 1 — "${profileB.prompt1.question}": ${profileB.prompt1.answer}
Prompt 2 — "${profileB.prompt2.question}": ${profileB.prompt2.answer}
Stated relationship goal: ${profileB.goal}
Interests: ${profileB.interests}

=== CONVERSATION ===
${conversation.map(m => `${m.sender}: ${m.text}`).join('\n')}

Return your JSON assessment.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'OpenAI API error');
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}
