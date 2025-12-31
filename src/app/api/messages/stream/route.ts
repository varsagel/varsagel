import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user?.id as string | undefined
    if (!userId) return new Response('Yetkisiz', { status: 401 })

    const { searchParams } = new URL(req.url)
    const listingId = (searchParams.get('listingId') || '').trim()
    if (!listingId) return new Response('listingId gerekli', { status: 400 })

    const listing = await prisma.listing.findUnique({ where: { id: listingId }, select: { ownerId: true } })
    if (!listing) return new Response('Bulunamadı', { status: 404 })

    const ownerId = listing.ownerId

    const encoder = new TextEncoder()
    let timer: any
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          controller.enqueue(encoder.encode(': connected\n\n'))
        } catch { return }

        const cleanup = () => {
          if (timer) clearInterval(timer)
          if (heartbeat) clearInterval(heartbeat)
          try { controller.close() } catch {}
        }

        if (req.signal) {
          req.signal.addEventListener('abort', cleanup)
        }

        const send = async () => {
          try {
            const where: any = { listingId };
            // If not owner, only show own messages
            if (userId !== ownerId) {
                where.OR = [{ senderId: userId }, { toUserId: userId }];
            }

            const msgs = await prisma.message.findMany({
              where,
              orderBy: { createdAt: 'asc' },
              take: 200,
            })
            const evt = `event: messages\n` + `data: ${JSON.stringify(msgs)}\n\n`
            controller.enqueue(encoder.encode(evt))
          } catch (error) {
            // console.error('Message Stream Error:', error)
          }
        }
        await send()
        timer = setInterval(send, 2000)

        // Heartbeat
        const heartbeat = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(': heartbeat\n\n'))
          } catch {
            cleanup()
          }
        }, 15000)
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
        'Content-Encoding': 'none',
        'X-Accel-Buffering': 'no',
      },
    })
  } catch (error) {
    console.error('Mesaj akışı başlatılırken hata:', error);
    return new Response('Sunucu hatası', { status: 500 });
  }
}
