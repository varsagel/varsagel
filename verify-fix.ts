import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Verifying Sequence model...')
    const seq = await prisma.sequence.upsert({
      where: { key: 'test_verify' },
      create: { key: 'test_verify', value: 1 },
      update: { value: { increment: 1 } },
    })
    console.log('Sequence verified:', seq)
  } catch (error) {
    console.error('Verification failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
