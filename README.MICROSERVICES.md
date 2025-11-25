# Artist Booking App - Microservices Architecture

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 22+ (for local development)
- pnpm (for local development)

### Start All Services
```bash
docker-compose -f docker-compose.microservices.yml up
```

### Access Points
- **API Gateway**: http://localhost:8080
- **Notification Service**: http://localhost:3002
- **Legacy App**: http://localhost:3000
- **MySQL**: localhost:3306
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379

### Health Checks
```bash
curl http://localhost:8080/health  # API Gateway
curl http://localhost:3002/health  # Notification Service
```

## 📦 Architecture Overview

```
┌─────────────────┐
│   Frontend      │
│  (React App)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  API Gateway    │  ← Single entry point
│   (Port 8080)   │  ← Authentication
└────────┬────────┘  ← Rate limiting
         │           ← Request routing
         │
    ┌────┴────┬────────┬────────┬────────┐
    ▼         ▼        ▼        ▼        ▼
┌────────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│  Auth  │ │Notif │ │ File │ │ Msg  │ │Appts │
│Service │ │Service│ │Service│ │Service│ │Service│
└───┬────┘ └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘
    │         │        │        │        │
    ▼         ▼        ▼        ▼        ▼
┌────────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│ MySQL  │ │MongoDB│ │  S3  │ │MongoDB│ │ MySQL│
└────────┘ └──────┘ └──────┘ └──────┘ └──────┘
```

## 🎯 Implemented Services

### ✅ API Gateway (Port 8080)
- Request routing
- JWT authentication
- Rate limiting
- CORS handling
- Error handling

### ✅ Notification Service (Port 3002)
- Push notifications (Web Push)
- Email notifications (SMTP)
- SMS notifications (Twilio)
- Notification templates
- Queue-based processing

### ⏳ Coming Soon
- File Storage Service (S3 uploads)
- Authentication Service (JWT, OAuth)
- Messaging Service (Real-time chat)
- Appointments Service (Booking, calendar)
- Profile Service (User profiles, settings)

## 🛠️ Development

### Run Individual Service
```bash
cd services/notification-service
pnpm install
pnpm dev
```

### Build Service
```bash
cd services/notification-service
pnpm build
```

### Add New Service
See [MICROSERVICES_GUIDE.md](./MICROSERVICES_GUIDE.md#adding-new-microservices) for detailed instructions.

## 🔧 Configuration

### Environment Variables

Create `.env` file in project root:

```env
# API Gateway
JWT_SECRET=your-secret-key-change-in-production
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Notification Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@artistbooking.com

# Twilio (SMS)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890

# Web Push
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_EMAIL=admin@artistbooking.com

# Databases
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=artist_booking
MYSQL_USER=artist_user
MYSQL_PASSWORD=artist_password
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=adminpassword
```

## 📊 Monitoring

### View Logs
```bash
# All services
docker-compose -f docker-compose.microservices.yml logs -f

# Specific service
docker-compose -f docker-compose.microservices.yml logs -f notification-service
```

### Check Service Status
```bash
docker-compose -f docker-compose.microservices.yml ps
```

## 🧪 Testing

### Test Notification Service
```bash
# Send email
curl -X POST http://localhost:8080/api/notifications/email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "to": "user@example.com",
    "subject": "Test Email",
    "text": "Hello from microservices!"
  }'

# Send push notification
curl -X POST http://localhost:8080/api/notifications/push \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "userId": "123",
    "title": "Test Notification",
    "body": "This is a test push notification"
  }'
```

## 📚 Documentation

- **[MICROSERVICES_GUIDE.md](./MICROSERVICES_GUIDE.md)** - Complete implementation guide
- **[Architecture Blueprint](./microservices_blueprint.md)** - Detailed architecture design
- **[Research](./microservices_research.md)** - Microservices patterns and best practices

## 🚢 Deployment

### Docker Compose (Development/Staging)
```bash
docker-compose -f docker-compose.microservices.yml up -d
```

### Kubernetes (Production)
```bash
# Coming soon
kubectl apply -f k8s/
```

## 🔐 Security

- JWT authentication via API Gateway
- Rate limiting (100 req/15min per IP)
- CORS protection
- Helmet.js security headers
- Environment-based secrets
- Service-to-service authentication via headers

## 🎯 Benefits

### Scalability
- Scale services independently based on load
- Add more instances of high-traffic services
- Optimize resources per service

### Independence
- Deploy services without affecting others
- Use different technologies per service
- Teams can work independently

### Resilience
- If one service fails, others continue
- Circuit breakers prevent cascade failures
- Graceful degradation

### Flexibility
- Add new features as new services
- Remove services without breaking others
- Easy A/B testing and feature flags

## 🐛 Troubleshooting

### Service won't start
1. Check logs: `docker-compose logs service-name`
2. Verify environment variables in `.env`
3. Ensure ports are not in use
4. Check database health: `docker-compose ps`

### Can't connect to service
1. Verify service is running: `curl http://localhost:PORT/health`
2. Check API Gateway routing
3. Verify network connectivity
4. Check CORS settings

### Database connection failed
1. Wait for health check to pass
2. Verify credentials in `.env`
3. Check database is in same Docker network
4. Review connection string format

## 📈 Roadmap

### Phase 1 (Current)
- [x] Docker environment
- [x] API Gateway
- [x] Notification Service
- [x] Documentation

### Phase 2 (Next)
- [ ] File Storage Service
- [ ] Authentication Service
- [ ] Messaging Service

### Phase 3
- [ ] Appointments Service
- [ ] Profile Service
- [ ] Service Registry (Consul)
- [ ] Distributed Tracing (Jaeger)

### Phase 4
- [ ] Kubernetes deployment
- [ ] CI/CD pipelines
- [ ] Monitoring (Prometheus + Grafana)
- [ ] Centralized logging (ELK)

## 🤝 Contributing

1. Create new service in `services/` directory
2. Follow the structure of existing services
3. Add Dockerfile and update docker-compose
4. Update API Gateway routing
5. Document in MICROSERVICES_GUIDE.md
6. Test thoroughly
7. Submit pull request

## 📝 License

Same as main application

## 🆘 Support

- Read [MICROSERVICES_GUIDE.md](./MICROSERVICES_GUIDE.md)
- Check service logs
- Verify configuration
- Test services individually
- Review architecture blueprint

---

**Ready to scale infinitely! 🚀**
