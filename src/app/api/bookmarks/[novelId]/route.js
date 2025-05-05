import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET(req, context) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { novelId } = await context.params
    const novelIdInt = parseInt(novelId)
    if (isNaN(novelIdInt)) {
      return NextResponse.json(
        { error: 'Invalid novel ID' },
        { status: 400 }
      )
    }

    // First verify the novel exists
    const novel = await prisma.novels.findUnique({
      where: {
        novel_id: novelIdInt
      }
    })

    if (!novel) {
      return NextResponse.json(
        { error: 'Novel not found' },
        { status: 404 }
      )
    }

    const bookmark = await prisma.bookmarks.findUnique({
      where: {
        user_id_novel_id: {
          user_id: parseInt(session.user.id),
          novel_id: novelIdInt
        }
      },
      include: {
        novels: {
          select: {
            title: true,
            slug: true,
            chapters: {
              select: {
                chapter_id: true,
                chapter_number: true
              },
              orderBy: {
                chapter_number: 'asc'
              }
            }
          }
        },
        chapters: {
          select: {
            chapter_id: true,
            chapter_number: true,
            title: true,
            created_at: true
          }
        }
      }
    })

    if (!bookmark || !bookmark.novels) {
      return NextResponse.json(null)
    }

    // Calculate reading progress
    const totalChapters = bookmark.novels.chapters ? bookmark.novels.chapters.length : 0
    const currentChapter = bookmark.chapters?.chapter_number || 0
    const progress = totalChapters > 0 ? (currentChapter / totalChapters) * 100 : 0

    return NextResponse.json({
      ...bookmark,
      progress: Math.round(progress),
      total_chapters: totalChapters
    })
  } catch (error) {
    console.error('Bookmark fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookmark' },
      { status: 500 }
    )
  }
} 