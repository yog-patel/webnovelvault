import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { chapterId, progressPercentage } = await req.json()

    if (!chapterId || progressPercentage === undefined) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    const history = await prisma.reading_history.upsert({
      where: {
        user_id_chapter_id: {
          user_id: parseInt(session.user.id),
          chapter_id: parseInt(chapterId)
        }
      },
      update: {
        progress_percentage: progressPercentage,
        read_at: new Date()
      },
      create: {
        user_id: parseInt(session.user.id),
        chapter_id: parseInt(chapterId),
        progress_percentage: progressPercentage
      }
    })

    return NextResponse.json(history)
  } catch (error) {
    console.error('Reading history error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const history = await prisma.reading_history.findMany({
      where: {
        user_id: parseInt(session.user.id)
      },
      orderBy: {
        read_at: 'desc'
      },
      take: 15,
      include: {
        chapters: {
          include: {
            novels: true
          }
        }
      }
    })

    // Transform the data to match the expected structure
    const transformedHistory = history.map(item => ({
      history_id: item.history_id,
      read_at: item.read_at,
      chapters: item.chapters,
      novels: item.chapters.novels,
      progress_percentage: item.progress_percentage
    }))

    return NextResponse.json(transformedHistory)
  } catch (error) {
    console.error('Error fetching reading history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reading history' },
      { status: 500 }
    )
  }
} 