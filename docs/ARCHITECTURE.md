# Architecture Documentation

## System Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER (React)                         │
├──────────────────────────────────────────────────────────────────┤
│  Pages                │  Components          │  Hooks            │
│  - HomePage          │  - TypingTest        │  - useTypingTest  │
│  - TestPage          │  - TestStats         │  - useMultiplayer │
│  - LeaderboardPage   │  - TypingDisplay     │  - useCountdown   │
│  - StatsPage         │  - TestResults       │                   │
└──────────────────────────────────────────────────────────────────┘
                              ↓ (HTTP/WebSocket)
┌──────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER (Express)                  │
├──────────────────────────────────────────────────────────────────┤
│  Routes                                                           │
│  ├── /api/auth/register        ├── /api/tests/submit             │
│  ├── /api/auth/login           ├── /api/tests/history            │
│  ├── /api/auth/me              ├── /api/tests/statistics         │
│  └── /api/auth/profile         └── /api/leaderboard/             │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                          │
├──────────────────────────────────────────────────────────────────┤
│  Controllers                 │  Services                          │
│  - authController           │  - userService                    │
│  - testController           │  - typingService                  │
│  - leaderboardController    │  - statisticsService              │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│                    DATA ACCESS LAYER                             │
├──────────────────────────────────────────────────────────────────┤
│  Models/Services                                                  │
│  ├── User.ts (CRUD operations, auth)                            │
│  ├── TypingTest.ts (Test records, history)                      │
│  ├── TestStatistics.ts (Aggregated stats)                       │
│  └── Leaderboard.ts (Rankings, caching)                         │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                                │
├──────────────────────────────────────────────────────────────────┤
│  PostgreSQL      │      Redis          │      S3                 │
│  - Users         │  - Sessions         │  - Avatars             │
│  - Tests         │  - Leaderboard      │  - Replays             │
│  - Stats         │  - Cache            │                        │
│  - Analytics     │  - Real-time Data   │                        │
└──────────────────────────────────────────────────────────────────┘
```

## Key Components

### 1. Authentication System

**Flow:**

```
User Input → Hash Password → Store User → Generate JWT → Return Token
                                    ↓
                            Check Credentials
                                    ↓
                          Hash & Compare Password
                                    ↓
                         Generate Token Pair (Access + Refresh)
```

**Security:**

- bcryptjs with 12 salt rounds
- JWT with 7-day expiry
- HttpOnly cookies for token storage
- CORS protection
- Rate limiting on auth endpoints

### 2. Typing Test Engine

**Metrics Calculation:**

```typescript
// WPM = (characters / 5 / minutes)
// Accuracy = (correct_chars / total_chars) * 100
// Consistency = 1 - (stdDev / mean) * 100
// Raw WPM = (all_chars / 5 / minutes)
```

**Cheating Detection:**

- Tab switch detection (focus events)
- Copy-paste detection (input velocity analysis)
- Unrealistic speed detection (> 400 WPM)
- Long gaps in input (> 5 seconds)

### 3. Real-time Multiplayer

**Architecture:**

```
Client A ────────────────┐
                         ├─→ Socket.io Server ─→ Redis Adapter
Client B ────────────────┤      (Room Manager)    (Broadcast)
Client C ────────────────┘

Events:
- race:create → Create room, assign code
- race:join → Add participant
- race:start → Broadcast to all in room
- race:progress → Update live metrics
- race:finish → Calculate position, update leaderboard
```

### 4. Database Design

**Normalization:** 3NF
**Key Tables:**

- `users` - Authentication & profiles
- `typing_tests` - Individual test records (partitioned)
- `test_statistics` - Aggregated per user
- `leaderboard` - Cached rankings (materialized view)
- `multiplayer_races` - Active race rooms
- `refresh_tokens` - Token management

**Indexing Strategy:**

```sql
-- High-volume queries
CREATE INDEX idx_tests_user_created ON typing_tests(user_id, created_at DESC);
CREATE INDEX idx_tests_wpm ON typing_tests(wpm DESC);

-- Leaderboard updates
CREATE INDEX idx_leaderboard_rank ON leaderboard(rank);
CREATE INDEX idx_leaderboard_period ON leaderboard(period);

-- Session lookups
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
```

## Data Flow Examples

### Example 1: Submitting a Test

```
1. User finishes typing test
2. Frontend collects:
   - originalText, typedText, duration
   - inputHistory (keystroke timing)
   - durationActual (actual time)

3. POST /api/tests/submit
   - Validate inputs
   - Calculate metrics (WPM, accuracy, consistency)
   - Detect anomalies
   - Create TypedTest record in DB
   - Recalculate TestStatistics
   - Update leaderboard cache
   - Return results to client

4. Frontend displays results
   - Show WPM, accuracy, consistency
   - Compare to PB
   - Option to retry
```

### Example 2: Creating Multiplayer Race

```
1. User clicks "Create Room"
2. Frontend emits: socket.emit('race:create', { duration: 60, wordList: [...] })

3. Backend:
   - Generate unique room code
   - Create RaceRoom in memory
   - Add creator as participant
   - Emit 'race:updated' to creator

4. Other users get room code
5. They emit: socket.emit('race:join', { roomCode: 'ABC123' })

6. Backend:
   - Find room by code
   - Add new participant
   - Broadcast updated room to all participants

7. Creator clicks "Start"
8. Backend:
   - Set room status to 'in_progress'
   - Emit 'race:started' with timestamp to all
   - Frontend starts timer

9. During race:
   - Frontend updates WPM/accuracy locally
   - Emits progress periodically
   - Backend broadcasts to other clients
   - Real-time leaderboard update

10. First user finishes:
    - Emits 'race:finish'
    - Backend sets position, broadcasts finish event
    - Client sees leaderboard

11. All finished:
    - Backend closes room
    - Cleanup after 5s
```

## Performance Considerations

### Frontend Optimization

```typescript
// Debounce input while typing
const debouncedUpdate = debounce(calculateMetrics, 200);

// Throttle WebSocket updates
const throttledProgress = throttle(
  () => socket.emit('race:progress', { wpm, accuracy }),
  1000
);

// Virtual scrolling for large lists
<VirtualList items={testHistory} />

// Code splitting
const TestPage = lazy(() => import('./pages/TestPage'));

// Memoization
const TypingDisplay = memo(({ text, typedText }) => {...});
```

### Backend Optimization

```typescript
// Connection pooling
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Caching frequently accessed data
const leaderboardCache = new Map();
setInterval(
  () => {
    // Refresh cache every 5 minutes
    refreshLeaderboardCache();
  },
  5 * 60 * 1000,
);

// Batch operations
await Promise.all([
  updateUserStats(userId),
  updateLeaderboard(userId),
  recordAchievements(userId),
]);

// Query optimization
const result = await pool.query(
  `SELECT * FROM typing_tests 
   WHERE user_id = $1 
   AND created_at > CURRENT_TIMESTAMP - INTERVAL '30 days'
   ORDER BY wpm DESC LIMIT 10`,
  [userId],
);
```

## Error Handling

```typescript
// Middleware error handling
app.use((err, req, res, next) => {
  if (err instanceof ValidationError) {
    return res.status(400).json({ errors: err.details });
  }
  if (err instanceof AuthError) {
    return res.status(401).json({ error: 'Authentication failed' });
  }
  if (err instanceof DatabaseError) {
    console.error('DB Error:', err);
    return res.status(500).json({ error: 'Database error' });
  }
  return res.status(500).json({ error: 'Internal server error' });
});

// Frontend error handling
try {
  const response = await apiService.submitTest(...);
} catch (error) {
  if (error.response?.status === 400) {
    setError('Invalid test data');
  } else if (error.response?.status === 401) {
    redirect('/login');
  } else {
    setError('Failed to submit test');
  }
}
```

## Security Architecture

### Authentication Flow

```
1. User registers with username, email, password
   ↓
2. Password hashed with bcryptjs (12 rounds)
   ↓
3. User stored in DB with hash
   ↓
4. Login: password hashed and compared
   ↓
5. Tokens generated: access (7d) + refresh (30d)
   ↓
6. Refresh token stored in DB (one-use)
   ↓
7. Access token sent to client (header)
   ↓
8. Refresh token sent in httpOnly cookie
```

### Rate Limiting

```typescript
// Per IP
limiter.windowMs = 15 * 60 * 1000; // 15 minutes
limiter.maxRequests = 100;

// Per user (for auth endpoints)
authLimiter.windowMs = 60 * 60 * 1000; // 1 hour
authLimiter.maxRequests = 5; // 5 attempts
```

### Input Validation

```typescript
// Server-side validation
body("username")
  .trim()
  .isLength({ min: 3, max: 32 })
  .matches(/^[a-zA-Z0-9_-]+$/)
  .withMessage("Invalid username format");

body("password")
  .isLength({ min: 8 })
  .withMessage("Password must be at least 8 characters");

body("wpm").isFloat({ min: 0, max: 300 }).withMessage("Invalid WPM value");
```

## Scalability Patterns

### Horizontal Scaling

1. Multiple backend instances behind load balancer
2. Stateless applications (JWT auth)
3. Shared database + Redis cache
4. Socket.io with Redis adapter for pub/sub

### Vertical Scaling

1. Increase server resources (CPU, RAM)
2. Optimize database queries
3. Implement caching layers
4. Use connection pooling

### Database Scaling

1. Read replicas for analytics queries
2. Partitioning by user_id for test records
3. Materialized views for leaderboards
4. Archive old test data to separate table
