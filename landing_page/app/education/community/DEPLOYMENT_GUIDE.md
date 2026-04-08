# 🌱 BioBloom Community Hub - Complete Deployment Guide

## 🚀 **QUICK START - Single Command Deployment**

### Windows (PowerShell)
```powershell
cd src/components/education/community
./setup.ps1
```

### Linux/Mac (Bash)
```bash
cd src/components/education/community
chmod +x setup.sh
./setup.sh
```

This will automatically:
- ✅ Install all dependencies
- ✅ Setup PostgreSQL database 
- ✅ Run database migrations
- ✅ Seed with sample data
- ✅ Start the backend server
- ✅ Open the community hub

---

## 🎯 **What You Get**

### **Real Community Hub Features**
- 🔐 **User Authentication** - Secure registration/login
- 💬 **Q&A System** - Ask questions, get answers
- ⭐ **Expert System** - Verified experts with badges
- 📊 **Voting & Reputation** - Community-driven quality
- 🏷️ **Categories & Tags** - Organized content
- 🔍 **Search & Filter** - Find exactly what you need
- 📸 **Image Upload** - Visual problem solving
- 🔔 **Notifications** - Stay updated
- 📱 **Responsive Design** - Works on all devices

### **Technical Stack**
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: JWT with bcrypt
- **File Storage**: Local with S3-ready architecture

---

## 🧪 **Test Accounts (Pre-loaded)**

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| **Expert** | expert@farmer.com | expert123 | Verified agricultural expert |
| **Moderator** | moderator@farmer.com | moderator123 | Community moderator |
| **Tech User** | tech@farmer.com | tech123 | Tech-savvy farmer |
| **Beginner** | beginner@farmer.com | beginner123 | New to farming |

---

## 📁 **Project Structure**

```
src/components/education/community/
├── 🔧 Setup Scripts
│   ├── setup.ps1                  # Windows deployment
│   ├── setup.sh                   # Linux/Mac deployment
│   └── README.md                  # This guide
│
├── 🖥️ Backend (Real Implementation)
│   ├── package.json               # Node.js dependencies
│   ├── server.js                  # Express.js server
│   ├── .env                       # Environment config
│   └── prisma/
│       ├── schema.prisma          # Database schema
│       └── seed.js               # Sample data
│
├── 🎨 Frontend (React Components)
│   ├── AdaptiveCommunityHub.tsx   # Smart switcher component
│   ├── components/
│   │   ├── RealCommunityDiscussion.tsx
│   │   ├── QuestionList.tsx
│   │   └── AskQuestionModal.tsx
│   └── hooks/
│       └── useRealCommunity.ts    # API integration hooks
│
└── 📚 Documentation
    ├── SETUP_GUIDE.md
    ├── API_REFERENCE.md
    └── TROUBLESHOOTING.md
```

---

## 🔧 **Manual Setup (If Needed)**

### 1. Prerequisites
```bash
# Check if you have required software
node --version    # Should be v16+
npm --version     # Should be v8+
```

### 2. Install PostgreSQL
**Windows:**
- Download from [postgresql.org](https://www.postgresql.org/download/windows/)
- During installation, remember the password for user `postgres`

**Linux:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"
```

**Mac:**
```bash
brew install postgresql
brew services start postgresql
```

### 3. Setup Database
```sql
-- Connect to PostgreSQL
psql -U postgres -h localhost

-- Create database
CREATE DATABASE community_hub;

-- Create user (optional)
CREATE USER community_admin WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE community_hub TO community_admin;
```

### 4. Configure Environment
```bash
cd src/components/education/community/backend
cp .env.example .env
```

Edit `.env` file:
```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/community_hub"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Server
PORT=3001
NODE_ENV=development

# CORS
FRONTEND_URL="http://localhost:3000"

# File Upload
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=5242880  # 5MB
```

### 5. Install & Run
```bash
# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma db push
npx prisma db seed

# Start server
npm run dev
```

---

## 🌐 **API Endpoints**

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Questions
- `GET /api/questions` - List questions
- `POST /api/questions` - Create question
- `GET /api/questions/:id` - Get question details
- `PUT /api/questions/:id` - Update question

### Comments
- `GET /api/questions/:id/comments` - Get comments
- `POST /api/questions/:id/comments` - Add comment

### Categories
- `GET /api/categories` - List categories

### Voting
- `POST /api/questions/:id/vote` - Vote on question
- `POST /api/comments/:id/vote` - Vote on comment

---

## 🔍 **Troubleshooting**

### Common Issues

**❌ Port 3001 already in use**
```bash
# Find process using port 3001
netstat -ano | findstr :3001    # Windows
lsof -ti:3001                   # Mac/Linux

# Kill the process
taskkill /PID <PID> /F          # Windows
kill -9 <PID>                  # Mac/Linux
```

**❌ Database connection failed**
```bash
# Check PostgreSQL is running
pg_isready -h localhost -p 5432

# Restart PostgreSQL
# Windows: Services → PostgreSQL → Restart
sudo systemctl restart postgresql  # Linux
brew services restart postgresql   # Mac
```

**❌ npm install fails**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

**❌ Prisma errors**
```bash
# Reset database
npx prisma migrate reset

# Regenerate client
npx prisma generate

# Reseed data
npx prisma db seed
```

### Logs & Debugging
```bash
# Backend logs
cd backend && npm run dev

# Check database
npx prisma studio

# API testing
curl http://localhost:3001/api/health
```

---

## 🚀 **Production Deployment**

### Environment Variables
```env
NODE_ENV=production
DATABASE_URL="your-production-database-url"
JWT_SECRET="your-super-secure-production-jwt-secret"
FRONTEND_URL="https://your-domain.com"
```

### Database Setup
```bash
npx prisma migrate deploy
npx prisma db seed
```

### Process Management
```bash
# Using PM2
npm install -g pm2
pm2 start server.js --name "community-hub"
pm2 startup
pm2 save
```

---

## 📊 **Performance & Monitoring**

### Database Optimization
- Indexed frequently queried fields
- Efficient query patterns
- Connection pooling configured

### API Performance
- Rate limiting enabled
- CORS configured
- Error handling implemented
- Request logging available

### Monitoring Endpoints
- `GET /api/health` - Server health check
- `GET /api/stats` - Community statistics

---

## 🛡️ **Security Features**

- ✅ **Password Hashing** - bcrypt with salt rounds
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Input Validation** - All inputs sanitized
- ✅ **SQL Injection Protection** - Prisma ORM
- ✅ **CORS Configuration** - Restricted origins
- ✅ **Rate Limiting** - DDoS protection
- ✅ **File Upload Security** - Type & size validation

---

## 🎯 **Next Steps**

1. **Start the system**: Run `./setup.ps1` or `./setup.sh`
2. **Login**: Use test accounts from table above
3. **Explore**: Ask questions, vote, comment
4. **Customize**: Modify categories, add features
5. **Deploy**: Use production deployment guide

---

## 🤝 **Support**

- 📧 **Issues**: Check console logs first
- 🔧 **Configuration**: Review `.env` file
- 🗄️ **Database**: Use `npx prisma studio`
- 🌐 **API**: Test endpoints with curl/Postman

---

**🎉 Congratulations! You now have a fully functional Community Hub with real database, authentication, and all production features ready to go!**
