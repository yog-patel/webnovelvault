import { PrismaClient } from '@prisma/client'

// Use a global variable to ensure singleton in dev
const globalForPrisma = globalThis

if (process.env.NODE_ENV === 'development' && globalForPrisma.prisma) {
  // Warn if multiple clients are created in dev
  console.warn('⚠️ Multiple Prisma Clients detected in development!');
}

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Optional: Clean up Prisma clients on hot reload in development
if (process.env.NODE_ENV === 'development') {
  if (typeof window === 'undefined') {
    process.once('SIGTERM', async () => {
      await prisma.$disconnect();
    });
    process.once('SIGINT', async () => {
      await prisma.$disconnect();
    });
  }
}

export default prisma