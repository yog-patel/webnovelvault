import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  const staticPages = [
    '',
    'novels',
    'rankings',
    'login',
    'register',
    'contact'
  ]

  const baseUrl = 'https://www.webnovelvault.com' // No trailing slash

  // Fetch all novel slugs from the database
  let novelSlugs = []
  try {
    novelSlugs = await prisma.novels.findMany({
      select: { slug: true }
    })
  } catch (e) {
    novelSlugs = []
  }

  // Fetch all genre names from the database
  let genreNames = []
  try {
    genreNames = await prisma.genres.findMany({
      select: { name: true }
    })
  } catch (e) {
    genreNames = []
  }

  let urls = staticPages.map(
    (page) => `<url><loc>${baseUrl}${page ? '/' + page : ''}</loc></url>`
  )
  urls = urls.concat(
    novelSlugs.map(
      (novel) => `<url><loc>${baseUrl}/novels/${novel.slug}</loc></url>`
    )
  )
  urls = urls.concat(
    genreNames.map(
      (genre) => `<url><loc>${baseUrl}/novels?genres=${encodeURIComponent(genre.name)}</loc></url>`
    )
  )

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml'
    }
  })
}
