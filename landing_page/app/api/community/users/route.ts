import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }

  // Mock user stats and profile data
  const userProfile = {
    id: userId,
    name: 'Current User',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    reputation: 245,
    level: 'Intermediate Farmer',
    badges: ['Helpful', 'Active Community Member'],
    joinedAt: '2025-08-15T00:00:00Z',
    lastActive: new Date().toISOString(),
    location: 'Maharashtra, India',
    bio: 'Passionate organic farmer with 5+ years experience in sustainable agriculture.',
    stats: {
      questionsAsked: 8,
      answersGiven: 23,
      helpfulAnswers: 15,
      totalVotes: 142,
      upvotes: 128,
      downvotes: 14,
      questionsFollowed: 12,
      badgesEarned: 2
    },
    recentActivity: [
      {
        type: 'answer',
        questionTitle: 'Best organic fertilizers for tomato farming?',
        questionId: '1',
        timestamp: '2026-02-09T14:30:00Z'
      },
      {
        type: 'question',
        questionTitle: 'Drip irrigation maintenance tips?',
        questionId: '6',
        timestamp: '2026-02-08T10:15:00Z'
      },
      {
        type: 'vote', 
        questionTitle: 'Aphid infestation in wheat crops',
        questionId: '2',
        timestamp: '2026-02-08T09:00:00Z'
      }
    ]
  }

  return NextResponse.json(userProfile)
}

export async function PUT(request: NextRequest) {
  const body = await request.json()
  const { userId, name, bio, location } = body

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }

  // Mock updating user profile
  const updatedProfile = {
    success: true,
    message: 'Profile updated successfully',
    data: {
      userId,
      name: name || 'Current User',
      bio: bio || '',
      location: location || ''
    }
  }

  return NextResponse.json(updatedProfile)
}