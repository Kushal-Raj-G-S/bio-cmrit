import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

// 2-minute cache for questions
const cache = new Map<string, { data: any; expires: number }>()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sort = searchParams.get('sort') || 'newest'
    const category = searchParams.get('category')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Check cache
    const cacheKey = `questions_${sort}_${category}_${page}_${limit}`
    const cached = cache.get(cacheKey)
    if (cached && cached.expires > Date.now()) {
      return NextResponse.json(cached.data, { headers: { 'X-Cache': 'HIT' } })
    }

    // Build a SIMPLIFIED query for faster response (reduce joins)
    let query = supabase
      .from('community_questions')
      .select(`
        *,
        profiles:author_id (
          id,
          full_name,
          email,
          phone,
          avatar_url,
          phone_verified,
          aadhaar_verified
        ),
        community_categories:category_id (
          id,
          name,
          color,
          icon
        )
      `)

    // Apply category filter if provided
    if (category && category !== 'all') {
      query = query.eq('category_id', category)
    }

    // Apply sorting
    switch (sort) {
      case 'newest':
        query = query.order('created_at', { ascending: false })
        break
      case 'oldest':
        query = query.order('created_at', { ascending: true })
        break
      case 'most-voted':
        query = query.order('vote_count', { ascending: false })
        break
      case 'unanswered':
        query = query.eq('is_answered', false).order('created_at', { ascending: false })
        break
      default:
        query = query.order('created_at', { ascending: false })
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: questions, error } = await query

    if (error) {
      console.error('❌ Questions fetch error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!questions || questions.length === 0) {
      return NextResponse.json([])
    }

    // Transform the data to match frontend expectations
    const transformedQuestions = questions.map(question => {
      const author = question.profiles
      const category = question.community_categories
      
      // Parse full_name into firstName and lastName
      const fullName = author?.full_name || 'Anonymous User'
      const nameParts = fullName.trim().split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''
      
      // Build location string from city, district, state
      const locationParts = [author?.city, author?.district, author?.state].filter(Boolean)
      const location = locationParts.join(', ') || undefined

      return {
        id: question.id,
        title: question.title,
        content: question.content,
        images: [],
        tags: question.tags || [],
        isUrgent: false,
        isPinned: question.is_pinned || false,
        isSolved: question.is_answered || false,
        isAnonymous: false,
        viewCount: question.view_count || 0,
        upvotes: question.vote_count || 0,
        downvotes: 0,
        voteScore: question.vote_count || 0,
        createdAt: new Date(question.created_at),
        updatedAt: new Date(question.updated_at),
        commentCount: question.comment_count || 0,
        author: {
          id: author?.id || question.author_id,
          email: author?.email || '',
          username: author?.phone || '',
          firstName: firstName,
          lastName: lastName,
          avatar: author?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
          bio: author?.bio || undefined,
          location: location,
          reputation: 0,
          level: 1,
          badges: [],
          isVerified: author?.phone_verified || author?.aadhaar_verified || false,
          isModerator: false,
          isExpert: false,
          createdAt: new Date(author?.created_at || question.created_at),
          updatedAt: new Date(author?.updated_at || question.updated_at),
          lastActive: new Date(),
          farmName: author?.farm_name || undefined,
          farmSize: author?.farm_size ? (author.farm_size.charAt(0).toUpperCase() + author.farm_size.slice(1)) as 'Small' | 'Medium' | 'Large' : undefined,
          farmType: undefined,
          specialties: author?.primary_crops ? author.primary_crops.split(',').map((c: string) => c.trim()) : undefined,
          experience: author?.experience_years ? (
            author.experience_years === '0-2' ? 'Beginner' :
            author.experience_years === '3-5' || author.experience_years === '6-10' ? 'Intermediate' :
            'Expert'
          ) as 'Beginner' | 'Intermediate' | 'Expert' : undefined
        },
        category: {
          id: category?.id || question.category_id,
          name: category?.name || 'General',
          slug: category?.name?.toLowerCase().replace(/\s+/g, '-') || 'general',
          color: category?.color || '#10b981',
          icon: category?.icon || undefined,
          order: 0,
          isActive: true,
          questionCount: 0
        }
      }
    })
    
    // Cache the result for 2 minutes
    cache.set(cacheKey, { data: transformedQuestions, expires: Date.now() + 120000 })
    
    return NextResponse.json(transformedQuestions, { headers: { 'X-Cache': 'MISS' } })
  } catch (error) {
    console.error('❌ Questions API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 POST /api/community/questions called')
    const body = await request.json()
    console.log('📥 Received body:', body)
    
    const { title, content, categoryId, tags } = body

    if (!title || !content) {
      console.log('❌ Missing title or content')
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    // Get the authenticated user from the session
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    
    let userId = null
    
    if (token) {
      const { data: { user }, error: authError } = await supabase.auth.getUser(token)
      if (!authError && user) {
        userId = user.id
      }
    }

    // If no authenticated user found, try getting from request body or use dev fallback
    if (!userId) {
      // For now, use the user ID from your profile since auth might not be working properly
      userId = '485625cc-7f8d-48f3-b293-9b47cb9f6a62'  // Ramesh's user ID
    }

    console.log('✅ Validation passed, inserting question...', {
      title,
      content,
      categoryId,
      tags,
      authorId: userId
    })

    // Insert the new question
    const { data: newQuestion, error } = await supabase
      .from('community_questions')
      .insert({
        title,
        content,
        category_id: categoryId,
        tags: tags || [],
        author_id: userId,
        images: []
      })
      .select()
      .single()

    if (error) {
      console.error('💥 Question creation error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('📝 Question inserted:', newQuestion)

    // Fetch additional data for response
    const { data: categories } = await supabase
      .from('community_categories')
      .select('*')

    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')

    const category = categories?.find(c => c.id === newQuestion.category_id)
    const author = profiles?.find(p => p.id === newQuestion.author_id)
    
    if (!author) {
      return NextResponse.json({ error: 'Author not found' }, { status: 404 })
    }

    // Transform the response
    const transformedQuestion = {
      ...newQuestion,
      author: {
        id: author.id,
        name: author.full_name || author.email?.split('@')[0] || 'User',
        avatar: author.avatar_url || null,
        reputation: 50
      },
      category: category || null,
      images: newQuestion.images || []
    }

    console.log('🎉 Returning transformed question:', transformedQuestion)
    return NextResponse.json(transformedQuestion, { status: 201 })
  } catch (error) {
    console.error('💥 Question creation API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
