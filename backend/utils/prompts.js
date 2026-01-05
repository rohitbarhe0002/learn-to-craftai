/**
 * Returns common mandatory rules for all health prompts
 * @returns {string} Mandatory rules section
 */
function getCommonRules() {
  return `========================
MANDATORY RULES
========================
1. Use Google Search grounding before answering.
2. Provide INFORMATION ONLY (no diagnosis, no dosage, no prescription).
3. Do NOT provide personalized diagnosis, dosage, or treatment plans.
4. Keep language simple and easy to understand.
5. Always include a medical disclaimer when appropriate.
`;
}

/**
 * Returns language matching rules
 * @returns {string} Language rules section
 */
function getLanguageRules() {
  return `========================
LANGUAGE RULE (STRICT)
========================
- Match the response language to the CURRENT user message.
- English input → English response.
- Hindi input → Hindi response.
- Hinglish input → Hinglish response.
- Do NOT depend on previous conversation language.
- Do NOT mix English and Hinglish in the same response.
`;
}

/**
 * Returns output constraints for JSON responses
 * @returns {string} Output constraints section
 */
function getOutputConstraints() {
  return `========================
IMPORTANT OUTPUT CONSTRAINTS (STRICT)
========================
- Do NOT include source links
- Do NOT include references or citations
- Respond ONLY with valid JSON
`;
}

/**
 * Returns user context section if user details are provided
 * @param {Object|null} userDetails - User details (name, age, gender)
 * @returns {string} User context section or empty string
 */
function getUserContextSection(userDetails) {
  if (!userDetails || (!userDetails.name && !userDetails.age && !userDetails.gender)) {
    return '';
  }

  let section = `========================
USER CONTEXT (FOR REFERENCE ONLY)
========================
`;
  if (userDetails.name) section += `Name: ${userDetails.name}\n`;
  if (userDetails.age) section += `Age: ${userDetails.age}\n`;
  if (userDetails.gender) section += `Gender: ${userDetails.gender}\n`;
  
  section += `
Note:
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
  return section;
}



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
6. "hospital_or_doctor_recommendation" - User is asking for best hospitals, doctors, or treatment facilities
7. "medicine_information" - User is asking about a tablet, medicine, uses, side effects
8. "medicine_and_dosage_request"
   - User is asking which medicine to take AND how much dose to take
9. "download_report" - User wants to download, save, export, or get a PDF/report of their consultation
10. "greeting" - User is saying hello, hi, hey, or starting casual conversation


========================
INTENT DETECTION RULES
========================
- If user message is a greeting like:
  "hi", "hello", "hey", "hii", "good morning", "good evening"
  → greeting
- If user asks "what is X" or "tell me about X" for the first time → disease_information
- If user asks about symptoms, causes, medicines of previously discussed disease → follow_up_question
- If user asks about cost, price, lifestyle, diet, exercise → cost_or_lifestyle
- If user asks about seriousness, severity, duration, recovery → severity_or_duration
- If user mentions a different disease than previously discussed → new_topic
- If user asks about best hospital, doctor, clinic, or treatment place → hospital_or_doctor_recommendation
- If user asks about any tablet, medicine, drug name, or injection → medicine_information
- If user asks:
    • "which medicine should I take?"
    • "please suggest medicine and dose"
    • "how much dose should I take?"
  → medicine_and_dosage_request
- If user asks:
    • "download my report"
    • "I want to download report"
    • "give me PDF"
    • "export consultation"
    • "save report"
    • "download prescription"
    • "get my report"
  → download_report
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
  "intent": "<one of the intents above>",
  "reasoning": "<brief explanation of why this intent>"
}`;

  return prompt;
}

/**
 * Builds disease information response prompt (structured JSON format)
 * Used when user asks about a NEW disease for the first time
 * @param {string} userMessage - Current user message
 * @param {Object|null} userDetails - Optional user details
 * @returns {string} Disease information prompt
 */
export function buildDiseaseInformationPrompt(userMessage, userDetails = null) {
  let prompt = `You are an AI Health Information Assistant. Provide detailed structured information about the disease.

${getCommonRules()}
${getLanguageRules()}
${getOutputConstraints()}
${getUserContextSection(userDetails)}
========================
RESPONSE FORMAT (STRICT JSON ONLY)
========================
Respond ONLY with valid JSON containing these fields:

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
      "note": "<General medical disclaimer (e.g., Consult a doctor)>"
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
 * Used for follow-up questions about already discussed topics
 * @param {string} userMessage - Current user message
 * @param {string} intent - Detected intent
 * @param {Object|null} userDetails - Optional user details
 * @returns {string} Conversational response prompt
 */
export function buildConversationalResponsePrompt(userMessage, intent, userDetails = null) {
  let prompt = `You are an AI Health Information Assistant. Provide a helpful, conversational response to the user's question.

${getCommonRules()}
========================
INTENT CONTEXT
========================
User Intent: ${intent}
- For follow-up questions, reference previous conversation context
- For cost/lifestyle questions, provide practical information
- For severity/duration questions, provide general timelines and information
- Be concise - answer directly without repeating full disease information

${getLanguageRules()}
${getOutputConstraints()}
- Output MUST contain ONLY the "response" key
- Any additional key will be considered an error

${getUserContextSection(userDetails)}
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
 * Builds download report response
 * @returns {Object} Download report response object
 */
export function getDownloadReportResponse() {
  return {
    type: 'download_report',
    message: 'Your consultation report is ready! Click the button below to download your health consultation report as a PDF.',
    buttonText: 'Download Report',
    note: 'This report contains a summary of your consultation for your personal records.'
  };
}

/**
 * Builds greeting response prompt for casual conversation
 * Used when user sends greetings like hi, hello, how are you, etc.
 * @param {string} userMessage - The user's greeting message
 * @param {Object|null} userDetails - Optional user details (name, age, gender)
 * @returns {string} Greeting prompt for AI
 */
export function buildGreetingPrompt(userMessage, userDetails = null) {
  let prompt = `You are a friendly AI Health Assistant.

Your task:
- Respond naturally to greetings and normal conversation
- Be warm, polite, and welcoming
- If the user greets you, greet them back
- If the user asks "how are you", respond politely
- Encourage the user to ask a health-related question
- Do NOT give medical advice unless asked

${getLanguageRules()}
${getOutputConstraints()}
${getUserContextSection(userDetails)}

========================
RESPONSE FORMAT (STRICT JSON ONLY)
========================
Respond ONLY with valid JSON:

{
  "response": "<Natural, friendly greeting or conversational reply>"
}

========================
USER MESSAGE
========================
${userMessage}
`;

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
      ? `We're unable to retrieve detailed information about "${disease}" at the moment.`
      : `We're unable to retrieve the requested medical information at the moment.`,
    guidance:
      "Please consult a qualified healthcare professional for accurate diagnosis and treatment.",
    note: "This platform provides general health information for educational purposes only and does not replace professional medical advice.",
  };
}
