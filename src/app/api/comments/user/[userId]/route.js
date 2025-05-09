import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Ensure params.userId is available
    if (!params?.userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      )
    }

    const userId = parseInt(params.userId)
    if (isNaN(userId)) {
      return NextResponse.json(
        { message: 'Invalid user ID' },
        { status: 400 }
      )
    }

    const comments = await prisma.novel_comments.findMany({
      where: {
        user_id: userId
      },
      include: {
        users: {
          select: {
            user_id: true,
            username: true,
            display_name: true,
            avatar_url: true
          }
        },
        novels: {
          select: {
            novel_id: true,
            title: true,
            slug: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error('Error fetching user comments:', error)
    return NextResponse.json(
      { message: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
} 