import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function POST(req, context) {
  try {
    const session = await getServerSession(authOptions)
    const chapterId = parseInt(context.params.id)

    const chapter = await prisma.chapters.findUnique({
      where: { chapter_id: chapterId },
      include: {
        novels: true
      }
    })

    if (!chapter) {
      return NextResponse.json(
        { message: 'Chapter not found' },
        { status: 404 }
      )
    }

    // Check if chapter is free or user is logged in
    if (!chapter.is_free && !session) {
      return NextResponse.json(
        { message: 'Please login to read this chapter' },
        { status: 401 }
      )
    }

    // Increment view count
    await prisma.chapters.update({
      where: { chapter_id: chapterId },
      data: {
        view_count: {
          increment: 1
        }
      }
    })

    // Also increment novel view count
    await prisma.novels.update({
      where: { novel_id: chapter.novels.novel_id },
      data: {
        view_count: {
          increment: 1
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('View count error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}