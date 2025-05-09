import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { chapterId, content, parentCommentId } = await req.json()

    if (!content || !chapterId) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    const comment = await prisma.chapter_comments.create({
      data: {
        content,
        chapter_id: parseInt(chapterId),
        user_id: parseInt(session.user.id),
        parent_comment_id: parentCommentId ? parseInt(parentCommentId) : null
      },
      include: {
        users: {
          select: {
            username: true,
            display_name: true,
            avatar_url: true
          }
        },
        other_chapter_comments: {
          include: {
            users: {
              select: {
                username: true,
                display_name: true,
                avatar_url: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(comment)
  } catch (error) {
    console.error('Chapter comments error:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const chapterId = searchParams.get('chapterId')

    if (!chapterId) {
      return NextResponse.json(
        { message: 'Chapter ID is required' },
        { status: 400 }
      )
    }

    const comments = await prisma.chapter_comments.findMany({
      where: {
        chapter_id: parseInt(chapterId),
        parent_comment_id: null // Only get top-level comments
      },
      include: {
        users: {
          select: {
            username: true,
            display_name: true,
            avatar_url: true
          }
        },
        other_chapter_comments: {
          include: {
            users: {
              select: {
                username: true,
                display_name: true,
                avatar_url: true
              }
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { message: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
} 