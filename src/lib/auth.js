import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import prisma from './prisma'
import { compare } from 'bcryptjs'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Please provide both email and password')
          }

          const user = await prisma.users.findUnique({
            where: { email: credentials.email.toLowerCase() },
            select: {
              user_id: true,
              email: true,
              username: true,
              password: true,
              avatar_url: true,
              role: true,
              is_active: true,
              last_login: true
            }
          })

          if (!user) {
            throw new Error('No user found with this email')
          }

          if (!user.is_active) {
            throw new Error('Account is inactive. Please contact support.')
          }

          const isValid = await compare(credentials.password, user.password)

          if (!isValid) {
            throw new Error('Invalid password')
          }

          // Update last login
          await prisma.users.update({
            where: { user_id: user.user_id },
            data: { last_login: new Date() }
          })

          return {
            id: user.user_id.toString(),
            email: user.email,
            name: user.username,
            image: user.avatar_url,
            role: user.role
          }
        } catch (error) {
          console.error('Auth error:', error)
          throw error
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }

      // Handle user updates
      if (trigger === "update" && session?.name) {
        token.name = session.name
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id
        session.user.role = token.role
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60 // 24 hours
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development'
}

export default NextAuth(authOptions) 