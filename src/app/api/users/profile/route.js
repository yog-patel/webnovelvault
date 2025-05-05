import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'

export async function PUT(req) {
  try {
    const session = await getServerSession()
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

    const user = await prisma.user.update({
      where: {
        id: parseInt(session.user.id)
      },
      data: {
        displayName,
        bio,
        avatarUrl
      }
    })

    return NextResponse.json({
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      bio: user.bio,
      avatarUrl: user.avatarUrl
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
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(session.user.id)
      },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        _count: {
          select: {
            bookmarks: true,
            readingHistory: true
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
      ...user,
      bookmarkCount: user._count.bookmarks,
      readHistoryCount: user._count.readingHistory
    })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 