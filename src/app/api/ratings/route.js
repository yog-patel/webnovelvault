import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { novelId, score } = await req.json()

    if (!novelId || !score) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (score < 1 || score > 5) {
      return NextResponse.json(
        { message: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Create or update the rating
    const rating = await prisma.ratings.upsert({
      where: {
        user_id_novel_id: {
          user_id: parseInt(session.user.id),
          novel_id: parseInt(novelId)
        }
      },
      update: {
        score: parseInt(score),
        updated_at: new Date()
      },
      create: {
        user_id: parseInt(session.user.id),
        novel_id: parseInt(novelId),
        score: parseInt(score)
      }
    })

    // Update the novel's average rating
    const averageRating = await prisma.ratings.aggregate({
      where: {
        novel_id: parseInt(novelId)
      },
      _avg: {
        score: true
      }
    })

    // Convert the average to a number with 2 decimal places
    const avgRating = averageRating._avg.score 
      ? parseFloat(averageRating._avg.score.toFixed(2))
      : 0.00

    await prisma.novels.update({
      where: {
        novel_id: parseInt(novelId)
      },
      data: {
        average_rating: avgRating
      }
    })

    return NextResponse.json({
      ...rating,
      average_rating: avgRating
    })
  } catch (error) {
    console.error('Rating error:', error)
    return NextResponse.json(
      { message: 'Failed to submit rating' },
      { status: 500 }
    )
  }
} 