# Developer Checklist & Setup Guide

## 🎯 Pre-Development Checklist

### System Requirements

- [ ] Node.js 16+ installed (`node --version`)
- [ ] npm 8+ installed (`npm --version`)
- [ ] PostgreSQL 12+ installed (`psql --version`)
- [ ] Redis 6+ installed or available (`redis-cli ping`)
- [ ] Git installed (`git --version`)
- [ ] Code editor (VS Code recommended)

### Initial Setup

- [ ] Clone repository
- [ ] Read [docs/QUICKSTART.md](docs/QUICKSTART.md)
- [ ] Copy `backend/.env.example` → `backend/.env`
- [ ] Copy `frontend/.env.example` → `frontend/.env`
- [ ] Update `.env` files with your local config
- [ ] Create database: `createdb typing_db`

## 🚀 First-Time Developer Setup

### Step 1: Backend Setup

- [ ] Navigate to `backend/` directory
- [ ] Run `npm install`
- [ ] Verify `DATABASE_URL` in `.env`
- [ ] Run `npm run migrate`
- [ ] Run `npm run dev` (should start on :5000)
- [ ] Test health endpoint: `curl http://localhost:5000/health`

### Step 2: Frontend Setup

- [ ] Navigate to `frontend/` directory
- [ ] Run `npm install`
- [ ] Verify `VITE_API_URL` in `.env`
- [ ] Run `npm run dev` (should start on :3000)
- [ ] Browser should open to http://localhost:3000

### Step 3: Redis Setup

- [ ] Start Redis: `redis-server`
- [ ] Test connection: `redis-cli ping` (should return "PONG")
- [ ] Check it's accessible from backend

### Step 4: First Test Run

- [ ] Open browser to http://localhost:3000
- [ ] Click "Sign Up"
- [ ] Create test account
- [ ] Click "Start Test"
- [ ] Complete typing test
- [ ] View results
- [ ] ✅ Success!

## 📋 Daily Development Checklist

### Before Starting

- [ ] Backend running: `npm run dev` (in `backend/`)
- [ ] Frontend running: `npm run dev` (in `frontend/`)
- [ ] Redis running: `redis-server`
- [ ] Database accessible: `psql -d typing_db`
- [ ] Branch checked out: `git status`

### Code Quality

- [ ] ESLint passing: `npm run lint`
- [ ] TypeScript compiling: `npm run build`
- [ ] No console errors: Check browser console (F12)
- [ ] No database errors: Check backend logs

### Before Committing

- [ ] Code formatted
- [ ] No console.log() statements
- [ ] No debugger; statements
- [ ] Comments on complex logic
- [ ] Git diff reviewed
- [ ] Commit message clear

## 🔧 Development Tasks

### Adding a Backend Feature

1. **Create Controller** (if new endpoint type)
   - [ ] Create file in `backend/src/controllers/`
   - [ ] Export async function
   - [ ] Use try/catch for errors
   - [ ] Type inputs and outputs

2. **Add Routes**
   - [ ] Create/edit file in `backend/src/routes/`
   - [ ] Use express-validator for inputs
   - [ ] Add authentication middleware if needed
   - [ ] Register route in `backend/src/server.ts`

3. **Database Changes** (if needed)
   - [ ] Create migration in `backend/migrations/`
   - [ ] Run migration: `npm run migrate`
   - [ ] Update model if needed

4. **Test Endpoint**
   - [ ] Use Postman or curl
   - [ ] Test success case
   - [ ] Test error cases
   - [ ] Check database for side effects

5. **Update Documentation**
   - [ ] Add to [docs/API.md](docs/API.md)
   - [ ] Include example request/response
   - [ ] Document parameters and errors

### Adding a Frontend Feature

1. **Create Component**
   - [ ] Create file in `frontend/src/components/`
   - [ ] Use TypeScript interfaces/types
   - [ ] Memoize if needed
   - [ ] Add JSDoc comments

2. **Add Page** (if top-level page)
   - [ ] Create file in `frontend/src/pages/`
   - [ ] Add route in `frontend/src/App.tsx`
   - [ ] Export component as default

3. **Add State** (if needed)
   - [ ] Create/update store in `frontend/src/context/`
   - [ ] Use Zustand pattern
   - [ ] Type with TypeScript interfaces

4. **Connect to API**
   - [ ] Use `apiService` from `frontend/src/services/api.ts`
   - [ ] Handle loading and error states
   - [ ] Show user feedback

5. **Test Feature**
   - [ ] Manual browser testing
   - [ ] Check all user paths
   - [ ] Test error scenarios
   - [ ] Check responsive design

### Database Tasks

**Backup Database**

```bash
pg_dump typing_db > backup.sql
```

**Restore Database**

```bash
psql typing_db < backup.sql
```

**Connect to Database**

```bash
psql -d typing_db
```

**Run SQL Query**

```sql
-- In psql prompt
SELECT * FROM users LIMIT 5;
SELECT * FROM typing_tests WHERE user_id = 'uuid' ORDER BY created_at DESC;
```

### Testing Tasks

**Run Backend Tests**

- [ ] Set up Jest (not yet included)
- [ ] Create `backend/tests/` directory
- [ ] Write unit tests
- [ ] Run: `npm test`

**Run Frontend Tests**

- [ ] Set up Vitest
- [ ] Create component tests
- [ ] Run: `npm test`

**Run E2E Tests**

- [ ] Set up Cypress
- [ ] Create user flows
- [ ] Run: `npm run test:e2e`

## 🐛 Debugging Checklist

### Backend Issues

- [ ] Check console for errors
- [ ] Verify `.env` variables
- [ ] Check database connection: `psql -d typing_db`
- [ ] Run migrations: `npm run migrate`
- [ ] Check Redis connection: `redis-cli ping`
- [ ] Use `console.log()` strategically
- [ ] Check API with curl or Postman

### Frontend Issues

- [ ] Open browser console (F12)
- [ ] Check Network tab for API calls
- [ ] Check Storage tab for tokens
- [ ] Use React DevTools extension
- [ ] Hard refresh: Ctrl+Shift+R
- [ ] Clear local storage if needed

### Database Issues

- [ ] Connect with `psql`: `psql -d typing_db`
- [ ] Check tables exist: `\dt`
- [ ] Check indexes: `\di`
- [ ] View slow queries: Enable query logging
- [ ] Check constraints: `\d table_name`

## 📚 Code Review Checklist

When reviewing code:

### Backend

- [ ] Proper error handling?
- [ ] input validation present?
- [ ] SQL injection prevention (parameterized queries)?
- [ ] Authentication checked?
- [ ] Database transaction used if needed?
- [ ] Logging at appropriate levels?
- [ ] Types defined properly?
- [ ] Comments on complex logic?

### Frontend

- [ ] Props typed properly?
- [ ] Error states handled?
- [ ] Loading states shown?
- [ ] Accessibility considered?
- [ ] No console errors?
- [ ] Performance optimized (memoization)?
- [ ] Responsive design tested?
- [ ] Comments on complex logic?

## 🚀 Performance Checklist

### Frontend Performance

- [ ] Check Lighthouse score
- [ ] Monitor bundle size
- [ ] Profile with React DevTools
- [ ] Check for unnecessary re-renders
- [ ] Verify lazy loading working
- [ ] Test on slow network (DevTools throttling)

### Backend Performance

- [ ] Check response times
- [ ] Monitor database queries
- [ ] Verify indexes being used
- [ ] Check connection pool usage
- [ ] Test under load (K6 or similar)
- [ ] Cache working on leaderboard?

## 🔒 Security Checklist

Before production:

- [ ] JWT_SECRET changed from default
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Input validation comprehensive
- [ ] No sensitive data in logs
- [ ] Database backups working
- [ ] HTTPS enabled
- [ ] Error messages user-friendly (no internals)
- [ ] SQL injection impossible (parameterized)
- [ ] XSS prevention (React escapes by default)
- [ ] CSRF tokens if needed
- [ ] Passwords hashed (bcryptjs)

## 📋 Pre-Deployment Checklist

### Code Quality

- [ ] All tests passing
- [ ] No ESLint errors
- [ ] TypeScript compiling cleanly
- [ ] No console errors/warnings
- [ ] Code reviewed

### Deployment Preparation

- [ ] Environment variables set
- [ ] Database migrations tested
- [ ] Backups configured
- [ ] Monitoring set up (Sentry)
- [ ] Logging configured
- [ ] Load tested

### Final Checks

- [ ] Staging environment working
- [ ] All features tested on staging
- [ ] Database migration tested
- [ ] Rollback plan documented
- [ ] Deployment checklist followed

## 📞 Quick Reference

### Useful Commands

**Frontend**

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview build
npm run lint         # Run ESLint
```

**Backend**

```bash
npm run dev          # Start dev server
npm run build        # Build TypeScript
npm run migrate      # Run migrations
npm run test         # Run tests
```

**Database**

```bash
psql -d typing_db                           # Connect
createdb typing_db                          # Create DB
dropdb typing_db                            # Delete DB
pg_dump typing_db > backup.sql              # Backup
psql typing_db < backup.sql                 # Restore
```

**Redis**

```bash
redis-server                      # Start Redis
redis-cli                         # Connect to Redis
redis-cli FLUSHALL               # Clear all data
redis-cli MONITOR                # Monitor in real-time
```

## 🎓 Learning Resources

- [docs/QUICKSTART.md](docs/QUICKSTART.md) - Setup guide
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - System design
- [docs/API.md](docs/API.md) - API reference
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) - Production guide

---

**Need help?** Check the relevant documentation file or search the codebase for examples.
