import Link from 'next/link'
import prisma from '@/lib/prisma'
import NovelCard from '@/components/NovelCard'
import { notFound } from 'next/navigation'

const rankingTabs = [
  { id: 'rank', label: 'Rank', description: 'Overall ranking' },
  { id: 'rating', label: 'Rating', description: 'Users\' votes' },
  { id: 'reads', label: 'Reads', description: 'Chapter visits' },
  { id: 'comments', label: 'Comments', description: 'Discussion' },
  { id: 'bookmarks', label: 'Bookmarks', description: 'Most bookmarked' }
]

const getRankingTitle = (category) => {
  switch (category) {
    case 'rank':
      return {
        title: 'Overall Ranking',
        description: 'The ranking is based on the combination of increasing reads of a book and the average user rating score.'
      }
    case 'rating':
      return {
        title: 'Rating Ranking',
        description: 'Novels ranked by average user rating scores.'
      }
    case 'reads':
      return {
        title: 'Most Read',
        description: 'Novels ranked by total chapter visits.'
      }
    case 'comments':
      return {
        title: 'Most Discussed',
        description: 'Novels ranked by number of comments.'
      }
    case 'bookmarks':
      return {
        title: 'Most Bookmarked',
        description: 'Novels ranked by number of times bookmarked.'
      }
    default:
      return {
        title: 'Novel Ranking',
        description: 'Browse novels by different ranking categories.'
      }
  }
}

async function getRankedNovels(category) {
  const orderBy = []
  
  switch (category) {
    case 'rank':
      orderBy.push({ view_count: 'desc' }, { average_rating: 'desc' })
      break
    case 'rating':
      orderBy.push({ average_rating: 'desc' })
      break
    case 'reads':
      orderBy.push({ view_count: 'desc' })
      break
    case 'comments':
      orderBy.push({ 
        novel_comments: {
          _count: 'desc'
        }
      })
      break
    case 'bookmarks':
      orderBy.push({ 
        bookmarks: {
          _count: 'desc'
        }
      })
      break
    default:
      orderBy.push({ view_count: 'desc' })
  }

  const novels = await prisma.novels.findMany({
    take: 20,
    orderBy,
    where: category === 'rating' ? {
      average_rating: {
        not: null
      }
    } : undefined,
    select: {
      novel_id: true,
      title: true,
      author: true,
      cover_image_url: true,
      status: true,
      average_rating: true,
      slug: true,
      view_count: true,
      novel_genres: {
        select: {
          genres: {
            select: {
              genre_id: true,
              name: true
            }
          }
        }
      },
      chapters: {
        select: {
          chapter_id: true
        }
      },
      _count: {
        select: {
          novel_comments: true,
          bookmarks: true,
          chapters: true,
          ratings: true
        }
      }
    }
  })

  // Serialize Decimal fields to numbers
  return novels.map(novel => ({
    ...novel,
    average_rating: novel.average_rating ? parseFloat(novel.average_rating.toString()) : null,
    ratings_count: novel._count.ratings
  }))
}

export default async function RankingsPage({ params: { category: rawCategory } }) {
  const category = rawCategory || 'rank'

  // Validate category
  if (!rankingTabs.find(tab => tab.id === category)) {
    notFound()
  }

  const novels = await getRankedNovels(category)
  const { title, description } = getRankingTitle(category)

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      {/* Ranking Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {rankingTabs.map((tab) => (
          <Link
            key={tab.id}
            href={`/rankings/${tab.id}`}
            className={`flex-1 min-w-[150px] p-4 rounded-lg ${
              tab.id === category
                ? 'bg-indigo-900 bg-opacity-50'
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            <h3 className="text-lg font-semibold mb-1">{tab.label}</h3>
            <p className="text-sm text-gray-400">{tab.description}</p>
          </Link>
        ))}
      </div>

      {/* Ranking Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        <p className="text-gray-400">{description}</p>
      </div>

      {/* Novel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {novels.map((novel, index) => (
          <div key={novel.novel_id} className="relative">
            {/* Ranking Number */}
            <div className="absolute -left-2 -top-2 z-10 w-10 h-10 bg-amber-700 text-white flex items-center justify-center rounded-lg font-bold text-xl shadow-lg">
              {String(index + 1).padStart(2, '0')}
            </div>
            
            {/* Status Badge */}
            <div className="absolute right-2 top-2 z-10">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                novel.status === 'COMPLETED' 
                  ? 'bg-indigo-900 text-indigo-100'
                  : 'bg-purple-900 text-purple-100'
              }`}>
                {novel.status === 'COMPLETED' ? 'COMPLETED' : 'ONGOING'}
              </span>
            </div>

            {/* Novel Card */}
            <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <NovelCard 
                novel={novel}
                rankingStat={
                  category === 'rating' ? { label: 'Rating', value: novel.average_rating?.toFixed(1) || 'N/A' } :
                  category === 'reads' ? { label: 'Views', value: novel.view_count?.toLocaleString() } :
                  category === 'comments' ? { label: 'Comments', value: novel._count.novel_comments } :
                  category === 'bookmarks' ? { label: 'Bookmarks', value: novel._count.bookmarks } :
                  null
                }
              />
              
              {/* Genre Tags */}
              {/* <div className="px-4 py-2 border-t border-gray-700">
                <div className="flex flex-wrap gap-2">
                  {novel.novel_genres?.map(({ genres }) => (
                    <span
                      key={genres.genre_id}
                      className="px-2 py-1 bg-gray-700 rounded-md text-xs text-gray-300"
                    >
                      {genres.name}
                    </span>
                  ))}
                </div>
              </div> */}

              {/* Ranking Stats */}
              {/* Moved to NovelCard */}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 