import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'
import dynamic from 'next/dynamic'

// Use dynamic imports for client components
const NovelHeader = dynamic(() => import('@/components/NovelHeader'))
const NovelContent = dynamic(() => import('@/components/NovelContent'))
const CommentsSection = dynamic(() => import('@/components/CommentsSection'))

async function getNovel(slug) {
  console.log('Fetching novel with slug:', slug)
  try {
    const novel = await prisma.novels.findUnique({
      where: { slug },
      include: {
        novel_genres: {
          include: {
            genres: true
          }
        },
        novel_tags: {
          include: {
            tags: true
          }
        },
        chapters: {
          orderBy: { chapter_number: 'asc' },
          select: {
            chapter_id: true,
            chapter_number: true,
            title: true,
            created_at: true,
            updated_at: true
          }
        },
        ratings: true,
        _count: {
          select: {
            ratings: true,
            chapters: true
          }
        }
      }
    })

    if (!novel) {
      console.error('Novel not found with slug:', slug)
      notFound()
    }

    // Convert Decimal to number for serialization
    const processedNovel = {
      ...novel,
      average_rating: novel.average_rating ? parseFloat(novel.average_rating.toString()) : null,
      ratings_count: novel._count.ratings,
      total_chapters: novel._count.chapters
    }

    console.log('Successfully fetched novel:', processedNovel.title)
    return processedNovel
  } catch (error) {
    console.error('Error fetching novel:', error)
    throw error
  }
}

async function getComments(novelId) {
  console.log('Fetching comments for novel:', novelId)
  try {
    const comments = await prisma.novel_comments.findMany({
      where: { 
        novel_id: novelId,
        parent_comment_id: null // Only get top-level comments
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
        },
        _count: {
          select: {
            other_novel_comments: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    })

    console.log(`Found ${comments.length} comments for novel:`, novelId)
    return comments
  } catch (error) {
    console.error('Error fetching comments:', error)
    return [] // Return empty array on error to prevent page crash
  }
}

export default async function NovelPage({ params }) {
  const { slug } = await params;
  
  if (!slug) {
    console.error('No slug provided')
    notFound()
  }

  try {
    const novel = await getNovel(slug)
    const comments = await getComments(novel.novel_id)

    return (
      <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <NovelHeader novel={novel} />
        <NovelContent novel={novel} />
        <CommentsSection comments={comments} novelId={novel.novel_id} />
      </div>
    )
  } catch (error) {
    console.error('Error in NovelPage:', error)
    throw error // Let Next.js error boundary handle it
  }
} 