
import { prisma } from './src/lib/prisma'

async function main() {
  try {
    const count = await prisma.user.count()
    console.log('User count:', count)
    const notifications = await prisma.notification.count()
    console.log('Notification count:', notifications)
    
    // Check if we can select 'read' field
    const notif = await prisma.notification.findFirst({
      select: { read: true }
    })
    console.log('First notification read status:', notif?.read)

    // Check Sequence
    const seq = await prisma.sequence.findFirst()
    console.log('Sequence:', seq)

  } catch (e) {
    console.error('Prisma error:', e)
  } finally {
    await prisma.$disconnect()
  }
}

main()
