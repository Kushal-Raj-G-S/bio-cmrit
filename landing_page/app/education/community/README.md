# 🌱 GrainTrust Community Hub - Production Setup Guide

A **complete, production-ready Community Hub** with real database, authentication, and API backend - completely separate from your main GrainTrust database.

## 🚀 Quick Start (Single Command)

### For Windows PowerShell:
```powershell
cd "src/components/education/community"
./setup.ps1
```

### For Linux/Mac:
```bash
cd src/components/education/community
chmod +x setup.sh
./setup.sh
```

## 📋 What This Setup Includes

### ✅ **Complete Backend System**
- **Express.js Server** with JWT authentication
- **PostgreSQL Database** (separate from main GrainTrust DB)
- **Prisma ORM** with migrations and seeding
- **File Upload Support** for images
- **Real API Endpoints** for all community features

### ✅ **Production Features**
- **User Registration & Login** with secure password hashing
- **Real User Profiles** with farming details
- **Question & Answer System** with voting
- **Comment System** with expert badges
- **Image Upload** for crop photos
- **Category Management** 
- **Search & Filtering**
- **Notification System**

### ✅ **Sample Data Included**
- **4 Test Users** (Expert, Moderator, Tech User, Beginner)
- **7 Categories** (Urgent Help, Pest Control, Soil Health, etc.)
- **4 Sample Questions** with real farming scenarios
- **Expert Comments** with solutions

## 🔧 Manual Setup (Step by Step)

### 1. **Database Setup**

Choose one of these options:

#### Option A: Local PostgreSQL
```bash
# Install PostgreSQL locally
# Create database
createdb graintrust_community_hub

# Update .env file
COMMUNITY_DATABASE_URL="postgresql://username:password@localhost:5432/graintrust_community_hub"
```

#### Option B: Cloud Database (Recommended)
**Railway (Free tier):**
1. Go to [railway.app](https://railway.app)
2. Create new project → Add PostgreSQL
3. Copy connection string to `.env`

**Render (Free tier):**
1. Go to [render.com](https://render.com)
2. Create PostgreSQL database
3. Copy external connection string to `.env`

**Neon (Free tier):**
1. Go to [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string to `.env`

### 2. **Backend Setup**
```bash
cd src/components/education/community/backend

# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Seed with sample data
npm run db:seed

# Start server
npm run dev
```

### 3. **Frontend Integration**

The Community Hub will automatically use the real API when the backend server is running. If the server is not available, it will show a connection error.

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Users
- `GET /api/users/profile` - Get current user profile

### Categories  
- `GET /api/categories` - Get all categories

### Questions
- `GET /api/questions` - Get questions (with filters)
- `POST /api/questions` - Create new question
- `POST /api/questions/:id/vote` - Vote on question

### Comments
- `GET /api/questions/:id/comments` - Get comments
- `POST /api/questions/:id/comments` - Create comment

### Health Check
- `GET /api/health` - Server health check

## 🧪 Test Accounts

After running the setup, you can login with these test accounts:

| User Type | Email | Password | Description |
|-----------|-------|----------|-------------|
| **Expert** | john.farmer@example.com | password123 | High reputation, verified farmer |
| **Moderator** | sara.organic@example.com | password123 | Organic farming expert, moderator |
| **Tech User** | mike.tech@example.com | password123 | IoT and technology enthusiast |
| **Beginner** | anna.newbie@example.com | password123 | New farmer, learning |

## 🔒 Environment Configuration

Update the `.env` file in the backend folder:

```env
# Community Hub Database (SEPARATE from main GrainTrust DB)
COMMUNITY_DATABASE_URL="postgresql://username:password@localhost:5432/graintrust_community_hub"

# Server Configuration  
COMMUNITY_PORT=3001
NODE_ENV=development

# JWT Authentication
COMMUNITY_JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
COMMUNITY_JWT_EXPIRES_IN="7d"

# CORS Configuration
FRONTEND_URL="http://localhost:3000"

# File Upload
UPLOAD_MAX_SIZE=5242880
UPLOAD_ALLOWED_TYPES="image/jpeg,image/png,image/webp"
```

## 🚦 Running Everything

### Option 1: Single Command (Recommended)
```powershell
# Windows PowerShell
cd "src/components/education/community"
./setup.ps1
```

### Option 2: Separate Commands
```bash
# Terminal 1: Start Community Hub Backend
cd src/components/education/community/backend
npm run dev

# Terminal 2: Start Next.js Frontend (in project root)
npm run dev
```

## 🎯 How It Works

1. **Backend Server** runs on `http://localhost:3001`
2. **Frontend** automatically detects if backend is available
3. **Real API calls** replace mock data when connected
4. **Fallback system** shows connection status if server is down

## 🛠 Troubleshooting

### Common Issues:

**1. Database Connection Failed**
```
❌ Database connection failed: connect ECONNREFUSED
```
**Solution:** Update `COMMUNITY_DATABASE_URL` in `.env` with correct database credentials.

**2. Port Already in Use**
```
❌ Error: listen EADDRINUSE: address already in use :::3001
```
**Solution:** Change `COMMUNITY_PORT` in `.env` or stop the process using port 3001.

**3. Frontend Shows "Server Not Available"**
**Solution:** Make sure the backend server is running on the correct port.

## 📊 Production Deployment

### Backend Deployment (Railway)
1. Connect your GitHub repo to Railway
2. Set environment variables in Railway dashboard
3. Deploy from `src/components/education/community/backend`

### Frontend (Already integrated)
The frontend automatically switches to production API URL when deployed.

## 🎉 Success!

Your Community Hub is now live with:
- ✅ Real user authentication
- ✅ Working database with sample data  
- ✅ Complete API backend
- ✅ File upload support
- ✅ Production-ready architecture

**Access your Community Hub:**
- Frontend: http://localhost:3000 (Education Center → Community tab)
- Backend API: http://localhost:3001/api
- Database: Via Prisma Studio (`npm run db:studio`)

The Community Hub is now **completely functional** with real users, real data, and real-time interactions! 🌾
