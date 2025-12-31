# AI Health Support

AI-powered health information chatbot with React 19 + Vite SSR frontend and Express.js backend. Uses Google Gemini API with Google Search grounding for accurate health information.

## 🏗️ Project Structure

```
AiHealthSupport/
├── frontend/                    # React 19 + Vite SSR Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chat.jsx            # Main chat container with optimistic updates
│   │   │   ├── ChatInput.jsx       # Message input with auto-resize
│   │   │   ├── ChatWrapper.jsx     # React 19 useActionState form handling
│   │   │   ├── Header.jsx          # App header with disclaimer
│   │   │   ├── Message.jsx         # User, Assistant, Error message components
│   │   │   └── TypingIndicator.jsx # Loading animation
│   │   ├── utils/
│   │   │   ├── api.js              # Backend API communication
│   │   │   └── markdown.js         # Markdown to HTML converter (XSS safe)
│   │   ├── App.jsx                 # Main App component
│   │   ├── entry-client.jsx        # Client-side hydration entry
│   │   ├── entry-server.jsx        # Server-side render entry
│   │   └── index.css               # Tailwind CSS + Custom styles
│   ├── index.html                  # HTML template
│   ├── server.js                   # SSR Express server
│   ├── vite.config.js              # Vite configuration
│   ├── tailwind.config.js          # Tailwind CSS configuration
│   ├── postcss.config.js           # PostCSS configuration
│   └── package.json                # Frontend dependencies
│
├── backend/                     # Express.js API Server
│   ├── server.js                   # Main server entry point
│   ├── routes/
│   │   └── chat.routes.js          # Chat API route definitions
│   ├── controllers/
│   │   └── chat.controller.js      # HTTP request/response handling
│   ├── services/
│   │   ├── ai.service.js           # Gemini worker thread management
│   │   └── chat.service.js         # Chat business logic & orchestration
│   ├── db/
│   │   ├── database.js             # SQLite database initialization
│   │   └── models/
│   │       └── conversation.model.js   # Conversation data access layer
│   ├── utils/
│   │   ├── config.js               # Environment configuration
│   │   ├── errorHandler.js         # Express error handling wrapper
│   │   ├── logger.js               # Centralized logging utility
│   │   ├── prompts.js              # AI prompt builders (DRY principle)
│   │   ├── responseParser.js       # AI response JSON parser
│   │   └── validators.js           # Input validation utilities
│   ├── workers/
│   │   └── gemini.worker.js        # Gemini API worker thread
│   ├── data/
│   │   └── healthchat.db           # SQLite database file (auto-created)
│   └── package.json                # Backend dependencies
│
└── README.md
```

## ✨ Features

- 🤖 **AI Health Information** - Google Gemini API with Google Search grounding
- 💬 **Multi-turn Conversations** - Context-aware follow-up questions
- 🌐 **Server-Side Rendering** - React 19 + Vite SSR for fast initial load
- ⚡ **React 19 Features** - useActionState, useOptimistic, useFormStatus
- 🗄️ **Conversation Persistence** - SQLite database storage
- 🧵 **Worker Threads** - Non-blocking AI API calls
- 🌍 **Multi-language Support** - English, Hindi, Hinglish responses
- 🎨 **Modern Dark UI** - ChatGPT-style interface with Tailwind CSS
- ♿ **Accessible** - Keyboard navigation, screen reader support

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Google Gemini API Key ([Get one here](https://makersuite.google.com/app/apikey))

### 1. Clone & Install

```bash
# Clone the repository
git clone <repository-url>
cd AiHealthSupport

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

Create `backend/.env` file:

```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3001
```

(Optional) Create `frontend/.env` file:

```env
VITE_BACKEND_URL=http://localhost:3001
```

### 3. Start Development Servers

**Terminal 1 - Backend (API Server):**
```bash
cd backend
npm run dev
# ✅ Running on http://localhost:3001
```

**Terminal 2 - Frontend (SSR Server):**
```bash
cd frontend
npm run dev
# ✅ Running on http://localhost:5173
```

### 4. Open Application

Navigate to `http://localhost:5173` in your browser.

## 📡 API Reference

### POST /chat

Send a health query and receive AI-generated information.

**New Conversation:**
```json
{
  "disease": "What is diabetes?",
  "name": "John",          // Optional
  "age": 30,               // Optional
  "gender": "male"         // Optional
}
```

**Follow-up Question:**
```json
{
  "disease": "What are the symptoms?",
  "conversation_id": "uuid-from-previous-response"
}
```

**Response (Disease Information):**
```json
{
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
  "response": {
    "disease": "Diabetes",
    "description": "A chronic condition affecting blood sugar regulation...",
    "causes": ["Genetics", "Obesity", "Sedentary lifestyle"],
    "commonly_used_medicines": [
      {
        "name": "Metformin",
        "note": "Consult a doctor before use"
      }
    ]
  }
}
```

**Response (Conversational):**
```json
{
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
  "response": {
    "response": "Common symptoms of diabetes include increased thirst..."
  }
}
```

## 🏭 Production Build

### Build Frontend

```bash
cd frontend
npm run build
```

Creates optimized bundles in `frontend/dist/`:
- `dist/client/` - Static assets for browser
- `dist/server/` - SSR server bundle

### Run Production

```bash
# Terminal 1 - Backend
cd backend
NODE_ENV=production npm start

# Terminal 2 - Frontend
cd frontend
NODE_ENV=production npm start
```

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 19 | UI library with latest features |
| Vite | Build tool with SSR support |
| Tailwind CSS | Utility-first styling |
| Express | SSR server |

### Backend
| Technology | Purpose |
|------------|---------|
| Express.js | REST API server |
| SQLite3 | Conversation storage |
| Google Gemini API | AI responses with search grounding |
| Worker Threads | Non-blocking AI processing |

## 🔄 Intent Detection

The system detects user intent to provide appropriate responses:

| Intent | Description | Example |
|--------|-------------|---------|
| `disease_information` | New disease query | "What is diabetes?" |
| `follow_up_question` | Question about current topic | "What are the symptoms?" |
| `cost_or_lifestyle` | Cost, diet, exercise queries | "What diet should I follow?" |
| `severity_or_duration` | Severity, recovery questions | "How serious is it?" |
| `new_topic` | Switch to different disease | "Tell me about asthma" |
| `hospital_or_doctor_recommendation` | Healthcare facility queries | "Best hospital for this?" |
| `medicine_information` | Medicine details | "What is Metformin used for?" |

## 📁 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Frontend SSR Server (Port 5173)                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Vite Dev Server / Express Production Server         │    │
│  │  - Server-side rendering                             │    │
│  │  - Static file serving                               │    │
│  │  - Client hydration                                  │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ API Calls
┌─────────────────────────────────────────────────────────────┐
│               Backend API Server (Port 3001)                 │
│  ┌──────────┐  ┌────────────┐  ┌────────────────────────┐   │
│  │  Routes  │→ │ Controller │→ │       Services         │   │
│  └──────────┘  └────────────┘  │  ┌──────────────────┐  │   │
│                                │  │   Chat Service    │  │   │
│                                │  │  - Intent detect  │  │   │
│                                │  │  - Response gen   │  │   │
│                                │  └──────────────────┘  │   │
│                                │  ┌──────────────────┐  │   │
│                                │  │   AI Service     │  │   │
│                                │  │  - Worker mgmt   │  │   │
│                                │  └──────────────────┘  │   │
│                                └────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                    Worker Thread                      │   │
│  │  - Gemini API calls                                   │   │
│  │  - Google Search grounding                            │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                   SQLite Database                     │   │
│  │  - Conversations table                                │   │
│  │  - Messages table                                     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Google Gemini API                         │
│  - gemini-2.5-pro model                                      │
│  - Google Search grounding for accuracy                      │
└─────────────────────────────────────────────────────────────┘
```

## ⚙️ Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GEMINI_API_KEY` | ✅ Yes | - | Google Gemini API key |
| `PORT` | No | 3001 | API server port |
| `DB_PATH` | No | ./data/healthchat.db | SQLite database path |
| `LOG_LEVEL` | No | INFO | Logging level (ERROR, WARN, INFO, DEBUG) |

### Frontend (`frontend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_BACKEND_URL` | No | http://localhost:3001 | Backend API URL |
| `PORT` | No | 5173 | SSR server port |

## 📝 Important Notes

- ⚠️ **Medical Disclaimer**: This application provides general health information only, not medical advice
- 🔒 **No Diagnosis**: The AI does not provide personalized diagnosis or treatment plans
- 💊 **No Dosage**: Medicine information excludes specific dosages
- 🏥 **Consult Doctors**: Always consult healthcare professionals for medical concerns

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.
