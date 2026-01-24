import { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  try {
    const session = await auth()
    const userId = session?.user?.id as string | undefined
    const encoder = new TextEncoder()
    let timer: NodeJS.Timeout
    let heartbeat: NodeJS.Timeout

    const stream = new ReadableStream({
      async start(controller) {
        // Initial connection message
        try {
          controller.enqueue(encoder.encode(': connected\n\n'))
        } catch {
          // Client disconnected immediately
          return
        }

        const cleanup = () => {
          if (timer) clearInterval(timer)
          if (heartbeat) clearInterval(heartbeat)
          try { controller.close() } catch {}
        }

        // Clean up on client disconnect
        if (_req.signal) {
          _req.signal.addEventListener('abort', cleanup)
        }

        if (!userId) {
          try {
            controller.enqueue(encoder.encode(`event: count\ndata: ${JSON.stringify({ unread: 0 })}\n\n`))
          } catch {}
          cleanup()
          return
        }

        const send = async () => {
          try {
            const unread = await prisma.notification.count({ 
              where: { 
                userId, 
                read: false 
              } 
            })
            
            const evt = `event: count\n` + `data: ${JSON.stringify({ unread })}\n\n`
            controller.enqueue(encoder.encode(evt))
          } catch {
            // Ignore errors (likely client disconnect or DB temporary issue)
          }
        }

        // Send immediately
        await send()

        // Periodic updates
        timer = setInterval(send, 5000)

        // Heartbeat to keep connection alive
        heartbeat = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(': heartbeat\n\n'))
          } catch {
            cleanup()
          }
        }, 10000)
      },
      cancel() {
        if (timer) clearInterval(timer)
        if (heartbeat) clearInterval(heartbeat)
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'Content-Encoding': 'none',
        'X-Accel-Buffering': 'no', // Disable buffering for Nginx/Vercel
      },
    })
  } catch (error) {
    console.error('Bildirim akışı başlatılırken hata:', error)
    return new Response('Sunucu hatası', { status: 500 })
  }
}
