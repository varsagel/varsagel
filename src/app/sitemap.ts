import type { MetadataRoute } from 'next'
import { CATEGORIES } from '@/data/categories'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.varsagel.com'
  const now = new Date()

  const pages: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now },
    { url: `${base}/talep-olustur`, lastModified: now },
    { url: `${base}/iletisim`, lastModified: now },
    { url: `${base}/sss`, lastModified: now },
    { url: `${base}/kurumsal/gizlilik-politikasi`, lastModified: now },
    { url: `${base}/kurumsal/kullanim-kosullari`, lastModified: now },
    { url: `${base}/kurumsal/kvkk`, lastModified: now },
  ]

  CATEGORIES.forEach(cat => {
    pages.push({ url: `${base}/kategori/${cat.slug}`, lastModified: now })
    cat.subcategories.forEach(sub => {
      pages.push({ url: `${base}/kategori/${cat.slug}/${sub.slug}`, lastModified: now })
    })
  })

  const listings = await prisma.listing.findMany({
    where: { status: 'OPEN' },
    select: { id: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
    take: 1000,
  })

  listings.forEach((listing) => {
    pages.push({
      url: `${base}/talep/${listing.id}`,
      lastModified: listing.updatedAt,
    })
  })

  return pages
}
