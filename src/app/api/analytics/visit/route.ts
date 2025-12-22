import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function POST(req: NextRequest) {
  const session = await auth()
  const userId = session?.user?.id as string | undefined
  const { pathname } = await req.json().catch(() => ({ pathname: req.headers.get('x-pathname') || '/' }))
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null
  const ua = req.headers.get('user-agent') || null
  
  if (!pathname) return NextResponse.json({ error: 'pathname gerekli' }, { status: 400 })

  // Gerçekçi sayaç mantığı: Aynı kullanıcı/IP aynı sayfayı 30 dakika içinde tekrar ziyaret ederse sayma
  const COOLDOWN_MINUTES = 30
  const cutoff = new Date(Date.now() - COOLDOWN_MINUTES * 60 * 1000)

  let duplicateFound = false

  if (userId) {
    // Giriş yapmış kullanıcı kontrolü
    const existing = await prisma.visit.findFirst({
      where: {
        path: pathname,
        createdAt: { gte: cutoff },
        userId: userId
      }
    })
    if (existing) duplicateFound = true
  } else if (ip) {
    // Misafir kullanıcı kontrolü (IP ve User Agent)
    const existing = await prisma.visit.findFirst({
      where: {
        path: pathname,
        createdAt: { gte: cutoff },
        ip: ip,
        userAgent: ua || undefined
      }
    })
    if (existing) duplicateFound = true
  }

  if (duplicateFound) {
    return NextResponse.json({ ok: true, ignored: true })
  }

  try {
    await prisma.visit.create({ 
      data: { 
        path: pathname, 
        userId: userId || null, 
        ip: ip || undefined, 
        userAgent: ua || undefined 
      } 
    })
  } catch (error) {
    console.error('Visit create error:', error)
    // If it's a foreign key constraint violation (user might be deleted), try without userId
    if (userId) {
        try {
            await prisma.visit.create({ 
                data: { 
                  path: pathname, 
                  userId: null, 
                  ip: ip || undefined, 
                  userAgent: ua || undefined 
                } 
            })
            return NextResponse.json({ ok: true, recovered: true })
        } catch (retryError) {
            console.error('Visit create retry error:', retryError)
        }
    }
    return NextResponse.json({ error: 'Failed to record visit' }, { status: 500 })
  }
  
  return NextResponse.json({ ok: true })
}

export async function GET() {
  const total = await prisma.visit.count()
  const last = await prisma.visit.findMany({ orderBy: { createdAt: 'desc' }, take: 50 })
  return NextResponse.json({ total, last })
}
