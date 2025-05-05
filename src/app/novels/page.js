import { Suspense } from 'react'
import prisma from '@/lib/prisma'
import NovelCard from '@/components/NovelCard'
import NovelFilters from '@/components/NovelFilters'
import Link from 'next/link'

async function getNovels(searchParams = {}) {
  try {
    // Safely extract parameters with defaults
    const genreParam = searchParams?.genre || null
    const genres = genreParam ? genreParam.split(',').filter(Boolean) : []
    const status = searchParams?.status || 'all'
    const sort = searchParams?.sort || 'newest'
    const featured = searchParams?.featured || null
    const page = parseInt(searchParams?.page || '1')
    const limit = parseInt(searchParams?.limit || '12')

    const where = {}
    
    // Prisma query (OR logic)
    if (genres.length > 0) {
      where.novel_genres = {
        some: {
          genres: {
            name: { in: genres }
          }
        }
      }
    }

    // Handle status filter
    if (status && status !== 'all') {
      where.status = status
    }

    // Handle featured filter
    if (featured === 'true') {
      where.is_featured = true
    }

    // Handle sorting
    const orderBy = {}
    if (sort === 'newest') {
      orderBy.created_at = 'desc'
    } else if (sort === 'popular') {
      orderBy.view_count = 'desc'
    } else if (sort === 'rating') {
      orderBy.average_rating = 'desc'
    }

    const [novels, total] = await Promise.all([
      prisma.novels.findMany({
        where,
        orderBy,
        skip: 0,
        take: 1000,
        select: {
          novel_id: true,
          title: true,
          author: true,
          cover_image_url: true,
          status: true,
          average_rating: true,
          slug: true,
          novel_genres: {
            include: {
              genres: true
            }
          },
          _count: {
            select: {
              chapters: true
            }
          }
        }
      }),
      prisma.novels.count({ where })
    ])

    // AND logic: only novels that have ALL selected genres
    let filteredNovels = novels
    let filteredTotal = total
    if (genres.length > 0) {
      filteredNovels = novels.filter(novel => {
        const novelGenreNames = novel.novel_genres.map(ng => ng.genres.name)
        return genres.every(g => novelGenreNames.includes(g))
      })
      filteredTotal = filteredNovels.length
    }

    // Pagination after filtering
    const paginatedNovels = filteredNovels.slice((page - 1) * limit, page * limit)

    return { novels: paginatedNovels, total: filteredTotal, page, limit }
  } catch (error) {
    console.error('Error fetching novels:', error)
    return { novels: [], total: 0, page: 1, limit: 12 }
  }
}

async function getGenres() {
  try {
    return await prisma.genres.findMany({
      select: {
        genre_id: true,
        name: true
      },
      orderBy: { name: 'asc' }
    })
  } catch (error) {
    console.error('Error fetching genres:', error)
    return []
  }
}

// Utility to ensure searchParams is always a plain object
function toPlainObject(searchParams) {
  if (!searchParams) return { status: 'all' }
  
  if (typeof searchParams.entries === 'function') {
    const params = Object.fromEntries(searchParams.entries())
    if (!params.status) {
      params.status = 'all'
    }
    return params
  }
  
  return { status: 'all', ...searchParams }
}

export default async function NovelsPage({ searchParams }) {
  try {
    const safeSearchParams = toPlainObject(searchParams)
    const [{ novels, total, page, limit }, genres] = await Promise.all([
      getNovels(safeSearchParams),
      getGenres()
    ])

    const totalPages = Math.ceil(total / limit)
    const currentPage = page

    // Create a safe query string
    const queryString = Object.keys(safeSearchParams)
      .filter(key => key !== 'page')
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(safeSearchParams[key])}`)
      .join('&')

    return (
      <div className="space-y-8">
        <NovelFilters genres={genres} />
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4">
          {novels.map((novel) => (
            <NovelCard key={novel.novel_id} novel={novel} />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <Link
                  key={pageNum}
                  href={`/novels?page=${pageNum}${queryString ? `&${queryString}` : ''}`}
                  className={`px-4 py-2 rounded ${
                    currentPage === pageNum
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {pageNum}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  } catch (error) {
    console.error('Error in NovelsPage:', error)
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-semibold text-gray-300 mb-4">Something went wrong</h2>
        <p className="text-gray-400">Please try again later</p>
      </div>
    )
  }
} 