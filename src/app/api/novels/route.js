import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // Check if Prisma client is initialized
    if (!prisma) {
      console.error('Prisma client is not initialized')
      return NextResponse.json({
        featured: [],
        newest: [],
        popular: [],
        completed: []
      })
    }

    // Define the base select object to minimize data fetched
    const baseSelect = {
      novel_id: true,
      title: true,
      author: true,
      cover_image_url: true,
      status: true,
      average_rating: true,
      slug: true,
      created_at: true,
      updated_at: true,
      _count: {
        select: {
          chapters: true,
          ratings: true,
          bookmarks: true
        }
      }
    }

    // Run all queries in parallel with error handling for each
    const results = await Promise.allSettled([
      // Featured novels
      prisma.novels.findMany({
        where: { is_featured: true },
        take: 6,
        select: {
          ...baseSelect,
          novel_genres: {
            select: {
              genres: {
                select: {
                  genre_id: true,
                  name: true
                }
              }
            }
          }
        }
      }),

      // Newest novels
      prisma.novels.findMany({
        orderBy: { created_at: 'desc' },
        take: 6,
        select: baseSelect
      }),

      // Popular novels
      prisma.novels.findMany({
        orderBy: { view_count: 'desc' },
        take: 6,
        select: baseSelect
      }),

      // Completed novels
      prisma.novels.findMany({
        where: { status: 'completed' },
        take: 6,
        select: baseSelect
      })
    ])

    // Process results and handle any individual query failures
    const [featured, newest, popular, completed] = results.map((result) => {
      if (result.status === 'rejected') {
        console.error('Query failed:', result.reason)
        return []
      }
      return result.value
    })

    // Serialize the Decimal fields and ensure all required fields exist
    const serializeNovel = (novel) => {
      if (!novel) return null
      
      return {
        ...novel,
        novel_id: novel.novel_id,
        title: novel.title || 'Untitled',
        author: novel.author || 'Unknown',
        slug: novel.slug || `novel-${novel.novel_id}`,
        status: novel.status || 'ongoing',
        cover_image_url: novel.cover_image_url || '/placeholder-cover.jpg',
        average_rating: novel.average_rating ? parseFloat(novel.average_rating.toString()) : 0,
        total_chapters: novel._count?.chapters || 0,
        total_ratings: novel._count?.ratings || 0,
        total_bookmarks: novel._count?.bookmarks || 0,
        created_at: novel.created_at?.toISOString(),
        updated_at: novel.updated_at?.toISOString()
      }
    }

    // Filter out any null values from serialization
    const response = {
      featured: featured.map(serializeNovel).filter(Boolean),
      newest: newest.map(serializeNovel).filter(Boolean),
      popular: popular.map(serializeNovel).filter(Boolean),
      completed: completed.map(serializeNovel).filter(Boolean)
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('API Route Error:', error)
    console.error('Error stack:', error.stack)
    return NextResponse.json({
      featured: [],
      newest: [],
      popular: [],
      completed: []
    })
  }
}