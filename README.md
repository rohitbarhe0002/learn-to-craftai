# AI Health Chatbot Backend

Node.js backend for an AI Health Chatbot using Google Gemini API with mandatory Google Search grounding.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

3. Start the server:
```bash
node server.js
```

## API Endpoints

### POST /chat

Send a health query to the chatbot. Supports multi-turn conversations with follow-up questions.

**Request Body (New Conversation):**
```json
{
  "disease": "What is diabetes?"
}
```

**Request Body (New Conversation with User Details):**
```json
{
  "disease": "What is diabetes?",
  "name": "John Doe",
  "age": 30,
  "gender": "male"
}
```

**Request Body (Follow-up in Existing Conversation):**
```json
{
  "disease": "What are the common symptoms?",
  "conversation_id": "uuid-from-previous-response"
}

```

**Note:** User details (name, age, gender) are optional and can only be provided when starting a new conversation. They are stored with the conversation and used for context, but the AI will NOT personalize medical advice based on these details (as per safety rules).

**Response:**
```json
{
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
  "response": {
    "disease": "Diabetes",
    "what_is": "Diabetes ek medical condition hai jisme blood sugar (glucose) level normal se zyada ho jata hai, kyunki body insulin ko properly use nahi kar pati ya insulin kam banati hai.",
    "common_symptoms": [
      "Bar-bar pyaas lagna",
      "Bar-bar urine aana",
      "Thakaan / kamzori",
      "Weight loss (kuch cases me)"
    ],
    "commonly_used_medicines": [
      {
        "name": "Metformin",
        "note": "Doctor ki salah se"
      },
      {
        "name": "Insulin",
        "note": "Kuch patients me doctor prescribe karte hain"
      }
    ],
    "sources": [
      "WHO",
      "Mayo Clinic",
      "NHS",
      "MedlinePlus"
    ]
  }
}
```

**Example Conversation Flow:**

1. **First Message (with User Details):**
   ```json
   POST /chat
   {
     "disease": "What is diabetes?",
     "name": "John Doe",
     "age": 30,
     "gender": "male"
   }
   ```
   Response includes a `conversation_id` that you should save for follow-up questions. User details are stored with the conversation.

2. **Follow-up Question:**
   ```json
   POST /chat
   {
     "disease": "What are the symptoms?",
     "conversation_id": "550e8400-e29b-41d4-a716-446655440000"
   }
   ```
   The chatbot remembers the previous context and answers accordingly. User details from the first message are available for context.

3. **Another Follow-up:**
   ```json
   POST /chat
   {
     "disease": "How is it treated?",
     "conversation_id": "550e8400-e29b-41d4-a716-446655440000"
   }
   ```
   Continues the conversation with full context.

**User Details:**
- `name` (optional): User's name (string)
- `age` (optional): User's age (positive integer)
- `gender` (optional): User's gender (string, e.g., "male", "female", "other")

User details can only be provided when starting a new conversation (when `conversation_id` is not provided). They are stored with the conversation and available for context in all subsequent messages, but the AI will NOT personalize medical advice based on these details per safety rules.

## Features

- **Multi-turn Conversations**: Support for follow-up questions with conversation context
- **Conversation Management**: Each conversation has a unique ID for tracking
- **Context Awareness**: AI remembers previous messages in the conversation
- **Express.js REST API**: Clean and simple API endpoints
- **Worker Threads**: AI processing runs in isolated worker threads
- **SQLite Database**: Stores conversation history and messages
- **Google Search Grounding**: Mandatory grounding verification for accurate information
- **Conversational Responses**: Natural, conversational text responses
- **Safety Rules**: Informational only, no diagnosis or prescriptions
