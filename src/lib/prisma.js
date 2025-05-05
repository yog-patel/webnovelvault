import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
    errorFormat: 'pretty',
  })
}

let prisma

if (process.env.NODE_ENV === 'production') {
  prisma = prismaClientSingleton()
} else {
  // In development, use a global variable to prevent multiple instances
  if (!global.prisma) {
    global.prisma = prismaClientSingleton()
  }
  prisma = global.prisma
}

// Test the connection and handle errors
const testConnection = async () => {
  try {
    await prisma.$connect()
    console.log('Prisma client connected successfully')
  } catch (error) {
    console.error('Prisma connection error:', error)
    // Attempt to reconnect after a delay
    setTimeout(testConnection, 5000)
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