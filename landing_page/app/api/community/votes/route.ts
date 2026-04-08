import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, questionId, commentId, voteType } = body

    console.log('📥 Vote API called:', { userId, questionId, voteType })

    if (!userId || (!questionId && !commentId) || !voteType) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, (questionId or commentId), voteType' },
        { status: 400 }
      )
    }

    if (!['up', 'down'].includes(voteType)) {
      return NextResponse.json(
        { error: 'voteType must be "up" or "down"' },
        { status: 400 }
      )
    }

    // Check if user already voted
    const { data: existingVote } = await supabase
      .from('community_votes')
      .select('*')
      .eq('user_id', userId)
      .eq(questionId ? 'question_id' : 'comment_id', questionId || commentId)
      .maybeSingle()

    let newVote = null
    let voteChange = 0

    if (existingVote) {
      // User already voted
      if (existingVote.vote_type === voteType) {
        // Same vote - remove it (toggle off)
        await supabase
          .from('community_votes')
          .delete()
          .eq('id', existingVote.id)
        
        voteChange = voteType === 'up' ? -1 : 1
        newVote = null
      } else {
        // Different vote - update it
        const { data } = await supabase
          .from('community_votes')
          .update({ vote_type: voteType })
          .eq('id', existingVote.id)
          .select()
          .single()
        
        voteChange = voteType === 'up' ? 2 : -2
        newVote = data
      }
    } else {
      // New vote
      const { data } = await supabase
        .from('community_votes')
        .insert({
          user_id: userId,
          question_id: questionId || null,
          comment_id: commentId || null,
          vote_type: voteType
        })
        .select()
        .single()
      
      voteChange = voteType === 'up' ? 1 : -1
      newVote = data
    }

    // Update vote count on question or comment
    if (questionId) {
      const { data: question } = await supabase
        .from('community_questions')
        .select('vote_count')
        .eq('id', questionId)
        .single()
      
      await supabase
        .from('community_questions')
        .update({ vote_count: (question?.vote_count || 0) + voteChange })
        .eq('id', questionId)
    } else if (commentId) {
      const { data: comment } = await supabase
        .from('community_comments')
        .select('vote_count')
        .eq('id', commentId)
        .single()
      
      await supabase
        .from('community_comments')
        .update({ vote_count: (comment?.vote_count || 0) + voteChange })
        .eq('id', commentId)
    }

    // Get updated counts
    const { data: updated } = await supabase
      .from(questionId ? 'community_questions' : 'community_comments')
      .select('vote_count')
      .eq('id', questionId || commentId)
      .single()

    console.log('✅ Vote processed successfully:', {
      voteType: newVote?.vote_type || null,
      newVoteCount: updated?.vote_count || 0
    })

    return NextResponse.json({
      success: true,
      voteType: newVote?.vote_type || null,
      newVoteCount: updated?.vote_count || 0,
      userVote: newVote?.vote_type || null
    })
  } catch (error: any) {
    console.error('💥 Vote error:', error)
    return NextResponse.json(
      { error: 'Failed to process vote', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, questionId, commentId } = body

    if (!userId || (!questionId && !commentId)) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, (questionId or commentId)' },
        { status: 400 }
      )
    }

    // Find and delete the vote
    const { data: existingVote } = await supabase
      .from('community_votes')
      .select('vote_type')
      .eq('user_id', userId)
      .eq(questionId ? 'question_id' : 'comment_id', questionId || commentId)
      .maybeSingle()

    if (existingVote) {
      await supabase
        .from('community_votes')
        .delete()
        .eq('user_id', userId)
        .eq(questionId ? 'question_id' : 'comment_id', questionId || commentId)

      // Update vote count
      const voteChange = existingVote.vote_type === 'up' ? -1 : 1
      
      if (questionId) {
        const { data: question } = await supabase
          .from('community_questions')
          .select('vote_count')
          .eq('id', questionId)
          .single()
        
        await supabase
          .from('community_questions')
          .update({ vote_count: (question?.vote_count || 0) + voteChange })
          .eq('id', questionId)
      } else if (commentId) {
        const { data: comment } = await supabase
          .from('community_comments')
          .select('vote_count')
          .eq('id', commentId)
          .single()
        
        await supabase
          .from('community_comments')
          .update({ vote_count: (comment?.vote_count || 0) + voteChange })
          .eq('id', commentId)
      }
    }

    // Get updated counts
    const { data: updated } = await supabase
      .from(questionId ? 'community_questions' : 'community_comments')
      .select('vote_count')
      .eq('id', questionId || commentId)
      .single()

    return NextResponse.json({
      success: true,
      newVoteCount: updated?.vote_count || 0,
      userVote: null
    })
  } catch (error: any) {
    console.error('Delete vote error:', error)
    return NextResponse.json(
      { error: 'Failed to remove vote', details: error.message },
      { status: 500 }
    )
  }
}