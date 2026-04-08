import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

// Long cache for categories (5 minutes - rarely changes)
const cache = new Map<string, { data: any; expires: number }>()

export async function GET() {
  try {
    // Check cache first
    const cached = cache.get('categories')
    if (cached && cached.expires > Date.now()) {
      return NextResponse.json(cached.data, { headers: { 'X-Cache': 'HIT' } })
    }

    const { data: categories, error } = await supabase
      .from('community_categories')
      .select('*')
      .order('name')

    if (error) {
      console.error('Categories fetch error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Cache for 5 minutes
    cache.set('categories', { data: categories, expires: Date.now() + 300000 })

    return NextResponse.json(categories, { headers: { 'X-Cache': 'MISS' } })
  } catch (error) {
    console.error('Categories API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
