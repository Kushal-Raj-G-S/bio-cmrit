// Community Hub Simple Server - No Auth Required
// Users are already authenticated in main GrainTrust system
// Location: src/components/education/community/backend/server-simple.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const { z } = require('zod');
const path = require('path');
const fs = require('fs').promises;
const { PrismaClient } = require('./prisma/generated/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.COMMUNITY_PORT || 3001;

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS - Allow requests from main app
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-User-ID', 'X-User-Name', 'X-User-Email']
}));

// Rate limiting - DISABLED for development
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100,
//   message: { error: 'Too many requests, please try again later.' },
//   skip: (req) => req.path === '/api/health' // Skip rate limiting for health checks
// });
// app.use('/api/', limiter);

// File upload
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images allowed'));
    }
  }
});

// Simple user context middleware
const setUserContext = (req, res, next) => {
  // Log all incoming requests
  console.log(`📡 ${req.method} ${req.url} - Headers:`, {
    userAgent: req.headers['user-agent']?.substring(0, 50),
    userId: req.headers['x-user-id'],
    userName: req.headers['x-user-name']
  });
  
  // Get user info from headers (set by main GrainTrust app)
  req.userId = req.headers['x-user-id'] || `user_${Date.now()}`;
  req.userName = req.headers['x-user-name'] || 'Anonymous Farmer';
  req.userEmail = req.headers['x-user-email'] || 'farmer@graintrust.com';
  next();
};

// Apply user context to all API routes
app.use('/api/', setUserContext);

// Response logging middleware
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function(data) {
    if (res.statusCode >= 400) {
      console.log(`❌ ${req.method} ${req.url} - Status: ${res.statusCode} - Response:`, 
        typeof data === 'string' ? data.substring(0, 200) : JSON.stringify(data).substring(0, 200)
      );
    } else {
      console.log(`✅ ${req.method} ${req.url} - Status: ${res.statusCode}`);
    }
    originalSend.call(this, data);
  };
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Community Hub', timestamp: new Date().toISOString() });
});

// API Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', service: 'Community Hub API', timestamp: new Date().toISOString() });
});

// Get all categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { questions: true }
        }
      }
    });
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get questions with filters
app.get('/api/questions', async (req, res) => {
  try {
    const { category, search, sort = 'newest', filter } = req.query;
    
    let where = {};
    
    if (category && category !== 'all') {
      where.categoryId = category;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } }
      ];
    }
    
    if (filter && filter !== 'all') {
      switch (filter) {
        case 'urgent':
          where.isUrgent = true;
          break;
        case 'solved':
          where.isSolved = true;
          break;
        case 'unsolved':
          where.isSolved = false;
          break;
      }
    }
    
    let orderBy;
    switch (sort) {
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'votes':
        orderBy = { votes: { _count: 'desc' } };
        break;
      case 'comments':
        orderBy = { comments: { _count: 'desc' } };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }
    
    const questions = await prisma.question.findMany({
      where,
      orderBy,
      include: {
        author: {
          select: { 
            id: true, 
            username: true, 
            firstName: true, 
            lastName: true,
            email: true, 
            avatar: true,
            reputation: true,
            level: true,
            isVerified: true,
            isModerator: true,
            experience: true,
            farmType: true,
            location: true
          }
        },
        category: true,
        votes: true,
        comments: {
          include: {
            author: {
              select: { 
                id: true, 
                username: true, 
                firstName: true, 
                lastName: true,
                avatar: true,
                reputation: true,
                isVerified: true,
                isModerator: true
              }
            }
          }
        },
        _count: {
          select: { votes: true, comments: true }
        }
      }
    });
    
    res.json({ questions });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// Create new question
app.post('/api/questions', upload.array('images', 5), async (req, res) => {
  try {
    const { title, content, categoryId, priority = 'normal', tags } = req.body;
    
    // Validation
    if (!title || !content || !categoryId) {
      return res.status(400).json({ error: 'Title, content, and category are required' });
    }
    
    // Create or find user
    let user = await prisma.communityUser.findFirst({
      where: { email: req.userEmail }
    });
    
    if (!user) {
      user = await prisma.communityUser.create({
        data: {
          username: req.userName || req.userEmail.split('@')[0],
          firstName: req.userName ? req.userName.split(' ')[0] : 'User',
          lastName: req.userName ? (req.userName.split(' ')[1] || '') : '',
          email: req.userEmail,
          passwordHash: 'auto-generated',
          isExpert: false
        }
      });
    }
    
    // Process uploaded images
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    }
    
    const question = await prisma.question.create({
      data: {
        title,
        content,
        categoryId,
        tags: Array.isArray(tags) ? tags : tags ? [tags] : [],
        images: imageUrls,
        authorId: user.id,
        isUrgent: Boolean(priority === 'urgent')
      },
      include: {
        author: {
          select: { 
            id: true, 
            username: true, 
            firstName: true, 
            lastName: true,
            email: true, 
            avatar: true,
            isExpert: true 
          }
        },
        category: true,
        votes: true,
        comments: true
      }
    });
    
    res.status(201).json(question);
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ error: 'Failed to create question' });
  }
});

// Get question details
app.get('/api/questions/:id', async (req, res) => {
  try {
    const question = await prisma.question.findUnique({
      where: { id: req.params.id },
      include: {
        author: {
          select: { 
            id: true, 
            username: true, 
            firstName: true, 
            lastName: true,
            email: true, 
            avatar: true,
            isExpert: true 
          }
        },
        category: true,
        votes: {
          include: {
            user: {
              select: { 
                id: true, 
                username: true, 
                firstName: true, 
                lastName: true
              }
            }
          }
        },
        comments: {
          include: {
            author: {
              select: { 
                id: true, 
                username: true, 
                firstName: true, 
                lastName: true,
                avatar: true,
                isExpert: true 
              }
            },
            votes: true
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });
    
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    // Increment view count (fix: use viewCount as defined in Prisma schema)
    await prisma.question.update({
      where: { id: req.params.id },
      data: { viewCount: { increment: 1 } }
    });
    
    res.json(question);
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ error: 'Failed to fetch question' });
  }
});

// Add comment to question
app.post('/api/questions/:id/comments', async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Comment content is required' });
    }
    
    // Create or find user
    let user = await prisma.communityUser.findFirst({
      where: { email: req.userEmail }
    });
    
    if (!user) {
      user = await prisma.communityUser.create({
        data: {
          username: req.userName || req.userEmail.split('@')[0],
          firstName: req.userName ? req.userName.split(' ')[0] : 'User',
          lastName: req.userName ? (req.userName.split(' ')[1] || '') : '',
          email: req.userEmail,
          passwordHash: 'auto-generated', // This should be handled by proper auth
          isExpert: false
        }
      });
    }
    
    const comment = await prisma.comment.create({
      data: {
        content,
        questionId: req.params.id,
        authorId: user.id
      },
      include: {
        author: {
          select: { 
            id: true, 
            username: true, 
            firstName: true, 
            lastName: true,
            avatar: true,
            isExpert: true 
          }
        },
        votes: true
      }
    });
    
    res.status(201).json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// Vote on question
app.post('/api/questions/:id/vote', async (req, res) => {
  try {
    const { type } = req.body; // 'up' or 'down'
    
    if (!['up', 'down'].includes(type)) {
      return res.status(400).json({ error: 'Vote type must be "up" or "down"' });
    }
    
    // Create or find user
    let user = await prisma.communityUser.findFirst({
      where: { email: req.userEmail }
    });
    
    if (!user) {
      user = await prisma.communityUser.create({
        data: {
          username: req.userName || req.userEmail.split('@')[0],
          firstName: req.userName ? req.userName.split(' ')[0] : 'User',
          lastName: req.userName ? (req.userName.split(' ')[1] || '') : '',
          email: req.userEmail,
          passwordHash: 'auto-generated',
          isExpert: false
        }
      });
    }
    
    // Check if user already voted
    const existingVote = await prisma.vote.findFirst({
      where: {
        userId: user.id,
        questionId: req.params.id
      }
    });
    
    if (existingVote) {
      if (existingVote.type === type) {
        // Remove vote if same type
        await prisma.vote.delete({ where: { id: existingVote.id } });
        return res.json({ message: 'Vote removed' });
      } else {
        // Update vote type
        await prisma.vote.update({
          where: { id: existingVote.id },
          data: { type }
        });
        return res.json({ message: 'Vote updated' });
      }
    }
    
    // Create new vote
    await prisma.vote.create({
      data: {
        type,
        userId: user.id,
        questionId: req.params.id
      }
    });
    
    res.json({ message: 'Vote recorded' });
  } catch (error) {
    console.error('Error voting:', error);
    res.status(500).json({ error: 'Failed to record vote' });
  }
});

// Vote on comment
app.post('/api/comments/:id/vote', async (req, res) => {
  try {
    const { type } = req.body;
    
    if (!['up', 'down'].includes(type)) {
      return res.status(400).json({ error: 'Vote type must be "up" or "down"' });
    }
    
    // Create or find user
    let user = await prisma.communityUser.findFirst({
      where: { email: req.userEmail }
    });
    
    if (!user) {
      user = await prisma.communityUser.create({
        data: {
          username: req.userName || req.userEmail.split('@')[0],
          firstName: req.userName ? req.userName.split(' ')[0] : 'User',
          lastName: req.userName ? (req.userName.split(' ')[1] || '') : '',
          email: req.userEmail,
          passwordHash: 'auto-generated',
          isExpert: false
        }
      });
    }
    
    const existingVote = await prisma.vote.findFirst({
      where: {
        userId: user.id,
        commentId: req.params.id
      }
    });
    
    if (existingVote) {
      if (existingVote.type === type) {
        await prisma.vote.delete({ where: { id: existingVote.id } });
        return res.json({ message: 'Vote removed' });
      } else {
        await prisma.vote.update({
          where: { id: existingVote.id },
          data: { type }
        });
        return res.json({ message: 'Vote updated' });
      }
    }
    
    await prisma.vote.create({
      data: {
        type,
        userId: user.id,
        commentId: req.params.id
      }
    });
    
    res.json({ message: 'Vote recorded' });
  } catch (error) {
    console.error('Error voting on comment:', error);
    res.status(500).json({ error: 'Failed to record vote' });
  }
});

// Get community stats
app.get('/api/stats', async (req, res) => {
  try {
    const [totalQuestions, totalUsers, totalComments, totalVotes] = await Promise.all([
      prisma.question.count(),
      prisma.communityUser.count(),
      prisma.comment.count(),
      prisma.vote.count()
    ]);
    
    res.json({
      totalQuestions,
      totalUsers,
      totalComments,
      totalVotes,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
  }
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🌱 Community Hub Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📡 API base: http://localhost:${PORT}/api`);
  console.log(`🌍 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`📁 File uploads: /uploads`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down Community Hub server...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Shutting down Community Hub server...');
  await prisma.$disconnect();
  process.exit(0);
});
