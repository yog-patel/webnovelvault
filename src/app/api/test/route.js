import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // No need to manually connect/disconnect
    const count = await prisma.novels.count()
    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
      novelCount: count
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({
      status: 'error',
      message: error.message,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}