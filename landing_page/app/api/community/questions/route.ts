import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

// Aggressive 5-minute cache for questions
const cache = new Map<string, { data: any; expires: number }>()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sort = searchParams.get('sort') || 'newest'
    const category = searchParams.get('category')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    // Check cache first (most important optimization!)
    const cacheKey = `questions_${sort}_${category}_${page}_${limit}`
    const cached = cache.get(cacheKey)
    if (cached && cached.expires > Date.now()) {
      return NextResponse.json(cached.data, { headers: { 'X-Cache': 'HIT' } })
    }

    // Simplified query - only essential fields (using correct column names)
    let query = supabase
      .from('community_questions')
      .select(`
        id,
        title,
        content,
        tags,
        is_pinned,
        is_answered,
        vote_count,
        comment_count,
        views,
        created_at,
        updated_at,
        author_id,
        category_id,
        profiles!author_id (
          id,
          full_name,
          avatar_url,
          phone_verified
        ),
        community_categories!category_id (
          id,
          name,
          color,
          icon
        )
      `)

    if (category && category !== 'all') {
      query = query.eq('category_id', category)
    }

    // Simplified sorting (using correct column names)
    if (sort === 'popular') {
      query = query.order('vote_count', { ascending: false })
    } else if (sort === 'unanswered') {
      query = query.eq('comment_count', 0).order('created_at', { ascending: false })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    query = query.range(offset, offset + limit - 1)

    const { data: questions, error } = await query

    if (error) {
      console.error('❌ Questions fetch error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!questions || questions.length === 0) {
      cache.set(cacheKey, { data: [], expires: Date.now() + 300000 })
      return NextResponse.json([], { headers: { 'X-Cache': 'MISS' } })
    }

    // FAST transformation - minimal processing
    const result = questions.map(q => {
      const author = q.profiles
      const category = q.community_categories
      const fullName = author?.full_name || 'Anonymous'
      const [firstName = '', ...rest] = fullName.split(' ')

      return {
        id: q.id,
        title: q.title,
        content: q.content,
        tags: q.tags || [],
        isPinned: q.is_pinned || false,
        isSolved: q.is_answered || false,
        votes: q.vote_count || 0,
        answers: q.comment_count || 0,
        views: q.views || 0,
        createdAt: new Date(q.created_at),
        updatedAt: new Date(q.updated_at),
        author: {
          id: author?.id || q.author_id,
          firstName,
          lastName: rest.join(' '),
          avatar: author?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${fullName}`,
          isVerified: author?.phone_verified || false,
          level: 1,
          reputation: 0
        },
        category: {
          id: category?.id || q.category_id,
          name: category?.name || 'General',
          slug: (category?.name || 'general').toLowerCase().replace(/\s+/g, '-'),
          color: category?.color || '#10b981',
          icon: category?.icon
        }
      }
    })

    // Cache for 5 minutes
    cache.set(cacheKey, { data: result, expires: Date.now() + 300000 })

    return NextResponse.json(result, { headers: { 'X-Cache': 'MISS' } })
  } catch (error) {
    console.error('❌ Questions API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, categoryId, tags, authorId } = body

    if (!title || !content || !categoryId || !authorId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('community_questions')
      .insert({
        title,
        content,
        category_id: categoryId,
        author_id: authorId,
        tags: tags || [],
        vote_count: 0,
        comment_count: 0,
        views: 0,
        is_answered: false,
        is_pinned: false
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating question:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Clear cache when new question is created
    cache.clear()

    return NextResponse.json(data)
  } catch (error) {
    console.error('POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
