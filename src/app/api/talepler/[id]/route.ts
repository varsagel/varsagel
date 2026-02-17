import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

type ListingPayload = Prisma.ListingGetPayload<{
  include: {
    category: true
    subCategory: true
    owner: { select: { id: true; name: true; email: true } }
    offers: {
      select: {
        id: true
        price: true
        body: true
        createdAt: true
        seller: { select: { name: true } }
      }
      orderBy: { createdAt: 'desc' }
      take: 5
    }
  }
}>

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const parseJsonArray = (text: string | null) => {
      try {
        const parsed = text ? JSON.parse(text) : [];
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    };

    const { id: slug } = await context.params
    if (!slug) return NextResponse.json({ error: 'id gerekli' }, { status: 400 })
    const isCode = /^\d{6}$/.test(slug) || /^\d{9}$/.test(slug)
    const listing = await prisma.listing.findFirst({
      where: isCode ? { code: slug } : { id: slug },
      include: {
        category: true,
        subCategory: true,
        owner: { select: { id: true, name: true, email: true } },
        offers: {
          select: { id: true, price: true, body: true, createdAt: true, seller: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    }) as ListingPayload | null
    if (!listing) return NextResponse.json({ error: 'Bulunamadı' }, { status: 404 })
    const images = parseJsonArray(listing.imagesJson)
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
      offers: listing.offers.map((o) => ({ id: o.id, price: Number(o.price as any), message: o.body, createdAt: o.createdAt, sellerName: o.seller?.name || 'Teklif Veren' })),
    })
  } catch {
    return NextResponse.json({ error: 'Talep detay getirilirken hata' }, { status: 500 })
  }
}
