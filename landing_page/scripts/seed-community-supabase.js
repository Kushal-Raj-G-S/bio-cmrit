const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://mjpklbrzusbrocsluoum.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qcGtsYnJ6dXNicm9jc2x1b3VtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzIwNTc3NywiZXhwIjoyMDc4NzgxNzc3fQ.n3hRBpexiMOmnDtskoMnTBEWOEHc347jX-XCu2HN59E'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedCommunityDatabase() {
  try {
    console.log('🔗 Connecting to Supabase...')

    // Skip table creation via RPC, assume tables exist or use Supabase SQL editor
    console.log('⚠️ Skipping table creation - use Supabase SQL Editor to run schema first')

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
      { name: 'General Discussion', slug: 'general', icon: '💬', color: '#64748b', description: 'General farming topics and community discussions' }
    ]

    const { error: categoriesError } = await supabase
      .from('community_categories')
      .upsert(categories, { onConflict: 'slug' })

    if (categoriesError) {
      throw categoriesError
    }

    console.log(`✅ Seeded ${categories.length} categories!`)

    // ================================================================
    // GET CATEGORY IDS
    // ================================================================
    
    const { data: categoriesData, error: fetchCategoriesError } = await supabase
      .from('community_categories')
      .select('id, slug')

    if (fetchCategoriesError) {
      throw fetchCategoriesError
    }

    const categoryMap = {}
    categoriesData.forEach(cat => {
      categoryMap[cat.slug] = cat.id
    })

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
        comment_count: 3
      },
      {
        title: 'Aphid infestation in wheat crops - urgent help needed!',
        content: 'My wheat field is heavily infested with aphids. The attack started 3 days ago and is spreading fast. I have tried neem oil spray but no improvement. Please suggest immediate action.',
        author_id: 'user-2',
        author_name: 'Suresh Patel',
        author_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        category_id: categoryMap['pest-control'],
        tags: ['wheat', 'aphid', 'pest', 'urgent'],
        views: 128,
        vote_count: 15,
        comment_count: 8,
        is_answered: true
      },
      {
        title: 'pH level of soil is 8.2 - how to reduce it for paddy cultivation?',
        content: 'Soil test results show pH 8.2 which is too alkaline for rice. What are cost-effective methods to reduce soil pH? My field size is 5 acres.',
        author_id: 'user-3',
        author_name: 'Lakshmi Devi',
        author_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
        category_id: categoryMap['soil-health'],
        tags: ['soil-ph', 'paddy', 'rice', 'alkaline'],
        views: 67,
        vote_count: 11,
        comment_count: 5
      },
      {
        title: 'Drip irrigation vs sprinkler system for sugarcane?',
        content: 'Planning to install irrigation system for 10-acre sugarcane farm. Confused between drip and sprinkler. Which is more water-efficient and cost-effective?',
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
        content: 'Can someone share today\'s onion prices at Nasik Agricultural Produce Market Committee? My crop is ready for harvest.',
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
        content: 'Looking to buy my first tractor for 3-acre mixed farming. Budget is 6-8 lakhs. Considering Mahindra, Sonalika, and Eicher. Please share experiences.',
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
        content: 'My buffalo gave birth to a healthy calf 5 days ago but she is not eating fodder properly. She drinks water normally but refuses green fodder. Should I call a vet?',
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
        content: 'My PM-KISAN installment is delayed by 2 months. Bank account and Aadhaar are linked properly. Land records are updated. What should I do?',
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

    const { data: questionsData, error: questionsError } = await supabase
      .from('community_questions')
      .insert(questions)
      .select('id')

    if (questionsError) {
      throw questionsError
    }

    console.log(`✅ Seeded ${questions.length} questions!`)

    // ================================================================
    // SEED COMMENTS
    // ================================================================
    
    console.log('💬 Seeding comments...')
    
    // Get question IDs for comments
    const { data: allQuestions } = await supabase
      .from('community_questions')
      .select('id')
      .order('created_at', { ascending: true })

    const comments = [
      {
        question_id: allQuestions[0].id,
        author_id: 'user-9',
        author_name: 'Dr. Ashok Kumar',
        author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        content: 'For tomatoes, I highly recommend vermicompost (300kg/acre) + neem cake (200kg/acre). This combination has given me 40% higher yield.',
        vote_count: 5,
        is_answer: true
      },
      {
        question_id: allQuestions[0].id,
        author_id: 'user-10',
        author_name: 'Organic Farmer',
        author_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
        content: 'Add bone meal for phosphorus and wood ash for potassium. Make liquid fertilizer using kitchen waste and cow urine.',
        vote_count: 3
      },
      {
        question_id: allQuestions[1].id,
        author_id: 'user-11',
        author_name: 'Agricultural Expert',
        author_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        content: 'For immediate action: Use Imidacloprid 17.8% SL at 0.5ml per liter water. Spray early morning or evening. Follow PHI guidelines strictly.',
        vote_count: 12,
        is_answer: true
      },
      {
        question_id: allQuestions[2].id,
        author_id: 'user-12',
        author_name: 'Soil Scientist',
        author_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
        content: 'For 5 acres, use 500kg elemental sulfur + 2 tons farm yard manure. Apply before monsoon so sulfur breaks down naturally.',
        vote_count: 9,
        is_answer: true
      }
    ]

    const { error: commentsError } = await supabase
      .from('community_comments')
      .insert(comments)

    if (commentsError) {
      throw commentsError
    }

    console.log(`✅ Seeded ${comments.length} comments!`)

    // ================================================================
    // UPDATE CATEGORY COUNTS
    // ================================================================
    
    console.log('📊 Updating category question counts...')
    
    for (const category of categoriesData) {
      const { count } = await supabase
        .from('community_questions')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', category.id)

      await supabase
        .from('community_categories')
        .update({ question_count: count })
        .eq('id', category.id)
    }

    console.log('✅ Updated category counts!')

    // ================================================================
    // TEST DATA RETRIEVAL
    // ================================================================
    
    console.log('🧪 Testing data retrieval...')
    
    // Test categories
    const { data: testCategories, error: testCatError } = await supabase
      .from('community_categories')
      .select('*')
      .order('name')

    if (testCatError) throw testCatError
    console.log(`📂 Found ${testCategories.length} categories`)
    
    // Test questions with category names
    const { data: testQuestions, error: testQuestError } = await supabase
      .from('community_questions')
      .select(`
        *,
        community_categories!category_id (
          name,
          icon,
          color
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5)

    if (testQuestError) throw testQuestError
    console.log(`❓ Found ${testQuestions.length} questions`)
    
    // Test comments
    const { data: testComments, error: testCommError } = await supabase
      .from('community_comments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3)

    if (testCommError) throw testCommError
    console.log(`💬 Found ${testComments.length} comments`)

    console.log('\\n🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY! 🎉')
    console.log('\\n📈 Summary:')
    console.log(`   • ${testCategories.length} Categories`)
    console.log(`   • ${questions.length} Questions`)  
    console.log(`   • ${comments.length} Comments`)
    console.log('\\n✅ Ready to test API endpoints!')

  } catch (error) {
    console.error('❌ Error seeding database:', error)
  }
}

// Run the seeding
seedCommunityDatabase()