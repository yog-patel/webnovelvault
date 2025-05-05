import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

function serializeChapter(chapter) {
  return {
    ...chapter,
    view_count: typeof chapter.view_count === 'object' && chapter.view_count !== null
      ? Number(chapter.view_count)
      : chapter.view_count || 0,
    created_at: chapter.created_at ? new Date(chapter.created_at).toISOString() : null,
    updated_at: chapter.updated_at ? new Date(chapter.updated_at).toISOString() : null,
    // Add more fields if needed
  }
}

function serializeNovel(novel) {
  return {
    ...novel,
    chapters: Array.isArray(novel.chapters)
      ? novel.chapters.map(chap => ({
          ...chap,
          created_at: chap.created_at ? new Date(chap.created_at).toISOString() : null,
          updated_at: chap.updated_at ? new Date(chap.updated_at).toISOString() : null,
        }))
      : [],
  }
}

export async function GET(req, context) {
  try {
    const session = await getServerSession(authOptions)
    console.log('Session:', session);
    const { id } = await context.params;
    const chapterId = parseInt(id);

    const chapter = await prisma.chapters.findUnique({
      where: { chapter_id: chapterId },
      include: {
        novels: {
          select: {
            novel_id: true,
            title: true,
            slug: true,
            cover_image_url: true,
            description: true,
            chapters: {
              select: {
                chapter_id: true,
                chapter_number: true,
                title: true,
                created_at: true,
                updated_at: true
              },
              orderBy: {
                chapter_number: 'asc'
              }
            }
          }
        },
        chapter_comments: {
          where: {
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
        }
      }
    })

    if (!chapter) {
      console.error('Chapter not found for id:', chapterId);
      return NextResponse.json(
        { message: 'Chapter not found' },
        { status: 404 }
      )
    }

    // Debug log for comments
    console.log('chapter.chapter_comments:', chapter.chapter_comments);

    // Check if chapter is free or user is logged in
    if (!chapter.is_free && !session) {
      return NextResponse.json(
        { message: 'Please login to read this chapter' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      chapter: serializeChapter({
        chapter_id: chapter.chapter_id,
        chapter_number: chapter.chapter_number,
        title: chapter.title,
        content: chapter.content,
        is_free: chapter.is_free,
        view_count: chapter.view_count,
        created_at: chapter.created_at,
        updated_at: chapter.updated_at,
        comments: chapter.chapter_comments || []
      }),
      novel: serializeNovel({
        novel_id: chapter.novels.novel_id,
        title: chapter.novels.title,
        slug: chapter.novels.slug,
        cover_image_url: chapter.novels.cover_image_url,
        description: chapter.novels.description,
        chapters: chapter.novels.chapters
      })
    })
  } catch (error) {
    console.error('Chapter fetch error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req, context) {
  try {
    const session = await getServerSession(authOptions)
    console.log('POST /api/chapters/[id] session:', session);
    const { id } = await context.params;
    const chapterId = parseInt(id);
    console.log('POST /api/chapters/[id] chapterId:', chapterId);

    const chapter = await prisma.chapters.findUnique({
      where: { chapter_id: chapterId },
      include: { novels: true }
    })
    if (!chapter) {
      console.log('POST /api/chapters/[id] chapter not found');
      return NextResponse.json({ message: 'Chapter not found' }, { status: 404 })
    }
    console.log('POST /api/chapters/[id] upsert values:', {
      user_id: session?.user?.id,
      novel_id: chapter.novels.novel_id,
      last_read_chapter: chapterId
    });
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    await prisma.bookmarks.upsert({
      where: {
        user_id_novel_id: {
          user_id: Number(session.user.id),
          novel_id: chapter.novels.novel_id
        }
      },
      update: {
        chapters: {
          connect: {
            chapter_id: chapterId
          }
        }
      },
      create: {
        users: {
          connect: {
            user_id: Number(session.user.id)
          }
        },
        novels: {
          connect: {
            novel_id: chapter.novels.novel_id
          }
        },
        chapters: {
          connect: {
            chapter_id: chapterId
          }
        }
      }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Bookmark update error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
} 