import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = (searchParams.get('id') || '').trim()
    if (!slug) return NextResponse.json({ error: 'id gerekli' }, { status: 400 })
    const isCode = /^\d{6}$/.test(slug)
  const listing = await prisma.listing.findFirst({
      where: isCode ? { code: slug } : { id: slug },
      include: {
        category: true,
        subCategory: true,
        owner: { select: { id: true, name: true, email: true } },
        offers: {
          select: { id: true, price: true, message: true, createdAt: true, status: true, sellerId: true, seller: { select: { name: true, email: true } } },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    })
    if (!listing) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 })
    const accepted = await prisma.offer.findFirst({ where: { listingId: listing.id, status: 'ACCEPTED' }, include: { seller: { select: { id: true, name: true, email: true } } }, orderBy: { updatedAt: 'desc' } })
    const images = listing.imagesJson ? JSON.parse(listing.imagesJson) : []
    const price = listing.budget ? Number(listing.budget as any) : null
    const attributes = listing.attributesJson ? JSON.parse(listing.attributesJson) : {}
    return NextResponse.json({
      id: listing.id,
      code: listing.code,
      title: listing.title,
      description: listing.description,
      price,
      category: { slug: listing.category.slug, name: listing.category.name },
      subCategory: listing.subCategory ? { slug: listing.subCategory.slug, name: listing.subCategory.name } : null,
      owner: listing.owner,
      location: { city: listing.city || '', district: listing.district || '' },
      createdAt: listing.createdAt,
      images,
      attributes,
      offers: listing.offers.map((o: any) => ({ id: o.id, price: Number(o.price as any), message: o.message, createdAt: o.createdAt, status: o.status, sellerId: o.sellerId, sellerName: o.seller?.name || 'Satıcı', sellerEmail: o.seller?.email || '' })),
      acceptedOffer: accepted ? { id: accepted.id, price: Number(accepted.price as any), message: accepted.message, createdAt: accepted.createdAt, sellerId: accepted.sellerId, sellerName: accepted.seller?.name || 'Satıcı', sellerEmail: accepted.seller?.email || '', attributes: accepted.attributesJson ? JSON.parse(accepted.attributesJson) : {} } : null,
    })
  } catch (e) {
    return NextResponse.json({ error: 'İlan detay getirilirken hata' }, { status: 500 })
  }
}
