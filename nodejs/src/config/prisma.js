import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error']
})

export const CONNECT_DB = async () => {
  try {
    await prisma.$connect()
    // eslint-disable-next-line no-console
    console.log('Prisma connected to SQL Server')
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Prisma connection error:', error)
    throw error
  }
}

export const GET_DB = () => {
  return prisma
}

export const CLOSE_DB = async () => {
  await prisma.$disconnect()
}
