import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  console.log('API Route: Fetching novels...')
  
  if (!prisma) {
    console.error('Prisma client is not initialized')
    return NextResponse.json(
      { error: 'Database connection error' },
      { status: 500 }
    )
  }

  try {
    // Ensure we're connected to the database
    if (!prisma.$isConnected) {
      console.log('Connecting to database...')
      await prisma.$connect()
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
    const [featured, newest, popular, completed] = results.map((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Query ${index} failed:`, result.reason)
        return [] // Return empty array for failed queries
      }
      return result.value
    })

    // Serialize the Decimal fields and ensure all required fields exist
    const serializeNovel = (novel) => {
      if (!novel) return null
      
      try {
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
      } catch (error) {
        console.error('Error serializing novel:', error)
        return null
      }
    }

    // Filter out any null values from serialization
    const response = {
      featured: featured.map(serializeNovel).filter(Boolean),
      newest: newest.map(serializeNovel).filter(Boolean),
      popular: popular.map(serializeNovel).filter(Boolean),
      completed: completed.map(serializeNovel).filter(Boolean)
    }

    // Log the response size for monitoring
    console.log('API Response size:', JSON.stringify(response).length)
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('API Route Error:', error)
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      { 
        error: error.message || 'Failed to fetch novels',
        code: error.code,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  } finally {
    // Don't disconnect in development to maintain the connection
    if (process.env.NODE_ENV === 'production') {
      await prisma.$disconnect()
    }
  }
} 