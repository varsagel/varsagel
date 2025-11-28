import type { MetadataRoute } from 'next'
import { CATEGORIES } from '@/data/categories'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const pages: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: new Date() },
    { url: `${base}/ilan-ver`, lastModified: new Date() },
  ]

  CATEGORIES.forEach(cat => {
    pages.push({ url: `${base}/kategori/${cat.slug}`, lastModified: new Date() })
    cat.subcategories.forEach(sub => {
      pages.push({ url: `${base}/kategori/${cat.slug}/${sub.slug}`, lastModified: new Date() })
    })
  })

  return pages
}
