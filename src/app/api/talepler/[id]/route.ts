import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: slug } = await context.params
    if (!slug) return NextResponse.json({ error: 'id gerekli' }, { status: 400 })
    const isCode = /^\d{6}$/.test(slug)
    const listing = await prisma.listing.findFirst({
      where: isCode ? { code: slug } : { id: slug },
      include: {
        category: true,
        subCategory: true,
        owner: { select: { id: true, name: true, email: true } },
        offers: {
          select: { id: true, price: true, message: true, createdAt: true, seller: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    })
    if (!listing) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 })
    const images = listing.imagesJson ? JSON.parse(listing.imagesJson) : []
    const price = listing.budget ? Number(listing.budget as any) : null
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
      offers: listing.offers.map((o: any) => ({ id: o.id, price: Number(o.price as any), message: o.message, createdAt: o.createdAt, sellerName: o.seller?.name || 'Teklif Veren' })),
    })
  } catch (e) {
    return NextResponse.json({ error: 'Talep detay getirilirken hata' }, { status: 500 })
  }
}
