import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { questionId, userId } = body

    if (!questionId) {
      return NextResponse.json(
        { error: 'questionId is required' },
        { status: 400 }
      )
    }

    // Increment view count
    const { data: question } = await supabase
      .from('community_questions')
      .select('views')
      .eq('id', questionId)
      .single()

    if (question) {
      await supabase
        .from('community_questions')
        .update({ views: (question.views || 0) + 1 })
        .eq('id', questionId)

      return NextResponse.json({
        success: true,
        views: (question.views || 0) + 1
      })
    }

    return NextResponse.json(
      { error: 'Question not found' },
      { status: 404 }
    )
  } catch (error: any) {
    console.error('View tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track view', details: error.message },
      { status: 500 }
    )
  }
}
