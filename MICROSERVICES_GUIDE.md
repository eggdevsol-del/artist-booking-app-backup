# Microservices Architecture Implementation Guide

## Overview

This guide explains the microservices architecture implemented for the Artist Booking App, enabling infinite scalability and independent management of features, integrations, UI, and data.

## Architecture Components

### 1. API Gateway (Port 8080)
**Location**: `services/api-gateway/`

**Purpose**: Single entry point for all client requests

**Features**:
- Request routing to microservices
- JWT authentication & authorization
- Rate limiting (100 requests per 15 minutes)
- Request logging
- Error handling
- CORS configuration

**Routes**:
```
/api/auth/*          → Auth Service (3001)
/api/notifications/* → Notification Service (3002)
/api/files/*         → File Service (3003)
/api/messages/*      → Messaging Service (3004)
/api/appointments/*  → Appointments Service (3005)
/api/profiles/*      → Profile Service (3006)
```

**How to Add New Routes**:
1. Add service URL to environment variables
2. Add proxy configuration in `src/index.ts`:
```typescript
app.use('/api/new-service', authMiddleware, createProxyMiddleware({
  target: services.newService,
  pathRewrite: { '^/api/new-service': '' },
}));
```

---

### 2. Notification Service (Port 3002)
**Location**: `services/notification-service/`

**Purpose**: Handle all notifications (push, email, SMS)

**Database**: MongoDB (for templates and subscriptions)

**Features**:
- Push notifications (Web Push API)
- Email notifications (Nodemailer)
- SMS notifications (Twilio)
- Notification templates
- Subscription management
- Queue-based processing (Bull + Redis)

**API Endpoints**:
```
POST /notifications/push
POST /notifications/email
POST /notifications/sms
POST /notifications/appointment-confirmation
GET  /templates
POST /templates
POST /subscriptions
DELETE /subscriptions
```

**Configuration**:
Set environment variables in `.env`:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
```

---

### 3. Infrastructure Services

#### MySQL (Port 3306)
- Primary database for user data, appointments, profiles
- Used by: Auth Service, Profile Service, Appointments Service

#### MongoDB (Port 27017)
- Document database for notifications, messages, logs
- Used by: Notification Service, Messaging Service

#### Redis (Port 6379)
- Caching and session storage
- Job queue for async operations
- Pub/sub for real-time features
- Used by: All services

---

## Running the Microservices

### Development Mode

**Start all services**:
```bash
docker-compose -f docker-compose.microservices.yml up
```

**Start specific services**:
```bash
docker-compose -f docker-compose.microservices.yml up api-gateway notification-service
```

**View logs**:
```bash
docker-compose -f docker-compose.microservices.yml logs -f notification-service
```

**Stop all services**:
```bash
docker-compose -f docker-compose.microservices.yml down
```

### Production Deployment

**Build all services**:
```bash
docker-compose -f docker-compose.microservices.yml build
```

**Deploy to Kubernetes** (example):
```bash
kubectl apply -f k8s/
```

---

## Adding New Microservices

### Step 1: Create Service Directory
```bash
mkdir -p services/new-service/src
cd services/new-service
```

### Step 2: Initialize Package
```bash
npm init -y
npm install express cors dotenv
npm install -D typescript @types/express @types/cors tsx
```

### Step 3: Create TypeScript Config
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true
  }
}
```

### Step 4: Create Main Application File
```typescript
// src/index.ts
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3007;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'new-service' });
});

// Add your routes here

app.listen(PORT, () => {
  console.log(`New Service running on port ${PORT}`);
});
```

### Step 5: Create Dockerfile
```dockerfile
FROM node:22-alpine
WORKDIR /app
RUN npm install -g pnpm
COPY package.json ./
RUN pnpm install
COPY . .
RUN pnpm build
EXPOSE 3007
CMD ["node", "dist/index.js"]
```

### Step 6: Add to docker-compose.microservices.yml
```yaml
new-service:
  build:
    context: ./services/new-service
  container_name: artist-booking-new-service
  environment:
    PORT: 3007
  ports:
    - "3007:3007"
  networks:
    - microservices-network
```

### Step 7: Update API Gateway
Add routing in `services/api-gateway/src/index.ts`:
```typescript
const services = {
  // ... existing services
  newService: process.env.NEW_SERVICE_URL || 'http://localhost:3007',
};

app.use('/api/new-service', authMiddleware, createProxyMiddleware({
  target: services.newService,
  pathRewrite: { '^/api/new-service': '' },
}));
```

---

## Service Communication Patterns

### 1. Synchronous (REST API)
For operations requiring immediate response:
```typescript
// In Service A
const response = await fetch('http://service-b:3002/endpoint', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});
```

### 2. Asynchronous (Message Queue)
For operations that don't need immediate response:
```typescript
import Queue from 'bull';

const queue = new Queue('tasks', 'redis://redis:6379');

// Producer
await queue.add('send-email', { to: 'user@example.com', subject: 'Hello' });

// Consumer
queue.process('send-email', async (job) => {
  await sendEmail(job.data);
});
```

### 3. Event-Driven
For broadcasting events to multiple services:
```typescript
import Redis from 'ioredis';

const redis = new Redis('redis://redis:6379');

// Publisher
await redis.publish('appointment.created', JSON.stringify({ appointmentId: 123 }));

// Subscriber
redis.subscribe('appointment.created');
redis.on('message', (channel, message) => {
  const data = JSON.parse(message);
  // Handle event
});
```

---

## Database Strategy

### Database Per Service Pattern
Each microservice has its own database. Services **cannot** directly access other services' databases.

**Example**:
- Auth Service → MySQL (users table)
- Notification Service → MongoDB (templates, subscriptions)
- Messaging Service → MongoDB (messages)
- Appointments Service → MySQL (appointments table)

### Data Duplication
Some data will be duplicated across services (e.g., user name). This is **intentional** and necessary for service independence.

**Example**:
```
Auth Service stores: { id, email, password, name }
Profile Service stores: { userId, name, bio, avatar }
Messaging Service caches: { userId, name } (for display)
```

### Eventual Consistency
Data may be temporarily inconsistent across services. Use events to sync data:

```typescript
// When user updates profile in Profile Service
await redis.publish('user.profile.updated', JSON.stringify({
  userId: '123',
  name: 'New Name',
  avatar: 'new-avatar.jpg',
}));

// Messaging Service listens and updates cache
redis.subscribe('user.profile.updated');
redis.on('message', async (channel, message) => {
  const { userId, name, avatar } = JSON.parse(message);
  await updateUserCache(userId, { name, avatar });
});
```

---

## Monitoring & Debugging

### Health Checks
Every service has a `/health` endpoint:
```bash
curl http://localhost:8080/health  # API Gateway
curl http://localhost:3002/health  # Notification Service
```

### Logs
View service logs:
```bash
docker-compose -f docker-compose.microservices.yml logs -f notification-service
```

### Distributed Tracing
Add correlation IDs to track requests across services:
```typescript
// In API Gateway
app.use((req, res, next) => {
  req.headers['x-correlation-id'] = req.headers['x-correlation-id'] || uuidv4();
  next();
});

// In each service
app.use((req, res, next) => {
  const correlationId = req.headers['x-correlation-id'];
  console.log(`[${correlationId}] ${req.method} ${req.path}`);
  next();
});
```

---

## Security

### Authentication
- JWT tokens issued by Auth Service
- API Gateway validates tokens
- User info forwarded to services via headers:
  - `x-user-id`
  - `x-user-email`
  - `x-user-role`

### Authorization
Services check user role from headers:
```typescript
app.post('/admin-only', (req, res) => {
  const userRole = req.headers['x-user-role'];
  if (userRole !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  // Process request
});
```

### Rate Limiting
Implemented in API Gateway (100 requests per 15 minutes per IP)

### CORS
Configured in API Gateway:
```typescript
app.use(cors({
  origin: ['http://localhost:5173', 'https://yourdomain.com'],
  credentials: true,
}));
```

---

## Scaling

### Horizontal Scaling
Run multiple instances of a service:
```bash
docker-compose -f docker-compose.microservices.yml up --scale notification-service=3
```

### Load Balancing
Use Nginx or cloud load balancers:
```nginx
upstream notification-service {
  server notification-service-1:3002;
  server notification-service-2:3002;
  server notification-service-3:3002;
}
```

### Auto-Scaling (Kubernetes)
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: notification-service
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: notification-service
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

---

## Migration from Monolith

### Current State
The monolithic app still runs on port 3000 and handles all functionality.

### Migration Strategy

**Phase 1: Dual Mode** (Current)
- Monolith handles all requests
- Microservices run alongside
- API Gateway routes to microservices
- Frontend can call either monolith or API Gateway

**Phase 2: Gradual Migration**
- Move one feature at a time to microservices
- Update frontend to call API Gateway for migrated features
- Keep monolith for non-migrated features

**Phase 3: Complete Migration**
- All features moved to microservices
- Monolith decommissioned
- Frontend only calls API Gateway

### Example: Migrating Notifications

**Before** (Monolith):
```typescript
// Frontend
await fetch('/api/notifications/send', { ... });

// Backend (monolith)
app.post('/api/notifications/send', async (req, res) => {
  await sendNotification(req.body);
  res.json({ success: true });
});
```

**After** (Microservice):
```typescript
// Frontend
await fetch('http://api-gateway:8080/api/notifications/send', { ... });

// API Gateway
app.use('/api/notifications', proxy('http://notification-service:3002'));

// Notification Service
app.post('/send', async (req, res) => {
  await sendNotification(req.body);
  res.json({ success: true });
});
```

---

## Frontend Integration

### Calling Microservices via API Gateway
```typescript
// src/lib/api.ts
const API_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080';

export async function sendNotification(data: any) {
  const response = await fetch(`${API_BASE_URL}/api/notifications/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });
  
  return response.json();
}
```

### Environment Variables
```env
# .env
VITE_API_GATEWAY_URL=http://localhost:8080
```

---

## Testing

### Unit Tests
Test individual service functions:
```typescript
// notification-service/src/__tests__/notificationService.test.ts
import { sendEmail } from '../services/notificationService';

describe('sendEmail', () => {
  it('should send email successfully', async () => {
    const result = await sendEmail({
      to: 'test@example.com',
      subject: 'Test',
      text: 'Hello',
    });
    expect(result).toBeDefined();
  });
});
```

### Integration Tests
Test service interactions:
```typescript
// __tests__/integration/notifications.test.ts
describe('Notification API', () => {
  it('should send notification via API Gateway', async () => {
    const response = await fetch('http://localhost:8080/api/notifications/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ userId: '123', message: 'Test' }),
    });
    expect(response.status).toBe(200);
  });
});
```

### End-to-End Tests
Test complete user flows across multiple services.

---

## Troubleshooting

### Service Won't Start
1. Check logs: `docker-compose logs service-name`
2. Verify environment variables
3. Check database connectivity
4. Ensure ports are not in use

### Service Not Receiving Requests
1. Check API Gateway routing configuration
2. Verify service is running: `curl http://localhost:PORT/health`
3. Check network connectivity between containers
4. Verify CORS settings

### Database Connection Issues
1. Wait for database health check to pass
2. Verify connection string
3. Check database credentials
4. Ensure database is in same network

---

## Best Practices

### 1. Keep Services Small
Each service should do one thing well. If a service is getting too large, split it.

### 2. Design for Failure
- Implement circuit breakers
- Use timeouts
- Handle errors gracefully
- Provide fallbacks

### 3. Use Async Communication
- Use message queues for non-critical operations
- Decouple services with events
- Don't block on external calls

### 4. Monitor Everything
- Log all requests
- Track response times
- Monitor error rates
- Set up alerts

### 5. Version Your APIs
```typescript
app.use('/v1/notifications', notificationRouterV1);
app.use('/v2/notifications', notificationRouterV2);
```

### 6. Document Your Services
- API documentation (Swagger/OpenAPI)
- Architecture diagrams
- Deployment guides
- Troubleshooting guides

---

## Next Steps

### Services to Implement
1. ✅ Notification Service (Complete)
2. ⏳ File Storage Service
3. ⏳ Authentication Service
4. ⏳ Messaging Service
5. ⏳ Appointments Service
6. ⏳ Profile Service
7. ⏳ Consultation Service
8. ⏳ Policy Service
9. ⏳ Quick Actions Service
10. ⏳ Social Integration Service

### Infrastructure Improvements
- [ ] Service registry (Consul/Eureka)
- [ ] Distributed tracing (Jaeger)
- [ ] Centralized logging (ELK Stack)
- [ ] Metrics collection (Prometheus + Grafana)
- [ ] API documentation (Swagger)
- [ ] CI/CD pipelines
- [ ] Kubernetes deployment
- [ ] Auto-scaling policies

### Frontend Improvements
- [ ] Module Federation (micro-frontends)
- [ ] Service worker for offline support
- [ ] Progressive Web App features
- [ ] Optimistic UI updates
- [ ] Real-time updates (WebSocket)

---

## Support

For questions or issues:
1. Check this guide
2. Review service logs
3. Check API Gateway logs
4. Verify environment configuration
5. Test individual services in isolation

---

## Conclusion

This microservices architecture provides:
- ✅ Infinite scalability (scale services independently)
- ✅ Independent deployment (deploy services without affecting others)
- ✅ Technology flexibility (use best tool for each job)
- ✅ Team autonomy (different teams own different services)
- ✅ Fault isolation (if one service fails, others continue)
- ✅ Easy integration management (add/remove integrations as services)

You can now add, remove, and modify features independently without affecting the entire application!
