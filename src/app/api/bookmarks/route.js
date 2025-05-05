import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// Rate limiting map (in-memory for development, should use Redis in production)
const rateLimits = new Map()

// Rate limit configuration
const RATE_LIMIT = {
  windowMs: 60 * 1000, // 1 minute
  max: 30 // 30 requests per minute
}

// Rate limiting function
function checkRateLimit(userId) {
  const now = Date.now()
  const userRequests = rateLimits.get(userId) || []
  
  // Remove old requests
  const recentRequests = userRequests.filter(time => time > now - RATE_LIMIT.windowMs)
  
  if (recentRequests.length >= RATE_LIMIT.max) {
    return false
  }
  
  recentRequests.push(now)
  rateLimits.set(userId, recentRequests)
  return true
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Check rate limit
    if (!checkRateLimit(session.user.id)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const bookmarks = await prisma.bookmarks.findMany({
      where: {
        user_id: parseInt(session.user.id)
      },
      include: {
        novels: {
          select: {
            novel_id: true,
            title: true,
            cover_image_url: true,
            slug: true,
            status: true,
            chapters: {
              select: {
                chapter_id: true,
                chapter_number: true,
                title: true,
                created_at: true
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
      },
      orderBy: {
        updated_at: 'desc'
      }
    })

    // Process bookmarks to include reading progress
    const processedBookmarks = bookmarks.map(bookmark => {
      const totalChapters = bookmark.novels.chapters.length
      const currentChapter = bookmark.chapters?.chapter_number || 0
      const progress = totalChapters > 0 ? (currentChapter / totalChapters) * 100 : 0

      return {
        ...bookmark,
        progress: Math.round(progress),
        total_chapters: totalChapters
      }
    })

    return NextResponse.json(processedBookmarks)
  } catch (error) {
    console.error('Error fetching bookmarks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookmarks' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Check rate limit
    if (!checkRateLimit(session.user.id)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { novel_id, chapter_id } = await request.json()
    
    // Input validation
    if (!novel_id || typeof novel_id !== 'number') {
      return NextResponse.json(
        { error: 'Valid novel ID is required' },
        { status: 400 }
      )
    }

    // Verify novel exists
    const novel = await prisma.novels.findUnique({
      where: {
        novel_id
      }
    })

    if (!novel) {
      return NextResponse.json(
        { error: 'Novel not found' },
        { status: 404 }
      )
    }

    // If chapter_id is provided, verify it belongs to the novel
    if (chapter_id) {
      const chapter = await prisma.chapters.findFirst({
        where: {
          chapter_id,
          novel_id
        }
      })

      if (!chapter) {
        return NextResponse.json(
          { error: 'Invalid chapter for this novel' },
          { status: 400 }
        )
      }
    }

    // Check if bookmark already exists
    const existingBookmark = await prisma.bookmarks.findUnique({
      where: {
        user_id_novel_id: {
          user_id: parseInt(session.user.id),
          novel_id
        }
      }
    })

    let bookmark
    if (existingBookmark) {
      // Update existing bookmark
      bookmark = await prisma.bookmarks.update({
        where: {
          bookmark_id: existingBookmark.bookmark_id
        },
        data: {
          chapter_id: chapter_id || existingBookmark.chapter_id,
          updated_at: new Date()
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
                }
              }
            }
          },
          chapters: {
            select: {
              chapter_id: true,
              chapter_number: true,
              title: true
            }
          }
        }
      })
    } else {
      // Create new bookmark
      bookmark = await prisma.bookmarks.create({
        data: {
          user_id: parseInt(session.user.id),
          novel_id,
          chapter_id,
          created_at: new Date(),
          updated_at: new Date()
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
                }
              }
            }
          },
          chapters: {
            select: {
              chapter_id: true,
              chapter_number: true,
              title: true
            }
          }
        }
      })
    }

    // Calculate reading progress
    const totalChapters = bookmark.novels.chapters.length
    const currentChapter = bookmark.chapters?.chapter_number || 0
    const progress = totalChapters > 0 ? (currentChapter / totalChapters) * 100 : 0

    return NextResponse.json({
      ...bookmark,
      progress: Math.round(progress),
      total_chapters: totalChapters
    })
  } catch (error) {
    console.error('Error managing bookmark:', error)
    return NextResponse.json(
      { error: 'Failed to manage bookmark' },
      { status: 500 }
    )
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Check rate limit
    if (!checkRateLimit(session.user.id)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { novel_id } = await request.json()
    if (!novel_id || typeof novel_id !== 'number') {
      return NextResponse.json(
        { error: 'Valid novel ID is required' },
        { status: 400 }
      )
    }

    const result = await prisma.bookmarks.deleteMany({
      where: {
        user_id: parseInt(session.user.id),
        novel_id
      }
    })

    if (result.count === 0) {
      return NextResponse.json(
        { error: 'Bookmark not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Bookmark deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting bookmark:', error)
    return NextResponse.json(
      { error: 'Failed to delete bookmark' },
      { status: 500 }
    )
  }
} 