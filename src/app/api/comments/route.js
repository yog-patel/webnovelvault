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

    const { novelId, content, parentCommentId } = await req.json()

    if (!content || !novelId) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    const comment = await prisma.novel_comments.create({
      data: {
        content,
        novel_id: parseInt(novelId),
        user_id: parseInt(session.user.id),
        parent_comment_id: parentCommentId ? parseInt(parentCommentId) : null
      },
      include: {
        users: {
          select: {
            username: true,
            avatar_url: true
          }
        },
        other_novel_comments: {
          include: {
            users: {
              select: {
                username: true,
                avatar_url: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(comment)
  } catch (error) {
    console.error('Comment creation error:', error)
    return NextResponse.json(
      { message: 'Failed to submit comment' },
      { status: 500 }
    )
  }
} 