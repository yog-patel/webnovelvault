import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['error', 'warn'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    }
  })
}

const globalForPrisma = globalThis

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Test the connection and handle errors
const testConnection = async () => {
  try {
    await prisma.$connect()
    console.log('Prisma client connected successfully')
  } catch (error) {
    console.error('Prisma connection error:', error)
    // In production, we don't want to keep retrying
    if (process.env.NODE_ENV === 'development') {
      setTimeout(testConnection, 5000)
    }
  }
}

// Initial connection test
testConnection()

// Handle process termination
process.on('beforeExit', async () => {
  try {
    await prisma.$disconnect()
    console.log('Prisma client disconnected successfully')
  } catch (error) {
    console.error('Error disconnecting Prisma client:', error)
  }
})

export default prisma 