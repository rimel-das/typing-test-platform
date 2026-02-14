# 🚀 GO LIVE - Production Deployment Guide

**Date**: February 14, 2026  
**Status**: Ready for Production ✅  
**Recommended Path**: Vercel + Railway (Easiest & Fastest)

---

## ⚡ Quick Start (Vercel + Railway)

**Time to Live**: 15-20 minutes  
**Difficulty**: Beginner-friendly  
**Cost**: Free tier available ($5-50/month for production)

### Step 1: Prepare GitHub Repository

```bash
# 1a. Initialize git in project (if not already done)
cd "c:\Users\DELL\OneDrive\Documents\typing project"
git init
git add .
git commit -m "Initial commit: Production-ready typing platform"

# 1b. Create GitHub repo at https://github.com/new
# Name: typing-test-platform
# Make public (free tier requires public)

# 1c. Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/typing-test-platform.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy Frontend to Vercel

**1. Go to https://vercel.com/new**

**2. Import your GitHub project**

- Click "Import Git Repository"
- Select your typing-test-platform repo
- Click Import

**3. Configure Vercel Settings**

- **Framework**: Next.js / React (auto-detected)
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

**4. Add Environment Variables**

```
VITE_API_URL = https://your-backend.railway.app/api
```

**5. Click Deploy** ✅

- Vercel starts building
- Deployment takes 2-3 minutes
- You get a live URL: `https://your-app.vercel.app`

---

### Step 3: Deploy Backend to Railway

**1. Go to https://railway.app**

**2. Click "Start a New Project"**

**3. Select "Deploy from GitHub"**

- Authorize Railway to access GitHub
- Select your typing-test-platform repo

**4. Configure Project**

- **Project name**: typing-backend
- **Root directory**: `backend`

**5. Set Environment Variables** (click "Add Variables")

```
NODE_ENV = production
PORT = 5000
DATABASE_URL = postgresql://user:pass@localhost:5432/typing_db
JWT_SECRET = your-super-secret-key-minimum-32-chars
JWT_EXPIRY = 7d
CORS_ORIGIN = https://your-app.vercel.app
REDIS_URL = redis://default:password@localhost:6379
```

**6. Add PostgreSQL Database**

- Click "Add Service"
- Select "PostgreSQL"
- Railway creates database automatically
- Copy connection string to DATABASE_URL

**7. Add Redis Cache**

- Click "Add Service"
- Select "Redis"
- Railway creates Redis automatically
- Copy connection string to REDIS_URL

**8. Deploy**

- Railway auto-deploys when you push to GitHub
- Backend URL: `https://your-backend.railway.app`

---

### Step 4: Run Database Migrations

```bash
# SSH into Railway backend
railway shell

# Run migrations
npm run migrate

# Exit
exit
```

---

### Step 5: Configure Frontend to Connect

Update `frontend/.env.production`:

```
VITE_API_URL = https://your-backend.railway.app/api
```

Redeploy frontend:

```bash
git push origin main  # Vercel auto-redeploys
```

---

### Step 6: Test Live System

```bash
# Test API
curl https://your-backend.railway.app/health
# Response: {"status":"ok"}

# Test frontend
open https://your-app.vercel.app
# Should load and connect to backend
```

---

## ✅ Deployment Checklist

### Pre-Deployment

- [x] Backend builds cleanly (`npm run build`)
- [x] Frontend builds cleanly (`npm run build`)
- [x] All tests pass (if applicable)
- [x] Environment variables configured
- [x] Database schema prepared

### Vercel Frontend

- [ ] GitHub repo created and code pushed
- [ ] Vercel project imported
- [ ] Build settings configured (Root: `frontend`)
- [ ] Environment variable set: `VITE_API_URL`
- [ ] Initial deployment successful
- [ ] Frontend loads without errors

### Railway Backend

- [ ] Railway project created
- [ ] GitHub connected and auto-deploy enabled
- [ ] Environment variables configured
- [ ] PostgreSQL database created
- [ ] Redis cache created
- [ ] Database migrations run successfully
- [ ] Backend API responding to requests

### Integration Testing

- [ ] Frontend connects to backend API
- [ ] User registration works
- [ ] User login works
- [ ] Test submission works
- [ ] Leaderboard loads
- [ ] WebSocket multiplayer connects

---

## 🔧 Environment Variables Setup

### Backend (Railway)

```bash
# Server
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL=postgresql://user:password@db.railway.internal:5432/railway

# JWT
JWT_SECRET=<generate-random-32-char-string>
JWT_EXPIRY=7d
JWT_REFRESH_EXPIRY=30d

# CORS
CORS_ORIGIN=https://your-app.vercel.app

# Cache
REDIS_URL=redis://default:password@cache.railway.internal:6379
```

### Frontend (Vercel)

```bash
# API
VITE_API_URL=https://your-backend.railway.app/api
```

---

## 📊 Estimated Costs

### Free Tier

- Vercel: Free for public projects
- Railway: $5 starter credit per month
- Total: **$0/month** (for small user base)

### Production Tier ($50-100/month)

- Vercel Pro: $20/month
- Railway:
  - PostgreSQL: $15/month
  - Redis: $5/month
  - Compute: $15/month
- Total: **$55/month**

### Enterprise Tier ($500+/month)

- Multiple instances
- Advanced monitoring
- Custom domain
- SLA support

---

## 🔐 Security Checklist (Production)

- [ ] JWT_SECRET is minimum 32 random characters
- [ ] CORS_ORIGIN set to frontend domain only
- [ ] Database password is strong (20+ chars)
- [ ] Environment variables NOT in git
- [ ] HTTPS enforced everywhere
- [ ] Rate limiting configured
- [ ] Database backups enabled
- [ ] Error logging to Sentry configured
- [ ] Monitoring enabled (Datadog, New Relic)
- [ ] SSL certificate valid

---

## 📈 Post-Deployment Monitoring

### Set Up Error Tracking (Free Tier)

**Sentry Setup:**

```bash
npm install @sentry/node

# Add to backend server.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "https://YOUR-SENTRY-DSN@sentry.io/123456",
  environment: "production",
});

app.use(Sentry.Handlers.errorHandler());
```

### Monitor Key Metrics

- API response time (target: <100ms p95)
- Error rate (target: <1%)
- Database query time (target: <50ms)
- WebSocket connection stability (target: >99.9%)
- User registration rate
- Active sessions

---

## 🆘 Troubleshooting

### Frontend won't load

```
1. Check Vercel build logs
2. Verify VITE_API_URL is correct
3. Check browser console for errors
4. Verify backend is running (curl backend URL)
```

### Backend API errors

```
1. Check Railway logs: railway logs
2. Verify DATABASE_URL connection
3. Verify REDIS_URL connection
4. Check NODE_ENV=production is set
5. Run migrations: npm run migrate
```

### Database migration errors

```
1. SSH into Railway: railway shell
2. Run: npm run migrate
3. Check migration files exist
4. Verify database permissions
```

### WebSocket connection issues

```
1. Verify CORS_ORIGIN includes frontend domain
2. Check WebSocket proxy settings in Vercel
3. Verify Redis connection for Socket.io adapter
```

---

## 📱 What's Deployed

### Frontend (Vercel CDN)

```
✅ React 18 application
✅ All components compiled
✅ Static assets optimized
✅ Automatic HTTPS
✅ Global CDN distribution
```

### Backend (Railway VPC)

```
✅ Node.js/Express server
✅ PostgreSQL database
✅ Redis cache
✅ WebSocket support
✅ Automatic scaling
```

### Features Live

```
✅ User registration & authentication
✅ Real-time typing tests
✅ WPM/accuracy calculations
✅ User profiles & statistics
✅ Global leaderboards
✅ Multiplayer racing
✅ Test history tracking
✅ Dark/light theme
```

---

## 🎯 Next Steps

1. **Day 1**: Deploy to production
2. **Day 2**: Monitor error logs & user registrations
3. **Week 1**: Collect feedback & minor fixes
4. **Week 2**: Optimize performance based on metrics
5. **Week 4**: Add advanced features (achievements, replays)

---

## 📞 Support

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **Express.js Docs**: https://expressjs.com
- **React Docs**: https://react.dev

---

## 🏁 You're Ready to Go Live! 🚀

Your typing platform is production-ready:

- ✅ All code compiles
- ✅ All dependencies installed
- ✅ Database schema prepared
- ✅ Authentication working
- ✅ Multiplayer functional
- ✅ Error handling robust

**Expected Result After Deployment:**

- Live website URL (vercel.app)
- Live API endpoint (railway.app)
- Database backup on Railway
- Automatic CI/CD pipeline
- Global CDN distribution
- Real-time monitoring

---

**Estimated time to live: 15-20 minutes**  
**Difficulty: Beginner-friendly**  
**No credit card required (free tier available)**

Let's launch this! 🎉
