import { getAILanguageInstruction } from '@/lib/i18n';
import { formatMessagesForAI } from '@/lib/parsers';

// Prompts ported verbatim from the original heart-lens/src/utils/ai.js.

export interface SimpleMessage {
  sender: string;
  content: string;
}

export interface PersonaTags {
  mbti?: string | null;
  attachment?: string | null;
  traits?: string | null;
}

export function analyzeSystem(lang: string): string {
  return `You are an expert relationship and communication analyst.
Analyze conversation patterns with psychological depth and practical insight, and build a precise behavioral persona of THEM.
When the user provides manual facts about THEM (MBTI, attachment style, trait tags), prioritize those over your own inference and note any conflict.
Cite short direct quotes from the transcript where they support a conclusion. Mark a field as "insufficient data" when the transcript is too thin to support it.
Respond ONLY in valid JSON — no markdown, no prose outside the JSON.
The user is "ME" in the transcript. "THEM" is the person they are analyzing.${getAILanguageInstruction(lang)}`;
}

function tagsBlock(tags?: PersonaTags): string {
  if (!tags) return '';
  const parts: string[] = [];
  if (tags.mbti) parts.push(`MBTI: ${tags.mbti}`);
  if (tags.attachment) parts.push(`Attachment style: ${tags.attachment}`);
  if (tags.traits) parts.push(`Trait tags: ${tags.traits}`);
  if (parts.length === 0) return '';
  return `\nKnown facts about THEM (prioritize these over inference):\n- ${parts.join('\n- ')}\n`;
}

export function analyzePrompt(
  messages: SimpleMessage[],
  archiveContext?: string | null,
  tags?: PersonaTags,
): string {
  const transcript = formatMessagesForAI(messages, 300);
  return `Analyze this conversation between ME and THEM.
Archive context: ${archiveContext || 'No additional context'}
${tagsBlock(tags)}
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
  },
  "persona": {
    "coreRules": ["concrete behavioral rule: when [situation], THEM does [behavior], not [what you might assume]"],
    "expressionStyle": {
      "catchphrases": ["recurring phrases they use"],
      "highFrequencyWords": ["words/phrases used 3+ times"],
      "signatureEmoji": [{ "emoji": "x", "context": "when/how they use it" }],
      "sentenceStyle": "short vs long, conclusion-first vs build-up, formality 1-5",
      "replyRhythm": "fast/slow/mood-based, with detail",
      "disengagementSignals": "how they signal they don't want to talk (e.g. one-word replies)"
    },
    "emotionalPatterns": {
      "showsCare": { "how": "how they show they care", "quote": "short quote or omit" },
      "showsDispleasure": { "how": "how they show anger/displeasure", "quote": "short quote or omit" },
      "apology": { "how": "direct / indirect / via action", "quote": "short quote or omit" },
      "affection": { "how": "when and how they express liking/love", "quote": "short quote or omit" }
    },
    "conflictChain": {
      "triggers": ["what sets them off"],
      "firstReaction": "their first reaction",
      "escalation": "how a conflict escalates",
      "coldWar": "do they go cold, how long, who breaks first",
      "reconciliation": "their reconciliation signal"
    },
    "relationshipRole": {
      "initiation": "how often and what prompts them to reach out first",
      "disappearingSigns": "early signs they're about to go quiet",
      "reappearing": "how they come back",
      "boundaryTopics": ["topics they avoid or shut down"]
    }
  }
}`;
}

export function predictSystem(lang: string): string {
  return `You are an expert in relationship psychology and communication patterns.
Predict how THEM would likely respond to a new message from ME based on conversation history.
Respond ONLY in valid JSON.${getAILanguageInstruction(lang)}`;
}

export function predictPrompt(
  messages: SimpleMessage[],
  draftMessage: string,
  archiveContext?: string | null,
): string {
  const transcript = formatMessagesForAI(messages, 100);
  return `Conversation context: ${archiveContext || 'none'}

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
}

export function imageSystem(lang: string): string {
  return `You are an expert at analyzing romantic/social conversation screenshots.
Respond ONLY in valid JSON.${getAILanguageInstruction(lang)}`;
}

export function imagePrompt(archiveContext?: string | null): string {
  return `Analyze this conversation screenshot. Context: ${archiveContext || 'none'}
Return JSON:
{
  "summary": "what is happening in this conversation",
  "senderMood": "observed emotional state of the other person",
  "keySignals": ["signal 1", "signal 2"],
  "redFlags": ["flag if any"],
  "greenFlags": ["positive sign if any"],
  "suggestedReply": "a suggested reply",
  "overallRead": "honest 1-2 sentence read of this exchange"
}`;
}
