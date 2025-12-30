import express from 'express';
import { initDatabase } from './db/database.js';
import chatRoutes from './routes/chat.routes.js';
import { config } from './utils/config.js';
import { logInfo, logError } from './utils/logger.js';

/**
 * Main Server Entry Point
 * Initializes Express app, database, and routes
 */

const app = express();
app.use(express.json());

// CORS middleware - allow frontend to call API
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Serve static files from frontend/dist directory (React build) in production
// In development, Vite dev server handles static files
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('../frontend/dist'));
}

// Initialize database
try {
  await initDatabase();
  logInfo('Database initialization completed');
} catch (error) {
  logError('Failed to initialize database', error);
  process.exit(1);
}

app.use('/chat', chatRoutes);

// Start server
app.listen(config.port, () => {
  logInfo('Server started successfully', {
    port: config.port,
    chatEndpoint: `POST http://localhost:${config.port}/chat`
  });
});
