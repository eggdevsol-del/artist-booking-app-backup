import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/logger';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);

// Request logging
app.use(requestLogger);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Service endpoints configuration
const services = {
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  notifications: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3002',
  files: process.env.FILE_SERVICE_URL || 'http://localhost:3003',
  messaging: process.env.MESSAGING_SERVICE_URL || 'http://localhost:3004',
  appointments: process.env.APPOINTMENTS_SERVICE_URL || 'http://localhost:3005',
  profiles: process.env.PROFILE_SERVICE_URL || 'http://localhost:3006',
};

// Proxy configuration
const proxyOptions = {
  changeOrigin: true,
  logLevel: 'debug' as const,
  onError: (err: Error, req: express.Request, res: express.Response) => {
    console.error('Proxy error:', err);
    res.status(502).json({ error: 'Bad Gateway', message: err.message });
  },
};

// Public routes (no authentication required)
app.use('/api/auth/login', createProxyMiddleware({
  ...proxyOptions,
  target: services.auth,
  pathRewrite: { '^/api/auth': '' },
}));

app.use('/api/auth/signup', createProxyMiddleware({
  ...proxyOptions,
  target: services.auth,
  pathRewrite: { '^/api/auth': '' },
}));

app.use('/api/auth/me', createProxyMiddleware({
  ...proxyOptions,
  target: services.auth,
  pathRewrite: { '^/api/auth': '' },
}));

// Protected routes (authentication required)
app.use('/api/auth', authMiddleware, createProxyMiddleware({
  ...proxyOptions,
  target: services.auth,
  pathRewrite: { '^/api/auth': '' },
}));

app.use('/api/notifications', authMiddleware, createProxyMiddleware({
  ...proxyOptions,
  target: services.notifications,
  pathRewrite: { '^/api/notifications': '' },
}));

app.use('/api/files', authMiddleware, createProxyMiddleware({
  ...proxyOptions,
  target: services.files,
  pathRewrite: { '^/api/files': '' },
}));

app.use('/api/messages', authMiddleware, createProxyMiddleware({
  ...proxyOptions,
  target: services.messaging,
  pathRewrite: { '^/api/messages': '' },
}));

app.use('/api/conversations', authMiddleware, createProxyMiddleware({
  ...proxyOptions,
  target: services.messaging,
  pathRewrite: { '^/api/conversations': '' },
}));

app.use('/api/appointments', authMiddleware, createProxyMiddleware({
  ...proxyOptions,
  target: services.appointments,
  pathRewrite: { '^/api/appointments': '' },
}));

app.use('/api/profiles', authMiddleware, createProxyMiddleware({
  ...proxyOptions,
  target: services.profiles,
  pathRewrite: { '^/api/profiles': '' },
}));

app.use('/api/artist-settings', authMiddleware, createProxyMiddleware({
  ...proxyOptions,
  target: services.profiles,
  pathRewrite: { '^/api/artist-settings': '' },
}));

// Fallback for unknown routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'Not Found', message: 'API endpoint not found' });
});

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`📡 Service endpoints:`);
  Object.entries(services).forEach(([name, url]) => {
    console.log(`   - ${name}: ${url}`);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});
