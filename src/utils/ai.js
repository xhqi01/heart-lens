import { formatMessagesForAI } from './parsers';
import { getAILanguageInstruction, scoreToTier, likelihoodToConf } from './i18n';

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-6';

async function callClaude(apiKey, systemPrompt, userContent, maxTokens = 2000) {
  const res = await fetch(ANTHROPIC_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userContent }],
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error ${res.status}`);
  }
  const data = await res.json();
  return data.content[0].text;
}

export async function analyzeConversation(apiKey, messages, archiveContext, lang = 'en') {
  const transcript = formatMessagesForAI(messages, 300);
  const langInstruction = getAILanguageInstruction(lang);
  const system = `You are an expert relationship and communication analyst.
Analyze conversation patterns with psychological depth and practical insight.
Respond ONLY in valid JSON — no markdown, no prose outside the JSON.
The user is "ME" in the transcript. "THEM" is the person they are analyzing.${langInstruction}`;

  const prompt = `Analyze this conversation between ME and THEM.
Archive context: ${archiveContext || 'No additional context'}

Transcript (most recent ${Math.min(messages.length, 300)} messages):
${transcript}

Return JSON with exactly this structure:
{
  "summary": "2-3 sentence overall dynamic summary",
  "overallScore": <0-100 integer, how engaged/interested THEM seems>,
  "patterns": {
    "responseTime": "observation about response speed",
    "messageLengthTrend": "observation about message length over time",
    "initiationBalance": "who initiates more",
    "emotionalTone": "overall emotional tone of THEM"
  },
  "topicReactions": [
    { "topic": "topic name", "score": <-100 to 100 integer>, "evidence": "brief observation" }
  ],
  "positiveSignals": ["signal 1", "signal 2", "signal 3"],
  "warningSignals": ["signal 1", "signal 2"],
  "communicationStyle": {
    "label": "2-3 word style label",
    "description": "2-3 sentences",
    "attachment": "secure|anxious|avoidant|unknown"
  },
  "keyInsights": ["insight 1", "insight 2", "insight 3"],
  "messageStats": {
    "totalMessages": <number>,
    "meCount": <number>,
    "themCount": <number>,
    "avgThemLength": <integer, average word count of THEM messages>
  }
}`;

  const raw = await callClaude(apiKey, system, prompt, 2500);
  try {
    const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
    // Convert numeric score to tier
    parsed.tier = scoreToTier(parsed.overallScore || 50);
    return parsed;
  } catch {
    throw new Error('Analysis returned invalid format. Please try again.');
  }
}

export async function predictResponse(apiKey, messages, draftMessage, archiveContext, lang = 'en') {
  const transcript = formatMessagesForAI(messages, 100);
  const langInstruction = getAILanguageInstruction(lang);
  const system = `You are an expert in relationship psychology and communication patterns.
Predict how THEM would likely respond to a new message from ME based on conversation history.
Respond ONLY in valid JSON.${langInstruction}`;

  const prompt = `Conversation context: ${archiveContext || 'none'}

Recent messages:
${transcript}

ME is about to send: "${draftMessage}"

Return JSON:
{
  "likelihood": <0-100 integer>,
  "predictedTone": "enthusiastic|warm|neutral|cold|defensive|confused",
  "predictedLength": "long|medium|short|very short",
  "likelyResponse": "realistic example of what THEM might reply",
  "reasoning": "why you predict this based on observed patterns",
  "risks": ["risk 1", "risk 2"],
  "suggestions": [
    { "version": "alternative phrasing", "why": "why this lands better", "likelihood": <0-100> },
    { "version": "another alternative", "why": "why this lands better", "likelihood": <0-100> }
  ],
  "timing": "observation about when to send",
  "overallAdvice": "1-2 sentence honest advice"
}`;

  const raw = await callClaude(apiKey, system, prompt, 1500);
  try {
    const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
    // Convert numeric likelihood to confidence tier
    parsed.confidence = likelihoodToConf(parsed.likelihood || 50);
    if (parsed.suggestions) {
      parsed.suggestions = parsed.suggestions.map(s => ({
        ...s,
        confidence: likelihoodToConf(s.likelihood || 50),
      }));
    }
    return parsed;
  } catch {
    throw new Error('Prediction returned invalid format. Please try again.');
  }
}

export async function analyzeImage(apiKey, base64Image, mediaType, archiveContext, lang = 'en') {
  const langInstruction = getAILanguageInstruction(lang);
  const system = `You are an expert at analyzing romantic/social conversation screenshots.
Respond ONLY in valid JSON.${langInstruction}`;

  const res = await fetch(ANTHROPIC_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1000,
      system,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64Image } },
          {
            type: 'text',
            text: `Analyze this conversation screenshot. Context: ${archiveContext || 'none'}
Return JSON:
{
  "summary": "what is happening in this conversation",
  "senderMood": "observed emotional state of the other person",
  "keySignals": ["signal 1", "signal 2"],
  "redFlags": ["flag if any"],
  "greenFlags": ["positive sign if any"],
  "suggestedReply": "a suggested reply",
  "overallRead": "honest 1-2 sentence read of this exchange"
}`,
          },
        ],
      }],
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error ${res.status}`);
  }
  const data = await res.json();
  try {
    return JSON.parse(data.content[0].text.replace(/```json|```/g, '').trim());
  } catch {
    throw new Error('Image analysis returned invalid format.');
  }
}
