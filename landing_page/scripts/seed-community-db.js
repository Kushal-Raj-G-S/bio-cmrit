const { Client } = require('pg')

// Use correct password from user
const client = new Client({
  host: 'aws-1-ap-south-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.mjpklbrzusbrocsluoum',
  password: 'kushalrajgs',
  ssl: { rejectUnauthorized: false }
})

async function seedDatabase() {
  try {
    console.log('🔗 Connecting to PostgreSQL...')
    await client.connect()
    console.log('✅ Connected successfully!')

    // ================================================================
    // CREATE TABLES
    // ================================================================
    
    console.log('📋 Creating tables...')
    
    // Categories table
    await client.query(`
      CREATE TABLE IF NOT EXISTS community_categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL UNIQUE,
        slug TEXT NOT NULL UNIQUE,
        icon TEXT,
        color TEXT DEFAULT '#10b981',
        question_count INTEGER DEFAULT 0,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `)

    // Questions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS community_questions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        author_id UUID NOT NULL, -- References profiles(id)
        author_name TEXT NOT NULL, -- Denormalized for performance
        author_avatar TEXT,
        category_id UUID REFERENCES community_categories(id) ON DELETE SET NULL,
        tags TEXT[] DEFAULT '{}',
        views INTEGER DEFAULT 0,
        vote_count INTEGER DEFAULT 0,
        comment_count INTEGER DEFAULT 0,
        is_answered BOOLEAN DEFAULT FALSE,
        is_pinned BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `)

    // Comments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS community_comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        question_id UUID NOT NULL REFERENCES community_questions(id) ON DELETE CASCADE,
        author_id UUID NOT NULL, -- References profiles(id)
        author_name TEXT NOT NULL, -- Denormalized for performance
        author_avatar TEXT,
        content TEXT NOT NULL,
        parent_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
        vote_count INTEGER DEFAULT 0,
        is_answer BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `)

    // Votes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS community_votes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL, -- References profiles(id)
        question_id UUID REFERENCES community_questions(id) ON DELETE CASCADE,
        comment_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
        vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, question_id),
        UNIQUE(user_id, comment_id),
        CHECK ((question_id IS NOT NULL AND comment_id IS NULL) OR (question_id IS NULL AND comment_id IS NOT NULL))
      )
    `)

    console.log('✅ Tables created successfully!')

    // ================================================================
    // CREATE INDEXES
    // ================================================================
    
    console.log('🔍 Creating indexes...')
    
    await client.query(`CREATE INDEX IF NOT EXISTS idx_questions_author ON community_questions(author_id)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_questions_category ON community_questions(category_id)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_questions_created ON community_questions(created_at DESC)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_questions_votes ON community_questions(vote_count DESC)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_comments_question ON community_comments(question_id)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_comments_author ON community_comments(author_id)`)
    await client.query(`CREATE INDEX IF NOT EXISTS idx_votes_user ON community_votes(user_id)`)

    console.log('✅ Indexes created successfully!')

    // ================================================================
    // SEED CATEGORIES
    // ================================================================
    
    console.log('🌱 Seeding categories...')
    
    const categories = [
      { name: 'Crop Management', slug: 'crop-management', icon: '🌾', color: '#10b981', description: 'Questions about planting, growing, and harvesting crops' },
      { name: 'Pest Control', slug: 'pest-control', icon: '🐛', color: '#ef4444', description: 'Organic and chemical pest control strategies' },
      { name: 'Soil Health', slug: 'soil-health', icon: '🌱', color: '#8b5cf6', description: 'Soil testing, fertilization, and nutrient management' },
      { name: 'Water Management', slug: 'water-management', icon: '💧', color: '#3b82f6', description: 'Irrigation systems, water conservation, and drainage' },
      { name: 'Market Access', slug: 'market-access', icon: '🏪', color: '#f59e0b', description: 'Selling crops, pricing strategies, and connecting with buyers' },
      { name: 'Equipment & Technology', slug: 'equipment-tech', icon: '🚜', color: '#6366f1', description: 'Farm machinery, tools, and agricultural technology' },
      { name: 'Livestock', slug: 'livestock', icon: '🐄', color: '#ec4899', description: 'Animal husbandry, feeding, and animal health' },
      { name: 'Government Schemes', slug: 'govt-schemes', icon: '🏛️', color: '#14b8a6', description: 'Government programs, subsidies, and support for farmers' },
      { name: 'Weather & Climate', slug: 'weather-climate', icon: '⛅', color: '#06b6d4', description: 'Weather patterns, climate adaptation, and seasonal planning' },
      { name: 'General Discussion', slug: 'general', icon: '💬', color: '#64748b', description: 'General farming topics and community discussions' }
    ]

    for (const cat of categories) {
      await client.query(`
        INSERT INTO community_categories (name, slug, icon, color, description)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (slug) DO NOTHING
      `, [cat.name, cat.slug, cat.icon, cat.color, cat.description])
    }

    // Get category IDs for seeding questions
    const categoryResult = await client.query('SELECT id, slug FROM community_categories')
    const categoryMap = {}
    categoryResult.rows.forEach(row => {
      categoryMap[row.slug] = row.id
    })

    console.log(`✅ Seeded ${categories.length} categories!`)

    // ================================================================
    // SEED QUESTIONS
    // ================================================================
    
    console.log('❓ Seeding questions...')
    
    const questions = [
      {
        title: 'Best organic fertilizers for tomato farming?',
        content: 'I am growing tomatoes in my 2-acre farm and want to switch to organic farming. What are the best organic fertilizers you recommend? Currently using DAP and Urea but want to go chemical-free.',
        author_id: 'user-1',
        author_name: 'Ramesh Kumar',
        author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        category_id: categoryMap['crop-management'],
        tags: ['tomato', 'organic', 'fertilizer'],
        views: 45,
        vote_count: 8,
        comment_count: 5
      },
      {
        title: 'Aphid infestation in wheat crops - urgent help needed!',
        content: 'My wheat field is heavily infested with aphids. The attack started 3 days ago and is spreading fast. I have tried neem oil spray but no improvement. Please suggest immediate action. The crop is in heading stage.',
        author_id: 'user-2',
        author_name: 'Suresh Patel',
        author_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        category_id: categoryMap['pest-control'],
        tags: ['wheat', 'aphid', 'pest', 'urgent'],
        views: 128,
        vote_count: 15,
        comment_count: 12,
        is_answered: true
      },
      {
        title: 'pH level of soil is 8.2 - how to reduce it for paddy cultivation?',
        content: 'Soil test results show pH 8.2 which is too alkaline for rice. What are cost-effective methods to reduce soil pH? My field size is 5 acres. Should I use elemental sulfur or organic matter?',
        author_id: 'user-3',
        author_name: 'Lakshmi Devi',
        author_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
        category_id: categoryMap['soil-health'],
        tags: ['soil-ph', 'paddy', 'rice', 'alkaline'],
        views: 67,
        vote_count: 11,
        comment_count: 8
      },
      {
        title: 'Drip irrigation vs sprinkler system for sugarcane?',
        content: 'Planning to install irrigation system for 10-acre sugarcane farm. Confused between drip and sprinkler. Which is more water-efficient and cost-effective for sugarcane? What is the initial investment difference?',
        author_id: 'user-4',
        author_name: 'Manoj Singh',
        author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        category_id: categoryMap['water-management'],
        tags: ['irrigation', 'sugarcane', 'drip', 'sprinkler'],
        views: 89,
        vote_count: 6,
        comment_count: 4
      },
      {
        title: 'Current market rate for onions in Nasik APMC?',
        content: 'Can someone share today\'s onion prices at Nasik Agricultural Produce Market Committee? My crop is ready for harvest and I want to decide the right timing. Also, any predictions for next month?',
        author_id: 'user-5',
        author_name: 'Vinay Jadhav',
        author_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        category_id: categoryMap['market-access'],
        tags: ['onion', 'market-price', 'nasik', 'apmc'],
        views: 234,
        vote_count: 3,
        comment_count: 7
      },
      {
        title: 'Which tractor brand is most reliable for small farmers?',
        content: 'Looking to buy my first tractor for 3-acre mixed farming (wheat, cotton, vegetables). Budget is 6-8 lakhs. Considering Mahindra, Sonalika, and Eicher. Please share your experiences with reliability, service, and fuel efficiency.',
        author_id: 'user-6',
        author_name: 'Ravi Sharma',
        author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        category_id: categoryMap['equipment-tech'],
        tags: ['tractor', 'mahindra', 'sonalika', 'small-farm'],
        views: 156,
        vote_count: 9,
        comment_count: 11
      },
      {
        title: 'Buffalo not eating properly after giving birth',
        content: 'My buffalo gave birth to a healthy calf 5 days ago but she is not eating fodder properly. She drinks water normally but refuses green fodder and concentrate. No fever. Should I call a vet immediately?',
        author_id: 'user-7',
        author_name: 'Gita Rani',
        author_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
        category_id: categoryMap['livestock'],
        tags: ['buffalo', 'postpartum', 'animal-health', 'feeding'],
        views: 78,
        vote_count: 12,
        comment_count: 6,
        is_answered: true
      },
      {
        title: 'PM-KISAN scheme payment delayed - whom to contact?',
        content: 'My PM-KISAN installment is delayed by 2 months. Bank account and Aadhaar are linked properly. Land records are updated. Checked on pmkisan.gov.in but shows "Under process". What should I do now?',
        author_id: 'user-8',
        author_name: 'Bharat Lal',
        author_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        category_id: categoryMap['govt-schemes'],
        tags: ['pm-kisan', 'payment-delay', 'government-scheme'],
        views: 145,
        vote_count: 7,
        comment_count: 9
      }
    ]

    for (const q of questions) {
      const result = await client.query(`
        INSERT INTO community_questions (title, content, author_id, author_name, author_avatar, category_id, tags, views, vote_count, comment_count, is_answered)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id
      `, [q.title, q.content, q.author_id, q.author_name, q.author_avatar, q.category_id, q.tags, q.views, q.vote_count, q.comment_count, q.is_answered])
      
      q.id = result.rows[0].id
    }

    console.log(`✅ Seeded ${questions.length} questions!`)

    // ================================================================
    // SEED COMMENTS
    // ================================================================
    
    console.log('💬 Seeding comments...')
    
    const comments = [
      {
        question_id: questions[0].id,
        author_id: 'user-9',
        author_name: 'Dr. Ashok Kumar',
        author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        content: 'For tomatoes, I highly recommend vermicompost (300kg/acre) + neem cake (200kg/acre). Also use cow dung slurry every 15 days. This combination has given me 40% higher yield compared to chemical fertilizers.',
        vote_count: 5,
        is_answer: true
      },
      {
        question_id: questions[0].id,
        author_id: 'user-10',
        author_name: 'Organic Farmer',
        author_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
        content: 'Add bone meal for phosphorus and wood ash for potassium. Make liquid fertilizer using kitchen waste and cow urine. Very effective and completely natural.',
        vote_count: 3
      },
      {
        question_id: questions[1].id,
        author_id: 'user-11',
        author_name: 'Agricultural Expert',
        author_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        content: 'For immediate action: Use Imidacloprid 17.8% SL @ 0.5ml/liter water. Spray early morning or evening. Since crop is in heading stage, use only certified pesticides. Follow PHI guidelines strictly.',
        vote_count: 12,
        is_answer: true
      },
      {
        question_id: questions[1].id,
        author_id: 'user-12',
        author_name: 'Raman Farmer',
        author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        content: 'I faced similar issue last year. Along with chemical spray, release ladybird beetles if available. They are natural predators of aphids and provide long-term control.',
        vote_count: 8
      },
      {
        question_id: questions[2].id,
        author_id: 'user-13',
        author_name: 'Soil Scientist',
        author_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
        content: 'For 5 acres, use 500kg elemental sulfur + 2 tons farm yard manure. Apply before monsoon so sulfur breaks down naturally. Alternatively, grow green manure crops like dhaincha which naturally acidifies soil.',
        vote_count: 9,
        is_answer: true
      }
    ]

    for (const comment of comments) {
      await client.query(`
        INSERT INTO community_comments (question_id, author_id, author_name, author_avatar, content, vote_count, is_answer)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [comment.question_id, comment.author_id, comment.author_name, comment.author_avatar, comment.content, comment.vote_count, comment.is_answer])
    }

    console.log(`✅ Seeded ${comments.length} comments!`)

    // ================================================================
    // UPDATE CATEGORY QUESTION COUNTS
    // ================================================================
    
    console.log('📊 Updating category question counts...')
    
    await client.query(`
      UPDATE community_categories 
      SET question_count = (
        SELECT COUNT(*) 
        FROM community_questions 
        WHERE category_id = community_categories.id
      )
    `)

    console.log('✅ Updated category counts!')

    // ================================================================
    // TEST DATA RETRIEVAL
    // ================================================================
    
    console.log('🧪 Testing data retrieval...')
    
    // Test categories
    const categoriesTest = await client.query('SELECT * FROM community_categories ORDER BY name')
    console.log(`📂 Found ${categoriesTest.rows.length} categories`)
    
    // Test questions with category names
    const questionsTest = await client.query(`
      SELECT q.*, c.name as category_name, c.icon as category_icon
      FROM community_questions q
      LEFT JOIN community_categories c ON q.category_id = c.id
      ORDER BY q.created_at DESC
      LIMIT 5
    `)
    console.log(`❓ Found ${questionsTest.rows.length} questions`)
    
    // Test comments
    const commentsTest = await client.query(`
      SELECT * FROM community_comments 
      ORDER BY created_at DESC 
      LIMIT 3
    `)
    console.log(`💬 Found ${commentsTest.rows.length} comments`)

    console.log('\\n🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY! 🎉')
    console.log('\\n📈 Summary:')
    console.log(`   • ${categoriesTest.rows.length} Categories`)
    console.log(`   • ${questions.length} Questions`)  
    console.log(`   • ${comments.length} Comments`)
    console.log('\\n✅ Ready to test API endpoints!')

  } catch (error) {
    console.error('❌ Error seeding database:', error)
  } finally {
    await client.end()
    console.log('🔌 Database connection closed')
  }
}

// Run the seeding
seedDatabase()