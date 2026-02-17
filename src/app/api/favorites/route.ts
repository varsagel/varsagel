import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
  const session = await auth()
  const userId = session?.user?.id as string | undefined
  if (!userId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  const favs = await prisma.favorite.findMany({ where: { userId }, select: { listingId: true } })
  return NextResponse.json(favs.map(f => f.listingId))
}

export async function POST(request: NextRequest) {
  const session = await auth()
  const userId = session?.user?.id as string | undefined
  if (!userId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  const body = await request.json()
  const listingId = (body?.listingId as string || '').trim()
  if (!listingId) return NextResponse.json({ error: 'listingId gerekli' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!user) return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })

  const listing = await prisma.listing.findUnique({ where: { id: listingId }, select: { ownerId: true, status: true } });
  if (!listing) return NextResponse.json({ error: 'Talep bulunamadı' }, { status: 404 });
  if (listing?.ownerId === userId) {
    return NextResponse.json({ error: 'Kendi talebinizi favoriye ekleyemezsiniz' }, { status: 403 });
  }
  if (listing.status !== "OPEN") {
    return NextResponse.json({ error: 'Bu talep henüz yayında değil' }, { status: 403 });
  }

  try {
    await prisma.favorite.upsert({
      where: { userId_listingId: { userId, listingId } },
      create: { userId, listingId },
      update: {},
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Favori eklenemedi' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth()
  const userId = session?.user?.id as string | undefined
  if (!userId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
  const { searchParams } = new URL(request.url)
  const listingId = (searchParams.get('listingId') || '').trim()
  if (!listingId) return NextResponse.json({ error: 'listingId gerekli' }, { status: 400 })
  await prisma.favorite.delete({ where: { userId_listingId: { userId, listingId } } }).catch(() => {})
  return NextResponse.json({ ok: true })
}
