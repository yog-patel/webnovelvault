import prisma from '@/lib/prisma'
import NovelCard from '@/components/NovelCard'

async function getSearchResults(searchParams) {
  const query = searchParams?.q || ''
  const limit = 12

  try {
    const novels = await prisma.novels.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { author: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: limit,
      select: {
        novel_id: true,
        title: true,
        author: true,
        cover_image_url: true,
        status: true,
        average_rating: true,
        slug: true,
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
      },
      orderBy: {
        view_count: 'desc' // Show most popular matches first
      }
    })

    // Serialize Decimal fields to numbers
    const serializedNovels = novels.map(novel => ({
      ...novel,
      average_rating: novel.average_rating ? parseFloat(novel.average_rating.toString()) : null
    }))

    return { novels: serializedNovels, query }
  } catch (error) {
    console.error('Error searching novels:', error)
    return { novels: [], query }
  }
}

export default async function SearchPage({ searchParams }) {
  const { novels, query } = await getSearchResults(searchParams)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {query ? `Search results for "${query}"` : 'Search Novels'}
      </h1>
      
      {novels.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {novels.map((novel) => (
            <NovelCard key={novel.novel_id} novel={novel} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400">
            {query
              ? `No novels found matching "${query}"`
              : 'Enter a search term to find novels'}
          </p>
        </div>
      )}
    </div>
  )
} 