import type { MetadataRoute } from 'next'
import { CATEGORIES } from '@/data/categories'
import { prisma } from '@/lib/prisma'
import { buildListingSlug } from '@/lib/listing-url'

const PAGE_SIZE = 50000

const priorityForListing = (updatedAt: Date) => {
  const ageDays = (Date.now() - updatedAt.getTime()) / 86400000
  if (ageDays <= 7) return 0.8
  if (ageDays <= 30) return 0.6
  return 0.4
}

export async function generateSitemaps() {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return [{ id: 0 }]
  }
  try {
    const total = await prisma.listing.count({ where: { status: 'OPEN' } })
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))
    const ids = [{ id: 0 }]
    for (let i = 1; i <= pages; i++) ids.push({ id: i })
    return ids
  } catch {
    return [{ id: 0 }]
  }
}

export default async function sitemap(
  { id }: { id: number }
): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.varsagel.com'
  const now = new Date()
  const pageId = Number(id)
  const normalizedId = Number.isFinite(pageId) ? pageId : 0

  if (normalizedId <= 0) {
    const pages: MetadataRoute.Sitemap = [
      { url: `${base}/`, lastModified: now, priority: 1 },
      { url: `${base}/talep-olustur`, lastModified: now, priority: 0.9 },
      { url: `${base}/iletisim`, lastModified: now, priority: 0.4 },
      { url: `${base}/sss`, lastModified: now, priority: 0.4 },
      { url: `${base}/kurumsal/gizlilik-politikasi`, lastModified: now, priority: 0.3 },
      { url: `${base}/kurumsal/kullanim-kosullari`, lastModified: now, priority: 0.3 },
      { url: `${base}/kurumsal/kvkk`, lastModified: now, priority: 0.3 },
    ]

    const pushSubcategories = (categorySlug: string, subs: Array<{ slug: string; fullSlug?: string; subcategories?: any[] }>) => {
      subs.forEach((sub) => {
        const slugPath = (sub.fullSlug || sub.slug || "").trim();
        if (slugPath) {
          pages.push({ url: `${base}/kategori/${categorySlug}/${slugPath}`, lastModified: now, priority: 0.6 })
        }
        if (Array.isArray(sub.subcategories) && sub.subcategories.length > 0) {
          pushSubcategories(categorySlug, sub.subcategories)
        }
      })
    }

    CATEGORIES.forEach(cat => {
      pages.push({ url: `${base}/kategori/${cat.slug}`, lastModified: now, priority: 0.7 })
      pushSubcategories(cat.slug, cat.subcategories || [])
    })

    return pages
  }

  if (process.env.NEXT_PHASE === 'phase-production-build') return []

  const skip = (normalizedId - 1) * PAGE_SIZE
  let listings: Array<{
    id: string
    code: string | null
    title: string
    updatedAt: Date
    category: { slug: string } | null
    subCategory: { slug: string } | null
  }> = []
  try {
    listings = await prisma.listing.findMany({
      where: { status: 'OPEN' },
      select: {
        id: true,
        code: true,
        title: true,
        updatedAt: true,
        category: { select: { slug: true } },
        subCategory: { select: { slug: true } },
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: PAGE_SIZE,
    })
  } catch {
    return []
  }

  return listings.map((listing) => {
    const slug = buildListingSlug({
      id: listing.id,
      code: listing.code,
      title: listing.title,
      category: listing.category,
      subCategory: listing.subCategory,
    })
    return {
      url: `${base}/talep/${slug}`,
      lastModified: listing.updatedAt,
      priority: priorityForListing(listing.updatedAt),
    }
  })
}
