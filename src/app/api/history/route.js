import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const history = await prisma.reading_history.findMany({
      where: {
        user_id: session.user.id
      },
      orderBy: {
        updated_at: 'desc'
      },
      take: 15,
      include: {
        novels: {
          include: {
            chapters: {
              select: {
                chapter_id: true,
                chapter_number: true
              }
            }
          }
        },
        chapters: {
          select: {
            chapter_id: true,
            chapter_number: true
          }
        }
      }
    })

    return NextResponse.json(history)
  } catch (error) {
    console.error('History fetch error:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message, stack: error.stack },
      { status: 500 }
    );
  }
} 