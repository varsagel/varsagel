import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest) {
  const session = await auth()
  const userId = session?.user?.id as string | undefined
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const encoder = new TextEncoder()
  let timer: any

  const stream = new ReadableStream({
    async start(controller) {
      const send = async () => {
        const unread = await prisma.notification.count({ where: { userId, isRead: false } })
        const evt = `event: count\n` + `data: ${JSON.stringify({ unread })}\n\n`
        controller.enqueue(encoder.encode(evt))
      }
      await send()
      timer = setInterval(send, 5000)
    },
    cancel() {
      if (timer) clearInterval(timer)
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  })
}
