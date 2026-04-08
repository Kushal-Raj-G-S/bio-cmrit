import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const questionId = searchParams.get('questionId')

  if (!questionId) {
    return NextResponse.json({ error: 'questionId required' }, { status: 400 })
  }

  // Mock comments data
  const comments = [
    {
      id: '1',
      questionId,
      author: {
        id: 'user-9',
        name: 'Dr. Ashok Kumar',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        reputation: 520,
        badges: ['Expert', 'Helpful']
      },
      content: 'For tomatoes, I highly recommend vermicompost (300kg/acre) + neem cake (200kg/acre). Also use cow dung slurry every 15 days. This combination has given me 40% higher yield compared to chemical fertilizers.',
      parentId: null,
      voteCount: 12,
      isAnswer: true,
      createdAt: '2026-02-08T11:30:00Z',
      updatedAt: '2026-02-08T11:30:00Z',
      replies: [
        {
          id: '2',
          questionId,
          author: {
            id: 'user-1',
            name: 'Ramesh Kumar',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
            reputation: 245,
            badges: []
          },
          content: 'Thank you Dr. Kumar! Where can I source good quality vermicompost? Is it better to make at home or buy from the market?',
          parentId: '1',
          voteCount: 3,
          isAnswer: false,
          createdAt: '2026-02-08T12:15:00Z',
          updatedAt: '2026-02-08T12:15:00Z'
        }
      ]
    },
    {
      id: '3',
      questionId,
      author: {
        id: 'user-10',
        name: 'Organic Farmer',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
        reputation: 189,
        badges: ['Organic Expert']
      },
      content: 'Add bone meal for phosphorus and wood ash for potassium. Make liquid fertilizer using kitchen waste and cow urine. Very effective and completely natural. I can share the recipe if interested.',
      parentId: null,
      voteCount: 8,
      isAnswer: false,
      createdAt: '2026-02-09T09:45:00Z',
      updatedAt: '2026-02-09T09:45:00Z',
      replies: []
    },
    {
      id: '4',
      questionId,
      author: {
        id: 'user-11',
        name: 'Green Thumb',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        reputation: 67,
        badges: []
      },
      content: 'I have been using only organic methods for 5 years. Compost + mustard cake works very well. Also, intercropping with legumes helps fix nitrogen naturally.',
      parentId: null,
      voteCount: 5,
      isAnswer: false,
      createdAt: '2026-02-09T14:20:00Z',
      updatedAt: '2026-02-09T14:20:00Z',
      replies: []
    }
  ]

  return NextResponse.json(comments)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { questionId, content, authorId, parentId, isAnswer } = body

  if (!questionId || !content || !authorId) {
    return NextResponse.json(
      { error: 'Missing required fields: questionId, content, authorId' },
      { status: 400 }
    )
  }

  // Mock creating a new comment
  const newComment = {
    id: Date.now().toString(),
    questionId,
    author: {
      id: authorId,
      name: 'Current User',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      reputation: 50,
      badges: []
    },
    content,
    parentId: parentId || null,
    voteCount: 0,
    isAnswer: isAnswer || false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    replies: []
  }

  return NextResponse.json(newComment, { status: 201 })
}