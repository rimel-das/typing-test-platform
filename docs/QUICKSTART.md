# Quick Start Guide

## 5-Minute Setup

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb typing_db

# Set environment variables in backend/.env
DATABASE_URL=postgresql://postgres:password@localhost:5432/typing_db

# Run migrations
cd backend
npm run migrate

# Verify
npm run dev  # Should start without errors
```

### 3. Start Development

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: Redis (if not running as service)
redis-server
```

### 4. Access Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Health: http://localhost:5000/health

## Testing the Platform

### Register & Login

1. Go to http://localhost:3000
2. Click "Sign Up"
3. Create account with username/email/password
4. Login with credentials

### Take a Typing Test

1. Select duration (60s recommended for first test)
2. Select difficulty (easy for first test)
3. Click "Start Test"
4. Type the text as quickly and accurately as you can
5. Test ends when time runs out
6. View results

### Try Multiplayer (Needs 2 Browsers)

1. Browser 1: Click "Create Race"
2. Share room code with Browser 2
3. Browser 2: Click "Join Race" and enter code
4. Both start typing when race begins
5. See real-time progress of each typist

## Common Issues

### "Cannot connect to database"

```bash
# Check PostgreSQL is running
psql -U postgres -d postgres -c "SELECT version();"

# Check connection string in .env
DATABASE_URL=postgresql://username:password@localhost:5432/typing_db
```

### "Cannot connect to Redis"

```bash
# Install Redis if not present
# macOS
brew install redis

# Ubuntu
sudo apt-get install redis-server

# Start Redis
redis-server

# Test connection
redis-cli ping  # Should return "PONG"
```

### "Migration failed"

```bash
# Check backend/.env is set correctly
# Drop and recreate database
dropdb typing_db
createdb typing_db

# Run migrations again
npm run migrate
```

### "WebSocket connection refused"

```bash
# Check backend is running
# Check frontend CORS settings match backend
# Reload browser (hard refresh: Ctrl+Shift+R)
```

## Useful Commands

```bash
# Backend
npm run dev          # Start dev server
npm run build        # Build for production
npm run migrate      # Run database migrations
npm run test         # Run tests

# Frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Database
psql -d typing_db    # Connect to database
\dt                  # List tables
\di                  # List indexes
```

## Next Steps

1. **Read Architecture**: See [ARCHITECTURE.md](ARCHITECTURE.md)
2. **API Documentation**: See [API.md](API.md)
3. **Deploy**: See [DEPLOYMENT.md](DEPLOYMENT.md)
4. **Customize**: Modify colors, fonts, or features
5. **Add Features**: Implement your own unique features

## Development Tips

### Debugging Backend

```typescript
// Add logging
console.log('Debug:', variable);

// Use debugger
debugger;

// Run with inspector
node --inspect dist/server.js
// Then open chrome://inspect
```

### Debugging Frontend

```typescript
// React DevTools
// Redux DevTools (if using Redux)

// Browser Console
console.log("Debug:", variable);

// Network Tab
// Check API requests and WebSocket connections
```

### Database Inspection

```sql
-- View user
SELECT * FROM users WHERE username = 'testuser';

-- View user's tests
SELECT id, wpm, accuracy, created_at FROM typing_tests
WHERE user_id = 'user-uuid'
ORDER BY created_at DESC;

-- View statistics
SELECT * FROM test_statistics WHERE user_id = 'user-uuid';
```

## Performance Tips

### Frontend

- Use browser DevTools Network tab to identify slow requests
- Check React Profiler for slow components
- Use Chrome DevTools to check bundle size

### Backend

- Monitor database slow queries
- Check connection pool utilization
- Profile CPU and memory usage

### Database

- Analyze slow queries
- Check index usage
- Monitor table bloat

## Production Checklist

Before deploying to production:

- [ ] Set strong JWT_SECRET (32+ random characters)
- [ ] Enable HTTPS
- [ ] Set NODE_ENV=production
- [ ] Configure CORS properly
- [ ] Set up database backups
- [ ] Configure logging (e.g., to Sentry)
- [ ] Set up monitoring (e.g., Datadog)
- [ ] Test error handling
- [ ] Load test the system
- [ ] Security audit

## Support

1. Check error logs: `npm run dev` shows all errors
2. Check database logs: `psql` errors
3. Check browser console for frontend errors
4. Check Network tab for API issues

Good luck! 🚀
