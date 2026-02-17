import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const session = await auth()
  const userId = session?.user?.id as string | undefined
  if (!userId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  try {
    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unread') === '1'
    const countOnly = searchParams.get('count') === '1'
    const excludeType = (searchParams.get('excludeType') || '').trim()
    const where: any = { userId }
    if (unreadOnly) where.read = false
    if (excludeType) where.NOT = { type: excludeType }
    if (countOnly) {
      const count = await prisma.notification.count({ where })
      return NextResponse.json({ count })
    }
    const list = await prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, take: 20 })
    return NextResponse.json(list)
  } catch {
    return NextResponse.json({ error: 'Bildirimler yüklenemedi' }, { status: 503 })
  }
}

export async function PATCH(request: NextRequest) {
  const session = await auth()
  const userId = session?.user?.id as string | undefined
  if (!userId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  try {
    const body = await request.json()
    const id = (body?.id as string || '').trim()
    if (!id) return NextResponse.json({ error: 'id gerekli' }, { status: 400 })
    const result = await prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    })
    if (result.count === 0) return NextResponse.json({ error: 'Bildirim bulunamadı' }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Bildirim güncellenemedi' }, { status: 503 })
  }
}
