# AI Health Assistant - React 19 Migration

This project has been migrated from plain JavaScript to React 19 with Vite.

## Project Structure

```
AiHealthSupport/
├── src/
│   ├── components/
│   │   ├── Header.jsx          # App header component
│   │   ├── Chat.jsx            # Main chat container
│   │   ├── ChatInput.jsx       # Input area component
│   │   ├── Message.jsx         # Message components (User, Assistant, Error)
│   │   └── TypingIndicator.jsx  # Typing animation
│   ├── utils/
│   │   ├── api.js              # API communication
│   │   └── markdown.js         # Markdown to HTML converter
│   ├── App.jsx                 # Main App component
│   ├── main.jsx                # React entry point
│   └── index.css              # Global styles (Tailwind CSS)
├── dist/                       # Build output (generated)
├── vite.config.js             # Vite configuration
├── index.html                  # HTML template
└── server.js                   # Express backend server

```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

This will install:
- React 19
- React DOM 19
- Vite (build tool)
- All existing backend dependencies

### 2. Development Mode

Run the development server (Vite dev server on port 5173):

```bash
npm run dev
```

The Vite dev server will:
- Serve the React app on `http://localhost:5173`
- Proxy API requests to `http://localhost:3000` (your Express server)

**Important:** You need to run the Express server separately:

```bash
# In a separate terminal
npm start
# or
node server.js
```

The Express server runs on port 3000 and handles the `/chat` API endpoint.

### 3. Production Build

Build the React app for production:

```bash
npm run build
```

This creates an optimized build in the `dist/` directory.

### 4. Production Server

In production, the Express server will serve the built React app:

```bash
NODE_ENV=production npm start
```

The server will:
- Serve static files from `dist/` directory
- Handle API requests at `/chat`

## Development Workflow

1. **Start Express backend:**
   ```bash
   npm start
   ```

2. **Start Vite dev server (in another terminal):**
   ```bash
   npm run dev
   ```

3. **Open browser:**
   Navigate to `http://localhost:5173`

## Key Changes from Plain JS

1. **Component-based architecture:** All UI is now React components
2. **State management:** Using React hooks (useState, useEffect, useRef)
3. **Build system:** Vite for fast development and optimized builds
4. **Modern React:** Using React 19 features
5. **Same styling:** CSS remains the same, imported in main.jsx

## Features Preserved

- ✅ ChatGPT-style dark theme UI
- ✅ Markdown formatting in responses
- ✅ Typing indicators
- ✅ Auto-scroll
- ✅ Structured disease information display
- ✅ Conversational responses
- ✅ Error handling
- ✅ All existing functionality

## Troubleshooting

### Port conflicts
- Vite dev server uses port 5173
- Express server uses port 3000
- Change ports in `vite.config.js` if needed

### Build issues
- Clear `dist/` folder and rebuild: `rm -rf dist && npm run build`

### API not working
- Ensure Express server is running on port 3000
- Check Vite proxy configuration in `vite.config.js`

