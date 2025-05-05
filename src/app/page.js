import { Suspense } from 'react'
import NovelCard from '@/components/NovelCard'
import SectionHeader from '@/components/SectionHeader'
import { getBaseUrl } from '@/lib/utils'
import HeroSection from '@/components/HeroSection'

async function getNovels() {
  try {
    const baseUrl = getBaseUrl()
    const apiUrl = `${baseUrl}/api/novels`
    console.log('Fetching novels from:', apiUrl)
    
    const res = await fetch(apiUrl, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    if (!res.ok) {
      const errorText = await res.text()
      console.error('Failed to fetch novels. Status:', res.status)
      console.error('Error response:', errorText)
      throw new Error(`Failed to fetch novels: ${errorText}`)
    }
    
    const data = await res.json()
    console.log('Successfully fetched novels data')
    return data
  } catch (error) {
    console.error('Error in getNovels:', error)
    throw error
  }
}

export default async function Home() {
  const { featured, newest, popular, completed } = await getNovels()

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <HeroSection />
      {/* Featured Novels Section */}
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

      {/* New Novels Section */}
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

      {/* Popular Novels Section */}
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

      {/* Completed Novels Section */}
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
    </div>
  )
}
