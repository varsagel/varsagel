import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const session = await auth()
  const userId = session?.user?.id as string | undefined
  if (!userId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  const { searchParams } = new URL(request.url)
  const unreadOnly = searchParams.get('unread') === '1'
  const where: any = { userId }
  if (unreadOnly) where.isRead = false
  const list = await prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, take: 20 })
  return NextResponse.json(list)
}

export async function PATCH(request: NextRequest) {
  const session = await auth()
  const userId = session?.user?.id as string | undefined
  if (!userId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  const body = await request.json()
  const id = (body?.id as string || '').trim()
  if (!id) return NextResponse.json({ error: 'id gerekli' }, { status: 400 })
  await prisma.notification.update({ where: { id }, data: { isRead: true } }).catch(() => {})
  return NextResponse.json({ ok: true })
}
