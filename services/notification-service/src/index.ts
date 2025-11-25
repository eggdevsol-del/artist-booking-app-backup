import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { notificationRouter } from './routes/notifications';
import { templateRouter } from './routes/templates';
import { subscriptionRouter } from './routes/subscriptions';
import { initializeDatabase } from './database';
import { initializeQueue } from './queue';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'notification-service', timestamp: new Date().toISOString() });
});

// Routes
app.use('/notifications', notificationRouter);
app.use('/templates', templateRouter);
app.use('/subscriptions', subscriptionRouter);

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Initialize database and queue
async function start() {
  try {
    await initializeDatabase();
    await initializeQueue();
    
    app.listen(PORT, () => {
      console.log(`🔔 Notification Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start notification service:', error);
    process.exit(1);
  }
}

start();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});
