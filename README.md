# TypingTest Platform - Production-Ready Typing Speed Testing

A fully-featured, production-grade typing test platform similar to Monkeytype, built with modern technologies.

## 🚀 Features

### Core Features

- ✅ Real-time typing test with live character highlighting (green/red)
- ✅ WPM (Words Per Minute) and accuracy calculations
- ✅ Multiple timer modes (15s, 30s, 60s, 120s, custom)
- ✅ Difficulty levels (easy, normal, hard)
- ✅ Test modes (time, words, quote, zen)
- ✅ Test types (normal, punctuation, numbers)
- ✅ Real-time statistics during test
- ✅ Consistency metric calculation

### Advanced Features

- ✅ User authentication with JWT
- ✅ User profiles and avatars
- ✅ Complete typing history tracking
- ✅ Progress graphs and analytics
- ✅ Personal best records per difficulty
- ✅ Global leaderboard system
- ✅ Multiplayer racing with WebSockets
- ✅ Dark/Light theme toggle
- ✅ Custom theme support
- ✅ Sound effects toggle
- ✅ Mistake heatmap

### Security Features

- ✅ Copy-paste detection
- ✅ Tab switching detection
- ✅ Unrealistic speed detection
- ✅ bcryptjs password hashing
- ✅ CORS protection
- ✅ Rate limiting
- ✅ Input validation & sanitization
- ✅ JWT-based authentication

## 🏗️ Architecture

### Frontend

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand
- **Real-time**: Socket.io-client
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Routing**: React Router v6

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Real-time**: Socket.io + Redis
- **Authentication**: JWT + bcryptjs
- **Caching**: Redis
- **Validation**: express-validator

### Database

- PostgreSQL with connection pooling
- Optimized indexes for high-volume queries
- Materialized views for leaderboards
- Automatic timestamp management

## 📊 Project Structure

```
typing project/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/      # Route handlers
│   │   ├── middleware/       # Express middleware
│   │   ├── models/           # Database models/services
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   ├── utils/            # Utilities (JWT, crypto, etc.)
│   │   ├── websocket/        # Socket.io handlers
│   │   └── server.ts         # Main server file
│   ├── migrations/           # Database migrations
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── context/          # Zustand stores
│   │   ├── hooks/            # Custom hooks
│   │   ├── pages/            # Page components
│   │   ├── services/         # API service
│   │   ├── styles/           # Global styles
│   │   ├── utils/            # Utilities
│   │   ├── App.tsx           # Main App
│   │   └── main.tsx          # Entry point
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── tailwind.config.js
├── docs/
│   ├── ARCHITECTURE.md       # System architecture
│   ├── DEPLOYMENT.md         # Deployment guide
│   ├── API.md                # API documentation
│   └── README.md             # This file
└── .gitignore
```

## 🎯 Core Algorithms

### WPM Calculation

```
WPM = (Correct Characters / 5) / Time in Minutes
Example: 250 chars typed correctly in 1 minute = 50 WPM
```

### Accuracy Calculation

```
Accuracy = (Correct Characters / Total Characters in Prompt) × 100
Example: 245 correct out of 250 = 98% accuracy
```

### Consistency Metric

```
Consistency = (1 - StdDev / Mean) × 100
Measures typing speed stability throughout the session
```

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ (Frontend + Backend)
- PostgreSQL 12+ (Database)
- Redis 6+ (Caching & Real-time)
- npm or yarn

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Configure your environment variables
# Edit .env with your database credentials

# Run database migrations
npm run migrate

# Start development server
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on `http://localhost:3000`

## 📌 API Endpoints

### Authentication

```
POST   /api/auth/register      Register new user
POST   /api/auth/login         Login user
GET    /api/auth/me            Get current user
PUT    /api/auth/profile       Update profile
```

### Typing Tests

```
POST   /api/tests/submit       Submit test result
GET    /api/tests/history      Get test history
GET    /api/tests/statistics   Get user statistics
GET    /api/tests/best         Get best test
```

### Leaderboard

```
GET    /api/leaderboard        Get global leaderboard
GET    /api/leaderboard/:userId/rank  Get user rank
```

## 🔌 WebSocket Events

### Multiplayer Racing

```typescript
// Client → Server
socket.emit("race:create", { duration, wordList });
socket.emit("race:join", { roomCode });
socket.emit("race:start", {});
socket.emit("race:progress", { wpm, accuracy, progress });
socket.emit("race:finish", { wpm, accuracy });

// Server → Client
socket.on("race:updated", (room) => {});
socket.on("race:started", ({ startTime }) => {});
socket.on("race:progress", (data) => {});
socket.on("race:participant-finished", (data) => {});
socket.on("race:completed", (room) => {});
```

## 🛡️ Security Considerations

### Authentication

- Passwords hashed with bcryptjs (12 rounds)
- JWT tokens with 7-day expiry
- Refresh tokens stored in database
- HttpOnly cookies for token storage

### Validation

- Server-side input validation for all endpoints
- Express-validator for schema validation
- CORS protection enabled
- Rate limiting on auth endpoints (5 attempts/hour)

### Cheating Prevention

- **Copy-paste Detection**: Monitors input velocity
- **Tab Switch Detection**: Tracks browser focus events
- **Speed Anomalies**: Flags unrealistic speeds (>400 WPM)
- **Long Gaps**: Detects suspiciously long auto-save intervals

## 📈 Performance Optimization

### Frontend

- Vite for ~3x faster builds
- Code splitting with React.lazy()
- Memoization of components
- Debounced input (200ms)
- Virtual scrolling for large lists

### Backend

- Connection pooling (20 max)
- Query caching with Redis
- Database query optimization
- Socket.io compression
- Horizontal scaling ready

### Database

- Indexed frequently-queried fields
- Materialized views for leaderboards
- Partitioning strategy for test records
- Connection pooling enabled

## 🚀 Deployment

### Recommended: Vercel (Frontend) + Railway (Backend)

**Frontend:**

```bash
npm install -g vercel
vercel deploy
```

**Backend:**

1. Push to GitHub
2. Connect to Railway.app
3. Configure environment variables
4. Deploy automatically

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed instructions.

## 📊 Database Schema

### Key Tables

- **users**: User credentials and profile
- **typing_tests**: Individual test records
- **test_statistics**: Aggregated user stats
- **leaderboard**: Cached rankings
- **multiplayer_races**: Active race rooms
- **refresh_tokens**: Token management

See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for complete schema.

## 🔄 Scaling Strategy

### For 10k+ Users

**Phase 1:** Single server + PostgreSQL + Redis
**Phase 2:** Load balancers + Database read replicas + Redis cluster
**Phase 3:** Microservices + Kubernetes + Sharded database

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for scaling strategies.

## 🎨 Improvements Beyond Monkeytype

1. **Advanced Analytics**: WPM trends, accuracy patterns, consistency tracking
2. **Leaderboard Periods**: Daily, weekly, monthly, all-time rankings
3. **Achievement System**: Badges for milestones (100 WPM, 99% accuracy, etc.)
4. **Custom Word Lists**: Import or create custom difficulty levels
5. **Team Competitions**: Private leaderboards for organizations
6. **Replay System**: Playback of keystrokes with timing
7. **Dark Mode Themes**: Multiple theme options beyond dark/light
8. **Keyboard Layouts**: Support for different typing layouts
9. **Sound Customization**: Per-character sound packs
10. **Browser Extensions**: Desktop integration for notifications

## 🧪 Testing (Not Included)

For production, add:

- Unit tests: Jest
- Integration tests: Supertest (API)
- E2E tests: Cypress or Playwright
- Load testing: K6 or JMeter

## 📝 Configuration

### Environment Variables

**Backend (.env)**

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/typing_db
JWT_SECRET=your_secret_key_min_32_chars
REDIS_URL=redis://localhost:6379
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:3000
```

**Frontend (.env)**

```env
VITE_API_URL=http://localhost:5000/api
```

## 🤝 Contributing

This is a complete, production-ready template. Feel free to:

- Add more test modes
- Implement more analytics
- Create mobile app
- Add more themes
- Extend achievement system

## 📄 License

MIT

## 📞 Support

For issues or questions:

1. Check [ARCHITECTURE.md](docs/ARCHITECTURE.md) for design decisions
2. Check [DEPLOYMENT.md](docs/DEPLOYMENT.md) for deployment help
3. Review API routes in [backend/src/routes/](backend/src/routes/)

---

**Built with ❤️ as a production-grade typing test platform**
#   t y p i n g - t e s t - p l a t f o r m  
 