import prisma from '@/lib/prisma'
import NovelCard from '@/components/NovelCard'
import SectionHeader from '@/components/SectionHeader'
import HeroSection from '@/components/HeroSection'

function serializeNovel(novel) {
  return {
    ...novel,
    average_rating: novel.average_rating ? Number(novel.average_rating) : 0,
    // Add similar conversions for other Decimal fields if needed
  }
}

async function getNovelsDirect() {
  try {
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

    // Featured novels
    const featured = await prisma.novels.findMany({
      where: { is_featured: true },
      take: 6,
      select: baseSelect
    })
    // Newest novels
    const newest = await prisma.novels.findMany({
      orderBy: { created_at: 'desc' },
      take: 6,
      select: baseSelect
    })
    // Popular novels
    const popular = await prisma.novels.findMany({
      orderBy: { view_count: 'desc' },
      take: 6,
      select: baseSelect
    })
    // Completed novels
    const completed = await prisma.novels.findMany({
      where: { status: 'completed' },
      take: 6,
      select: baseSelect
    })

    return {
      featured: featured.map(serializeNovel),
      newest: newest.map(serializeNovel),
      popular: popular.map(serializeNovel),
      completed: completed.map(serializeNovel)
    }
  } catch (error) {
    console.error('Error in getNovelsDirect:', error)
    return { featured: [], newest: [], popular: [], completed: [] }
  }
}

export default async function Home() {
  try {
    const { featured, newest, popular, completed } = await getNovelsDirect()

    return (
      <div className="space-y-12">
        {/* Hero Section */}
        <HeroSection />
        
        {/* Featured Novels Section */}
        {featured.length > 0 ? (
          <section>
            <SectionHeader 
              title="Featured Novels" 
              link="/novels?featured=true" 
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {featured.map((novel) => (
                <NovelCard key={novel.novel_id} novel={novel} />
              ))}
            </div>
          </section>
        ) : (
          <section>
            <SectionHeader 
              title="Featured Novels" 
              link="/novels?featured=true" 
            />
            <div className="text-center py-8">
              <p className="text-gray-400">No featured novels available at the moment.</p>
            </div>
          </section>
        )}

        {/* New Novels Section */}
        {newest.length > 0 ? (
          <section>
            <SectionHeader 
              title="New Novels" 
              link="/novels?sort=newest" 
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {newest.map((novel) => (
                <NovelCard key={novel.novel_id} novel={novel} />
              ))}
            </div>
          </section>
        ) : (
          <section>
            <SectionHeader 
              title="New Novels" 
              link="/novels?sort=newest" 
            />
            <div className="text-center py-8">
              <p className="text-gray-400">No new novels available at the moment.</p>
            </div>
          </section>
        )}

        {/* Popular Novels Section */}
        {popular.length > 0 ? (
          <section>
            <SectionHeader 
              title="Popular Novels" 
              link="/novels?sort=popular" 
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {popular.map((novel) => (
                <NovelCard key={novel.novel_id} novel={novel} />
              ))}
            </div>
          </section>
        ) : (
          <section>
            <SectionHeader 
              title="Popular Novels" 
              link="/novels?sort=popular" 
            />
            <div className="text-center py-8">
              <p className="text-gray-400">No popular novels available at the moment.</p>
            </div>
          </section>
        )}

        {/* Completed Novels Section */}
        {completed.length > 0 ? (
          <section>
            <SectionHeader 
              title="Completed Novels" 
              link="/novels?status=completed" 
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {completed.map((novel) => (
                <NovelCard key={novel.novel_id} novel={novel} />
              ))}
            </div>
          </section>
        ) : (
          <section>
            <SectionHeader 
              title="Completed Novels" 
              link="/novels?status=completed" 
            />
            <div className="text-center py-8">
              <p className="text-gray-400">No completed novels available at the moment.</p>
            </div>
          </section>
        )}
      </div>
    )
  } catch (error) {
    console.error('Error in Home page:', error)
    return (
      <div className="space-y-12">
        <HeroSection />
        <div className="text-center py-8">
          <h2 className="text-2xl font-semibold text-gray-300 mb-4">Database Connection Issue</h2>
          <p className="text-gray-400">We&apos;re having trouble connecting to our database. Please try again later.</p>
        </div>
      </div>
    )
  }
}
