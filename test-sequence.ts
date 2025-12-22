import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Testing Sequence model...')
  try {
    const seq = await prisma.sequence.upsert({
      where: { key: 'test_seq' },
      create: { key: 'test_seq', value: 1 },
      update: { value: { increment: 1 } },
    })
    console.log('Sequence updated:', seq)

    console.log('Testing Notification model...')
    // Check if 'read' column works (no typo)
    const notifications = await prisma.notification.findMany({
      take: 1,
      where: { read: false }
    })
    console.log('Notification check passed, found:', notifications.length)

  } catch (e) {
    console.error('Error:', e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
