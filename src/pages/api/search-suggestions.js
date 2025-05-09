import prisma from '@/lib/prisma'

export default async function handler(req, res) {
  const { q } = req.query
  if (!q || typeof q !== 'string' || q.trim() === '') {
    return res.status(200).json({ novels: [] })
  }
  try {
    const novels = await prisma.novels.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { author: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } }
        ]
      },
      take: 6,
      select: {
        novel_id: true,
        title: true,
        slug: true
      },
      orderBy: {
        view_count: 'desc'
      }
    })
    res.status(200).json({ novels })
  } catch (error) {
    res.status(500).json({ novels: [], error: error.message })
  }
} 