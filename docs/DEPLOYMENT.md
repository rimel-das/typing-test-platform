# Deployment Guide: Typing Test Platform

## Infrastructure Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CDN (Cloudflare)                     │
│                   Static Assets Distribution                 │
└──────────────────────────┬──────────────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
      ┌────▼────┐     ┌────▼────┐   ┌────▼────┐
      │Vercel   │     │Vercel   │   │Vercel   │
      │Edge     │     │Edge     │   │Edge     │
      │Server   │     │Server   │   │Server   │
      └────┬────┘     └────┬────┘   └────┬────┘
           │               │               │
           └───────────────┼───────────────┘
                           │
                  ┌────────▼────────┐
                  │   API Gateway   │
                  │   (AWS API GW)  │
                  └────────┬────────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
      ┌────▼────────┐ ┌────▼────────┐ ┌──▼──────────┐
      │ Railway App │ │ Railway App │ │ Railway App │
      │  (Backend)  │ │  (Backend)  │ │ (Backend)   │
      │     #1      │ │     #2      │ │     #3      │
      └────┬────────┘ └────┬────────┘ └──┬──────────┘
           │               │               │
           └───────────────┼───────────────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
      ┌────▼────────┐      │        ┌──────▼────┐
      │  PostgreSQL │      │        │   Redis   │
      │  (Railway)  │      │        │ (Railway) │
      └─────────────┘      │        └───────────┘
                           │
                      ┌────▼────┐
                      │   S3    │
                      │  (AWS)  │
                      └─────────┘
```

## Deployment Options

### Option 1: Vercel (Frontend) + Railway (Backend)

**Best for:**

- Rapid deployment
- Automatic scaling
- Free tier available
- Global edge network (Vercel)

**Setup:**

#### Frontend (Vercel)

```bash
# 1. Push frontend to GitHub
cd frontend
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/typing-test-frontend

# 2. Deploy to Vercel
npm install -g vercel
vercel deploy

# Set environment variables
vercel env add VITE_API_URL https://your-backend.railway.app
```

#### Backend (Railway)

```bash
# 1. Create account on Railway.app
# 2. Connect GitHub repository
# 3. Set up environment variables in Railway dashboard:

DATABASE_URL=postgresql://...
JWT_SECRET=your_secret_key_min_32_chars
NODE_ENV=production
PORT=5000
REDIS_URL=redis://...
CORS_ORIGIN=https://your-frontend.vercel.app
```

**Database Setup:**

```bash
# Railway PostgreSQL
# 1. Add PostgreSQL plugin in Railway
# 2. Get connection string
# 3. Run migrations:
npm run migrate
```

### Option 2: AWS (Full Stack)

**Architecture:**

- **Frontend**: CloudFront + S3 + Lambda@Edge
- **Backend**: ECS/Fargate + ALB
- **Database**: RDS PostgreSQL + ElastiCache (Redis)
- **Storage**: S3

**Setup:**

```bash
# Build frontend
cd frontend
npm run build

# Deploy to S3
aws s3 sync dist/ s3://your-typing-test-frontend/

# CloudFront distribution
aws cloudfront create-distribution \
  --origin-domain-name your-typing-test-frontend.s3.amazonaws.com \
  --default-root-object index.html

# Backend ECS Task Definition
aws ecs register-task-definition --cli-input-json file://task-definition.json

# Create load balancer
aws elbv2 create-load-balancer \
  --name typing-test-alb \
  --subnets subnet-xxxxx
```

### Option 3: Docker + Kubernetes

**Docker Setup:**

```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 5000
CMD ["node", "dist/server.js"]

# Frontend Dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Kubernetes Deployment:**

```yaml
# backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: typing-test-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: typing-test-backend
  template:
    metadata:
      labels:
        app: typing-test-backend
    spec:
      containers:
        - name: backend
          image: your-registry/typing-test-backend:latest
          ports:
            - containerPort: 5000
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: db-credentials
                  key: connection-string
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: typing-test-backend
spec:
  selector:
    app: typing-test-backend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 5000
  type: LoadBalancer
```

## Environment Variables

### Backend

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/typing_db
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=secure_password
DB_NAME=typing_db

# Server
PORT=5000
NODE_ENV=production

# JWT
JWT_SECRET=your_super_secret_key_min_32_chars_long
JWT_EXPIRY=7d

# Redis
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

# CORS
CORS_ORIGIN=https://yourdomain.com

# Socket.io
SOCKET_IO_CORS_ORIGIN=https://yourdomain.com

# Monitoring
LOG_LEVEL=info
SENTRY_DSN=https://...
```

### Frontend

```env
VITE_API_URL=https://api.yourdomain.com
VITE_APP_NAME=TypingTest
VITE_LOG_LEVEL=info
```

## Performance Optimization

### Caching Strategy

```typescript
// Server-side caching
const cache = new Map<string, CacheEntry>();

function getCachedLeaderboard(period: string): Leaderboard | null {
  const cached = cache.get(`leaderboard:${period}`);
  if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
    return cached.data;
  }
  return null;
}

// Redis caching for tests
await redis.setex(
  `leaderboard:${period}`,
  300, // 5 minute TTL
  JSON.stringify(leaderboard),
);
```

### Database Optimization

```sql
-- Connection pooling (configured in backend)
-- Max connections: 20
-- Idle timeout: 30s

-- Query optimization
CREATE INDEX idx_tests_user_created ON typing_tests(user_id, created_at DESC);
CREATE INDEX idx_tests_difficulty ON typing_tests(difficulty);

-- Materialized views for leaderboard
CREATE MATERIALIZED VIEW leaderboard_daily AS
SELECT
  u.id,
  u.username,
  AVG(t.wpm) as avg_wpm,
  MAX(t.wpm) as max_wpm,
  COUNT(*) as tests_completed
FROM users u
LEFT JOIN typing_tests t ON u.id = t.user_id
  AND t.created_at > NOW() - INTERVAL '1 day'
GROUP BY u.id, u.username
ORDER BY avg_wpm DESC;

-- Refresh periodically
REFRESH MATERIALIZED VIEW leaderboard_daily;
```

### Frontend Optimization

```typescript
// Code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const TestPage = lazy(() => import('./pages/TestPage'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));

// Image optimization
<img
  src={avatar}
  alt="User"
  loading="lazy"
  srcSet={`${avatar} 1x, ${avatar2x} 2x`}
/>

// Bundle size reduction
// - Zustand instead of Redux (18KB vs 40KB)
// - Vite for faster builds
// - Tree-shaking unused code
```

## Monitoring & Logging

### Sentry Integration (Error Tracking)

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  beforeSend(event) {
    // Filter sensitive data
    return event;
  },
});

// Capture errors
Sentry.captureException(error);
```

### Datadog Integration (Metrics)

```typescript
import { StatsD } from "node-statsd";

const client = new StatsD();

// Track typing test completion
client.increment("typing_test.completed", 1, {
  difficulty,
  wpm: Math.round(wpm),
  accuracy: Math.round(accuracy),
});

// Track API response time
client.histogram("api.response_time", responseTime);
```

## Scaling Strategy for 10k+ Users

### Phase 1: Foundation (1k-5k users)

- Single backend instance
- PostgreSQL with connection pooling
- Redis for sessions
- CloudFlare for CDN

### Phase 2: Growth (5k-50k users)

- **Backend**: 2-3 instances behind load balancer
- **Database**: Read replicas for analytics queries
- **Caching**: Distributed Redis cluster
- **Real-time**: Dedicated WebSocket cluster

### Phase 3: Scale (50k+ users)

- **Backend**: Auto-scaling group (5-20 instances)
- **Database**:
  - Write master + 3 read replicas
  - Sharding by user_id for tests table
- **Cache**: Redis Cluster 6-node setup
- **Real-time**: Multiple Socket.io servers with Redis adapter
- **Message Queue**: RabbitMQ for async operations
- **Search**: Elasticsearch for user search/profiles
- **CDN**: Multi-region with edge caching

### Database Sharding Strategy

```typescript
// Shard by user ID
function getShardId(userId: string): number {
  const hash = crypto.createHash("md5").update(userId).digest("hex");
  return parseInt(hash.substring(0, 8), 16) % SHARD_COUNT;
}

// Connection routing
const shardConnections = new Map<number, Pool>();

async function getTestsForUser(userId: string) {
  const shardId = getShardId(userId);
  const pool = shardConnections.get(shardId);
  return pool.query("SELECT * FROM typing_tests WHERE user_id = $1", [userId]);
}
```

### Real-time Optimization

```typescript
// Redis adapter for Socket.io clustering
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

const pubClient = createClient({ host: 'localhost', port: 6379 });
const subClient = pubClient.duplicate();

io.adapter(createAdapter(pubClient, subClient));

// Enable compression
io.engine.compress((data) => {
  // Custom compression logic
};
```

## Deployment Checklist

- [ ] Environment variables set
- [ ] Database migrations run
- [ ] SSL certificate installed
- [ ] Cache cleared
- [ ] CDN configured
- [ ] Monitoring enabled
- [ ] Backups configured
- [ ] Health checks configured
- [ ] Auto-scaling policies set
- [ ] Staging environment tested
- [ ] Database backed up
- [ ] Security headers configured

## Rollback Procedure

```bash
# Vercel auto-rollback
vercel rollback

# Manual rollback
git revert <commit-hash>
git push origin main

# Database rollback
# Keep migrations reversible with DOWN function
npm run migrate:down
```

## Cost Estimation (Monthly)

### Vercel + Railway Setup

- Vercel: $0-20 (Pro for team features)
- Railway: $5-50 (database, backend, caching)
- **Total: $5-70/month** for 10k users

### AWS Setup

- EC2: $100-300 (multiple instances)
- RDS: $50-150 (managed PostgreSQL)
- ElastiCache: $20-50 (Redis)
- S3 + CloudFront: $10-40
- **Total: $180-540/month** for 10k users

### Kubernetes Setup

- Cloud provider fees: $200-500
- Managed services: $50-150
- Monitoring: $50-100
- **Total: $300-750/month** for 10k users
