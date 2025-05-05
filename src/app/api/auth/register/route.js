import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
// Username validation regex (alphanumeric, underscore, dash, 3-30 chars)
const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,30}$/
// Password requirements: min 8 chars, at least 1 letter and 1 number
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/

export async function POST(req) {
  try {
    const { username, email, password } = await req.json()

    // Input validation
    if (!username || !email || !password) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate email format
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate username format
    if (!USERNAME_REGEX.test(username)) {
      return NextResponse.json(
        { message: 'Username must be 3-30 characters long and can only contain letters, numbers, underscores, and dashes' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (!PASSWORD_REGEX.test(password)) {
      return NextResponse.json(
        { message: 'Password must be at least 8 characters long and contain at least one letter and one number' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.users.findFirst({
      where: {
        OR: [
          { username: { equals: username, mode: 'insensitive' } },
          { email: { equals: email.toLowerCase(), mode: 'insensitive' } }
        ]
      }
    })

    if (existingUser) {
      if (existingUser.email.toLowerCase() === email.toLowerCase()) {
        return NextResponse.json(
          { message: 'Email already registered' },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { message: 'Username already taken' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user with transaction to ensure atomicity
    const user = await prisma.$transaction(async (prisma) => {
      // Create user
      const newUser = await prisma.users.create({
        data: {
          username,
          email: email.toLowerCase(),
          password_hash: hashedPassword,
          display_name: username,
          avatar_url: null,
          bio: null,
          created_at: new Date(),
          updated_at: new Date(),
          last_login: null,
          is_admin: false,
          is_active: true
        }
      })

      return newUser
    })

    // Remove sensitive data before sending response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: userWithoutPassword
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    
    // Handle specific database errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: 'This username or email is already registered' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'An error occurred during registration' },
      { status: 500 }
    )
  }
} 