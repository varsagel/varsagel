async function main() {
  const { PrismaClient } = await import('@prisma/client')
  const prisma = new PrismaClient()
  try {
    console.log('Checking Sequence model...')
    const seq = await prisma.sequence.findFirst()
    console.log('Sequence:', seq)
    
    console.log('Checking Notification model...')
    const notif = await prisma.notification.findFirst()
    console.log('Notification:', notif)
    
    // Check if notification has 'read' property
    if (notif && 'read' in notif) {
        console.log('Notification has read property')
    } else {
        console.log('Notification read property check skipped (no notification or property missing)')
    }
  } catch(e) {
    console.error('Error:', e)
  } finally {
    await prisma.$disconnect()
  }
}
main()
