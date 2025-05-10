import { Suspense } from 'react'
import prisma from '@/lib/prisma'
import NovelCard from '@/components/NovelCard'
import NovelFilters from '@/components/NovelFilters'
import Link from 'next/link'

async function getNovels(page = 1, limit = 18, sort = 'newest', genre = null, search = null) {
  try {
    const skip = (page - 1) * limit
    const where = {}
    
    if (genre) {
      where.novel_genres = {
        some: {
          genres: {
            name: genre
          }
        }
      }
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } }
      ]
    }

    let orderBy = {}
    switch (sort) {
      case 'newest':
        orderBy = { created_at: 'desc' }
        break
      case 'oldest':
        orderBy = { created_at: 'asc' }
        break
      case 'rating':
        orderBy = { average_rating: 'desc' }
        break
      case 'views':
        orderBy = { view_count: 'desc' }
        break
      default:
        orderBy = { created_at: 'desc' }
    }

    const [novels, count] = await Promise.all([
      prisma.novels.findMany({
        where,
        orderBy,
        take: limit,
        skip,
        select: {
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
      }),
      prisma.novels.count({ where })
    ])

    return {
      novels,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    }
  } catch (error) {
    console.error('Error fetching novels:', error)
    throw error
  }
}

async function getGenres() {
  try {
    return await prisma.genres.findMany({
      select: {
        genre_id: true,
        name: true
      },
      orderBy: {
        name: 'asc'
      }
    })
  } catch (error) {
    console.error('Error fetching genres:', error)
    return []
  }
}

// Utility to ensure searchParams is always a plain object
async function toPlainObject(searchParams) {
  if (!searchParams) return { status: 'all' }
  
  // Convert URLSearchParams to plain object
  if (searchParams instanceof URLSearchParams) {
    return Object.fromEntries(searchParams.entries())
  }
  
  // If it's already a plain object, return it
  return searchParams
}

// export default async function NovelsPage({ searchParams }) {
//   try {
//     // Convert searchParams to a plain object
//     const safeSearchParams = await toPlainObject(searchParams)
    
//     // Get novels and genres
//     const [{ novels, totalPages, currentPage }, genres] = await Promise.all([
//       getNovels(safeSearchParams.page, safeSearchParams.limit, safeSearchParams.sort, safeSearchParams.genre, safeSearchParams.search),
//       getGenres()
//     ])

//     // Create a safe query string
//     const queryString = Object.entries(safeSearchParams)
//       .filter(([key]) => key !== 'page')
//       .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
//       .join('&')

//     return (
//       <div className="space-y-8">
//         <NovelFilters genres={genres} />
        
//         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-4">
//           {novels.map((novel) => (
//             <NovelCard key={novel.novel_id} novel={novel} />
//           ))}
//         </div>

//         {/* Pagination */}
//         {totalPages > 1 && (
//           <div className="flex justify-center mt-8">
//             <div className="flex items-center space-x-2">
//               {/* Previous Button */}
//               <Link
//                 href={`/novels?page=${currentPage - 1}${queryString ? `&${queryString}` : ''}`}
//                 className={`px-3 py-2 rounded ${currentPage === 1 ? 'bg-gray-300 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
//                 aria-disabled={currentPage === 1}
//                 tabIndex={currentPage === 1 ? -1 : 0}
//               >
//                 Prev
//               </Link>

//               {/* Page Numbers with Ellipsis */}
//               {Array.from({ length: totalPages }, (_, i) => i + 1)
//                 .filter(pageNum =>
//                   pageNum === 1 ||
//                   pageNum === totalPages ||
//                   (pageNum >= currentPage - 2 && pageNum <= currentPage + 2)
//                 )
//                 .map((pageNum, idx, arr) => {
//                   // Add ellipsis if needed
//                   if (
//                     idx > 0 &&
//                     pageNum !== arr[idx - 1] + 1
//                   ) {
//                     return (
//                       <span key={`ellipsis-${pageNum}`} className="px-2 py-2 text-gray-400">...</span>
//                     );
//                   }
//                   return (
//                     <Link
//                       key={pageNum}
//                       href={`/novels?page=${pageNum}${queryString ? `&${queryString}` : ''}`}
//                       className={`px-4 py-2 rounded ${
//                         currentPage === pageNum
//                           ? 'bg-purple-600 text-white font-bold'
//                           : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//                       }`}
//                     >
//                       {pageNum}
//                     </Link>
//                   );
//                 })}

//               {/* Next Button */}
//               <Link
//                 href={`/novels?page=${currentPage + 1}${queryString ? `&${queryString}` : ''}`}
//                 className={`px-3 py-2 rounded ${currentPage === totalPages ? 'bg-gray-300 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
//                 aria-disabled={currentPage === totalPages}
//                 tabIndex={currentPage === totalPages ? -1 : 0}
//               >
//                 Next
//               </Link>
//             </div>
//           </div>
//         )}
//       </div>
//     )
//   } catch (error) {
//     console.error('Error in NovelsPage:', error)
//     return (
//       <div className="text-center py-8">
//         <h2 className="text-2xl font-semibold text-gray-300 mb-4">Something went wrong</h2>
//         <p className="text-gray-400">Please try again later</p>
//       </div>
//     )
//   }
// } 

export default async function NovelsPage({ searchParams }) {
  try {
    // Convert searchParams to a plain object
    const safeSearchParams = await toPlainObject(searchParams)
    
    // Ensure page is properly parsed as an integer
    const page = parseInt(safeSearchParams.page) || 1
    
    // Get novels and genres
    const [{ novels, totalPages, currentPage }, genres] = await Promise.all([
      getNovels(page, safeSearchParams.limit, safeSearchParams.sort, safeSearchParams.genre, safeSearchParams.search),
      getGenres()
    ])

    // Create a safe query string
    const queryString = Object.entries(safeSearchParams)
      .filter(([key]) => key !== 'page')
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
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
            <div className="flex items-center space-x-2">
              {/* Previous Button */}
              <Link
                href={`/novels?page=${Math.max(1, currentPage - 1)}${queryString ? `&${queryString}` : ''}`}
                className={`px-3 py-2 rounded ${currentPage === 1 ? 'bg-gray-300 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                aria-disabled={currentPage === 1}
                tabIndex={currentPage === 1 ? -1 : 0}
              >
                Prev
              </Link>

              {/* Pagination buttons with proper ellipses */}
              {(() => {
                const visiblePages = [];
                // Ensure currentPage is definitely a number
                const currentPageNum = parseInt(currentPage, 10) || 1;
                
                // Always show first page
                visiblePages.push(
                  <Link
                    key={1}
                    href={`/novels?page=1${queryString ? `&${queryString}` : ''}`}
                    className={`px-4 py-2 rounded ${
                      currentPageNum === 1
                        ? 'bg-purple-600 text-white font-bold'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    1
                  </Link>
                );
                
                // Show left ellipsis if needed
                if (currentPageNum > 4) {
                  visiblePages.push(
                    <span key="ellipsis-left" className="px-2 py-2 text-gray-400">
                      ...
                    </span>
                  );
                }
                
                // Calculate range of visible page numbers (more conservative range)
                let startPage = Math.max(2, currentPageNum - 1);
                let endPage = Math.min(totalPages - 1, currentPageNum + 1);
                
                // Ensure we don't show first or last page twice
                if (startPage === 1) startPage = 2;
                if (endPage === totalPages) endPage = totalPages - 1;
                
                // Show visible page numbers
                for (let i = startPage; i <= endPage; i++) {
                  visiblePages.push(
                    <Link
                      key={i}
                      href={`/novels?page=${i}${queryString ? `&${queryString}` : ''}`}
                      className={`px-4 py-2 rounded ${
                        currentPageNum === i
                          ? 'bg-purple-600 text-white font-bold'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {i}
                    </Link>
                  );
                }
                
                // Show right ellipsis if needed
                if (currentPageNum < totalPages - 3) {
                  visiblePages.push(
                    <span key="ellipsis-right" className="px-2 py-2 text-gray-400">
                      ...
                    </span>
                  );
                }
                
                // Always show last page if there's more than one page
                if (totalPages > 1) {
                  visiblePages.push(
                    <Link
                      key={totalPages}
                      href={`/novels?page=${totalPages}${queryString ? `&${queryString}` : ''}`}
                      className={`px-4 py-2 rounded ${
                        currentPageNum === totalPages
                          ? 'bg-purple-600 text-white font-bold'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {totalPages}
                    </Link>
                  );
                }
                
                return visiblePages;
              })()}

              {/* Next Button */}
              <Link
                href={`/novels?page=${Math.min(totalPages, currentPage + 1)}${queryString ? `&${queryString}` : ''}`}
                className={`px-3 py-2 rounded ${currentPage === totalPages ? 'bg-gray-300 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                aria-disabled={currentPage === totalPages}
                tabIndex={currentPage === totalPages ? -1 : 0}
              >
                Next
              </Link>
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