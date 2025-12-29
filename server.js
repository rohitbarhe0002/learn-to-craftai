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

// Middleware
app.use(express.json());

// Serve static files from public directory
app.use(express.static('public'));

// Initialize database
try {
  await initDatabase();
  logInfo('Database initialization completed');
} catch (error) {
  logError('Failed to initialize database', error);
  process.exit(1);
}

// Routes
app.use('/chat', chatRoutes);

// Start server
app.listen(config.port, () => {
  logInfo('Server started successfully', {
    port: config.port,
    chatEndpoint: `POST http://localhost:${config.port}/chat`
  });
});
