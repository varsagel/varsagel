export type ListingUrlInput = {
  id: string
  code?: string | null
  title?: string | null
  category?: { slug?: string | null } | string | null
  subCategory?: { slug?: string | null } | string | null
  subcategory?: string | null
}

const TR_MAP: Record<string, string> = {
  ç: 'c',
  Ç: 'c',
  ğ: 'g',
  Ğ: 'g',
  ı: 'i',
  I: 'i',
  İ: 'i',
  ö: 'o',
  Ö: 'o',
  ş: 's',
  Ş: 's',
  ü: 'u',
  Ü: 'u',
}

export function slugifyTR(value: string): string {
  const normalized = value
    .split('')
    .map((ch) => TR_MAP[ch] ?? ch)
    .join('')
    .toLowerCase()

  return normalized
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function pickSlug(input: ListingUrlInput['category'] | ListingUrlInput['subCategory'] | ListingUrlInput['subcategory']): string {
  if (!input) return ''
  if (typeof input === 'string') return input
  return input.slug ?? ''
}

function pickIdOrCode(listing: ListingUrlInput): string {
  const code = listing.code ? String(listing.code).trim() : ''
  if (code && /^\d+$/.test(code)) return code
  return listing.id
}

export function buildListingSlug(listing: ListingUrlInput): string {
  const categorySlug = pickSlug(listing.category)
  const subSlug = pickSlug(listing.subCategory ?? listing.subcategory)
  const titleSlug = listing.title ? slugifyTR(listing.title) : ''
  const idPart = pickIdOrCode(listing)

  const parts = [categorySlug, subSlug, titleSlug].filter(Boolean).join('-')
  return parts ? `${parts}-${idPart}` : idPart
}

export function listingHref(listing: ListingUrlInput): string {
  return `/talep/${buildListingSlug(listing)}`
}

export type ListingIdentifier = { id?: string; code?: string }

export function parseListingIdentifier(param: string): ListingIdentifier {
  const raw = decodeURIComponent(String(param || '')).trim()
  if (!raw) return {}

  if (/^\d{6}$/.test(raw)) return { code: raw }
  if (/^c[a-z0-9]{24}$/.test(raw)) return { id: raw }

  const codeMatch = raw.match(/-(\d{6})$/)
  if (codeMatch) return { code: codeMatch[1] }

  const idMatch = raw.match(/-(c[a-z0-9]{24})$/)
  if (idMatch) return { id: idMatch[1] }

  return { id: raw }
}
