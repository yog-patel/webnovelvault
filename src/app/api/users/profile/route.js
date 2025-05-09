import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function PUT(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { displayName, bio, avatarUrl } = await req.json()

    if (!displayName) {
      return NextResponse.json(
        { message: 'Display name is required' },
        { status: 400 }
      )
    }

    const user = await prisma.users.update({
      where: {
        user_id: parseInt(session.user.id)
      },
      data: {
        display_name: displayName,
        bio: bio || null,
        avatar_url: avatarUrl || null,
        updated_at: new Date()
      }
    })

    return NextResponse.json({
      id: user.user_id,
      username: user.username,
      email: user.email,
      displayName: user.display_name,
      bio: user.bio,
      avatarUrl: user.avatar_url
    })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.users.findUnique({
      where: {
        user_id: parseInt(session.user.id)
      },
      select: {
        user_id: true,
        username: true,
        email: true,
        display_name: true,
        bio: true,
        avatar_url: true,
        _count: {
          select: {
            bookmarks: true,
            reading_history: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: user.user_id,
      username: user.username,
      email: user.email,
      displayName: user.display_name,
      bio: user.bio,
      avatarUrl: user.avatar_url,
      bookmarkCount: user._count.bookmarks,
      readHistoryCount: user._count.reading_history
    })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 