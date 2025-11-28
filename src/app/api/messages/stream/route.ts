import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await auth()
  const userId = session?.user?.id as string | undefined
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const { searchParams } = new URL(req.url)
  const listingId = (searchParams.get('listingId') || '').trim()
  if (!listingId) return new Response('listingId required', { status: 400 })

  const listing = await prisma.listing.findUnique({ where: { id: listingId }, select: { ownerId: true } })
  if (!listing) return new Response('Not Found', { status: 404 })
  const accepted = await prisma.offer.findFirst({ where: { listingId, status: 'ACCEPTED' }, select: { sellerId: true } })
  if (!accepted) return new Response('Forbidden', { status: 403 })

  const partyA = listing.ownerId
  const partyB = accepted.sellerId
  if (!(userId === partyA || userId === partyB)) return new Response('Forbidden', { status: 403 })

  const encoder = new TextEncoder()
  let timer: any
  let lastCheck = new Date(Date.now() - 60 * 60 * 1000)

  const stream = new ReadableStream({
    async start(controller) {
      const send = async () => {
        const msgs = await prisma.message.findMany({
          where: { listingId },
          orderBy: { createdAt: 'asc' },
          take: 200,
        })
        lastCheck = new Date()
        const evt = `event: messages\n` + `data: ${JSON.stringify(msgs)}\n\n`
        controller.enqueue(encoder.encode(evt))
      }
      await send()
      timer = setInterval(send, 2000)
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
