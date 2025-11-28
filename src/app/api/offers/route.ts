import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'given'
    const status = searchParams.get('status') || undefined

    const where: any = {}
    if (type === 'given') {
      where.sellerId = session.user.id
    } else if (type === 'received') {
      where.listing = { ownerId: session.user.id }
    }
    if (status) where.status = status

    const offers = await prisma.offer.findMany({
      where,
      include: {
        listing: {
          include: {
            owner: { select: { id: true, name: true, email: true } },
            category: true,
            subCategory: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const formatted = offers.map((o: any) => ({
      id: o.id,
      listingId: o.listingId,
      listingTitle: o.listing?.title || '',
      price: o.price ? Number(o.price) : 0,
      message: o.message || '',
      status: o.status,
      createdAt: o.createdAt,
      counterpartName: type === 'given' ? (o.listing?.owner?.name || 'Anonim') : 'Satıcı',
      counterpartEmail: type === 'given' ? (o.listing?.owner?.email || '') : '',
      category: o.listing?.category?.slug || '',
      location: { city: o.listing?.city || '', district: o.listing?.district || '' },
    }))

    return NextResponse.json(formatted)
  } catch (e) {
    return NextResponse.json({ error: 'Teklifler getirilirken hata' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
    const userId = session.user.id as string
    const body = await request.json()
    const offerId = String(body.offerId || '')
    const action = String(body.action || '')
    if (!offerId || !action) return NextResponse.json({ error: 'offerId ve action gerekli' }, { status: 400 })

    const offer = await prisma.offer.findUnique({
      where: { id: offerId },
      include: { listing: { select: { ownerId: true, id: true, title: true } } }
    })
    if (!offer) return NextResponse.json({ error: 'Teklif bulunamadı' }, { status: 404 })

    if (action === 'accept') {
      if (offer.listing.ownerId !== userId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
      const updated = await prisma.offer.update({ where: { id: offerId }, data: { status: 'ACCEPTED' } })
      await prisma.notification.create({
        data: {
          userId: offer.sellerId,
          type: 'offer_accepted',
          title: 'Teklif kabul edildi',
          body: offer.listing.title,
          dataJson: JSON.stringify({ listingId: offer.listingId, offerId }),
        },
      })
      return NextResponse.json({ ok: true, status: updated.status })
    }

    if (action === 'reject') {
      if (offer.listing.ownerId !== userId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
      const updated = await prisma.offer.update({ where: { id: offerId }, data: { status: 'REJECTED' } })
      await prisma.notification.create({
        data: {
          userId: offer.sellerId,
          type: 'offer_rejected',
          title: 'Teklif reddedildi',
          body: offer.listing.title,
          dataJson: JSON.stringify({ listingId: offer.listingId, offerId }),
        },
      })
      return NextResponse.json({ ok: true, status: updated.status })
    }

    if (action === 'update') {
      if (offer.sellerId !== userId) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
      const newPriceNum = Number(body.price)
      const newMessage = String(body.message || offer.message)
      if (!newPriceNum || newPriceNum < 1) return NextResponse.json({ error: 'Geçersiz fiyat' }, { status: 400 })
      const twoHoursMs = 2 * 60 * 60 * 1000
      if (offer.status === 'REJECTED') {
        const elapsed = Date.now() - new Date(offer.updatedAt).getTime()
        if (elapsed < twoHoursMs && newPriceNum <= Number(offer.price as any)) {
          return NextResponse.json({ error: '2 saat bekleyiniz ve fiyatı artırınız' }, { status: 429 })
        }
      }
      const updated = await prisma.offer.update({ where: { id: offerId }, data: { price: BigInt(newPriceNum), message: newMessage, status: 'PENDING' } })
      await prisma.notification.create({
        data: {
          userId: offer.listing.ownerId,
          type: 'offer_updated',
          title: 'Teklif güncellendi',
          body: offer.listing.title,
          dataJson: JSON.stringify({ listingId: offer.listingId, offerId }),
        },
      })
      return NextResponse.json({ ok: true, status: updated.status })
    }

    return NextResponse.json({ error: 'Desteklenmeyen işlem' }, { status: 400 })
  } catch (e) {
    return NextResponse.json({ error: 'Teklif güncellenirken hata' }, { status: 500 })
  }
}
