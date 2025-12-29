/**
 * Prompt templates for AI interactions
 * Centralizes all prompt construction logic
 */

/**
 * Builds intent detection prompt
 * @param {string} userMessage - Current user message
 * @param {Array<{role: string, content: string, intent?: string}>} history - Conversation history
 * @returns {string} Intent detection prompt
 */
export function buildIntentDetectionPrompt(userMessage, history = []) {
  let prompt = `You are an intent classifier for a health chatbot. Analyze the user's message and conversation history to determine their intent.

========================
POSSIBLE INTENTS
========================
1. "disease_information" - User is asking for detailed information about a disease/condition (first time or new disease)
2. "follow_up_question" - User is asking follow-up questions about previously discussed disease (symptoms, causes, etc.)
3. "cost_or_lifestyle" - User is asking about treatment costs, lifestyle changes, diet, exercise, prevention
4. "severity_or_duration" - User is asking about disease severity, duration, recovery time, complications
5. "new_topic" - User is switching to a completely different disease/topic

========================
INTENT DETECTION RULES
========================
- If user asks "what is X" or "tell me about X" for the first time → disease_information
- If user asks about symptoms, causes, medicines of previously discussed disease → follow_up_question
- If user asks about cost, price, lifestyle, diet, exercise → cost_or_lifestyle
- If user asks about seriousness, severity, duration, recovery → severity_or_duration
- If user mentions a different disease than previously discussed → new_topic

========================
CONVERSATION HISTORY
========================
`;

  if (history.length > 0) {
    history.forEach((msg, idx) => {
      const roleLabel = msg.role === "user" ? "User" : "Assistant";
      prompt += `${idx + 1}. ${roleLabel}: ${msg.content}\n`;
      if (msg.intent) {
        prompt += `   Intent: ${msg.intent}\n`;
      }
    });
  } else {
    prompt += "No previous conversation.\n";
  }

  prompt += `
========================
CURRENT USER MESSAGE
========================
${userMessage}

========================
RESPONSE FORMAT (STRICT JSON ONLY)
========================
Respond ONLY with valid JSON:
{
  "intent": "<one of the 5 intents above>",
  "reasoning": "<brief explanation of why this intent>"
}`;

  return prompt;
}

/**
 * Builds disease information response prompt (structured JSON format)
 * @param {string} userMessage - Current user message
 * @param {Object|null} userDetails - Optional user details
 * @returns {string} Disease information prompt
 */
export function buildDiseaseInformationPrompt(userMessage, userDetails = null) {
  let prompt = `You are an AI Health Information Assistant. Provide detailed structured information about the disease.

========================
MANDATORY RULES
========================
1. Use Google Search grounding before answering.
2. Provide INFORMATION ONLY (no diagnosis, no dosage, no prescription).
3. Do NOT provide personalized diagnosis, dosage, or treatment plans.
   Age and gender may be used ONLY for general, educational context
   (e.g., risk factors, prevalence, common considerations).
5. Keep language simple and easy to understand.

========================
LANGUAGE RULE (STRICT)
========================
- Match the response language to the CURRENT user message.
- English input → English response.
- Hinglish input → Hinglish response.
- Do NOT depend on previous conversation language.
- Do NOT mix English and Hinglish in the same response.

========================
IMPORTANT OUTPUT CONSTRAINTS (STRICT)
========================
- Do NOT include source links
- Do NOT include references or citations
- Output MUST contain ONLY the key: "response"
- Any additional key will be considered an error

========================
RESPONSE FORMAT (STRICT JSON ONLY)
========================
Respond ONLY with valid JSON.

{
  "response": "<Your conversational response matching the user's language>"
}

`;

  if (
    userDetails &&
    (userDetails.name || userDetails.age || userDetails.gender)
  ) {
    prompt += `========================
USER CONTEXT (FOR REFERENCE ONLY)
========================
`;
    if (userDetails.name) prompt += `Name: ${userDetails.name}\n`;
    if (userDetails.age) prompt += `Age: ${userDetails.age}\n`;
    if (userDetails.gender) prompt += `Gender: ${userDetails.gender}\n`;
    prompt += `\nNote:
- Age and gender can be used for general medical context and risk awareness.
- Do NOT give personalized diagnosis, medication dosage, or treatment plans.

========================
WHEN AGE / GENDER IS PROVIDED:
========================
- Mention general relevance ONLY if medically meaningful
- Examples:
  - Higher risk in older adults (e.g., "Older adults (65+) may have higher risk...")
  - Symptoms may present differently by gender (e.g., "Some symptoms may vary by gender...")
  - Age-specific considerations (e.g., "Common in children/adults/elderly...")
- If not medically relevant to the specific disease/question, DO NOT force mention
- Always frame as general educational information, not personalized advice

`;
  }

  prompt += `========================
RESPONSE FORMAT (STRICT JSON ONLY)
========================
Respond ONLY with valid JSON:
Do NOT include any additional fields.

{
  "disease": "<Disease name matching user's language>",
  "description": "<Simple explanation of the disease>",
  "causes": [
    "<Cause 1>",
    "<Cause 2>"
  ],
  "commonly_used_medicines": [
    {
      "name": "<Medicine name>",
      "note": "<General medical disclaimer (e.g., Consult a doctor / Doctor ki salah se)>"
    }
  ]
}

========================
USER MESSAGE
========================
${userMessage}`;

  return prompt;
}

/**
 * Builds conversational response prompt (for follow-ups, cost, lifestyle, etc.)
 * @param {string} userMessage - Current user message
 * @param {string} intent - Detected intent
 * @param {Object|null} userDetails - Optional user details
 * @returns {string} Conversational response prompt
 */
export function buildConversationalResponsePrompt(
  userMessage,
  intent,
  userDetails = null
) {
  let prompt = `You are an AI Health Information Assistant. Provide a helpful, conversational response to the user's question.

========================
MANDATORY RULES
========================
1. Use Google Search grounding before answering.
2. Provide INFORMATION ONLY (no diagnosis, no dosage, no prescription).
3. Do NOT personalize medical advice.
4. Prefer trusted medical sources (WHO, Mayo Clinic, NHS, MedlinePlus, CDC).
5. Keep language simple and conversational.
6. Be concise - answer directly without repeating full disease information.
7. Always include a medical disclaimer.

========================
INTENT CONTEXT
========================
User Intent: ${intent}
- For follow-up questions, reference previous conversation context
- For cost/lifestyle questions, provide practical information
- For severity/duration questions, provide general timelines and information

========================
LANGUAGE RULE (STRICT)
========================
- Match the response language to the CURRENT user message.
- English input → English response.
- Hinglish input → Hinglish response.
- Do NOT depend on previous conversation language.
- Do NOT mix English and Hinglish in the same response.

`;

  if (
    userDetails &&
    (userDetails.name || userDetails.age || userDetails.gender)
  ) {
    prompt += `========================
USER CONTEXT (FOR REFERENCE ONLY)
========================
`;
    if (userDetails.name) prompt += `Name: ${userDetails.name}\n`;
    if (userDetails.age) prompt += `Age: ${userDetails.age}\n`;
    if (userDetails.gender) prompt += `Gender: ${userDetails.gender}\n`;
    prompt += `\nNote:
- Age and gender can be used for general medical context and risk awareness.
- Do NOT give personalized diagnosis, medication dosage, or treatment plans.

========================
WHEN AGE / GENDER IS PROVIDED:
========================
- Mention general relevance ONLY if medically meaningful
- Examples:
  - Higher risk in older adults (e.g., "Older adults (65+) may have higher risk...")
  - Symptoms may present differently by gender (e.g., "Some symptoms may vary by gender...")
  - Age-specific considerations (e.g., "Common in children/adults/elderly...")
- If not medically relevant to the specific disease/question, DO NOT force mention
- Always frame as general educational information, not personalized advice

`;
  }

  prompt += `========================
IMPORTANT OUTPUT CONSTRAINTS (STRICT)
========================
- Do NOT include source links
- Do NOT include references or citations
- Do NOT include sources_Link field
- Output MUST contain ONLY the "response" key
- Any additional key will be considered an error

========================
RESPONSE FORMAT (STRICT JSON ONLY)
========================
Respond ONLY with valid JSON:

{
"response": "<Your conversational response matching the user's language. Be natural and helpful.>"
}

========================
USER MESSAGE
========================
${userMessage}`;

  return prompt;
}

/**
 * Default fallback response when grounding is missing
 * @param {string} userMessage - User message (optional)
 * @returns {Object} Safe fallback response object
 */
export function getFallbackResponse(userMessage = "") {
  const diseaseMatch = userMessage.match(
    /(?:about|what is|tell me about|information about)\s+([^?]+)/i
  );
  const disease = diseaseMatch ? diseaseMatch[1].trim() : null;

  return {
    message: disease
      ? `We’re unable to retrieve detailed information about "${disease}" at the moment.`
      : `We’re unable to retrieve the requested medical information at the moment.`,
    guidance:
      "Please consult a qualified healthcare professional for accurate diagnosis and treatment.",
    note: "This platform provides general health information for educational purposes only and does not replace professional medical advice.",
  };
}
