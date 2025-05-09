import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')
  if (!q || typeof q !== 'string' || q.trim() === '') {
    return NextResponse.json({ novels: [] })
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
    return NextResponse.json({ novels })
  } catch (error) {
    return NextResponse.json({ novels: [], error: error.message }, { status: 500 })
  }
} 