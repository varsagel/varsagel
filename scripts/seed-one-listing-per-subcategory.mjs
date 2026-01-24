import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

const prisma = new PrismaClient()

const DEFAULT_OWNER_EMAIL = process.env.DEMO_OWNER_EMAIL || 'demo@varsagel.local'
const DEFAULT_OWNER_NAME = process.env.DEMO_OWNER_NAME || 'Demo Kullanıcı'

const DEFAULT_CITY = process.env.DEMO_CITY || 'İstanbul'
const DEFAULT_DISTRICT = process.env.DEMO_DISTRICT || 'Kadıköy'

let cachedAttrSchemas = null

function pad6(n) {
  return String(n).padStart(6, '0')
}

async function loadAttrSchemas() {
  if (cachedAttrSchemas) return cachedAttrSchemas
  const filePath = path.resolve(process.cwd(), 'src/data/xlsx-attr-schemas.json')
  const raw = await readFile(filePath, 'utf-8')
  cachedAttrSchemas = JSON.parse(raw)
  return cachedAttrSchemas
}

function normalizeSlug(raw) {
  return String(raw || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim()
}

function normalizeSubSlug(slug) {
  const value = String(slug || '').trim()
  if (value.includes('/')) return value.split('/').filter(Boolean).join('-')
  return value
}

function normalizeKey(categorySlug, raw) {
  const key = String(raw || '').trim()
  if (categorySlug === 'vasita') {
    if (key === 'motor-seri') return 'seri'
    if (key === 'donanim-paket') return 'paket'
  }
  return key
}

function mapOverrideFields(categorySlug, key, schema) {
  return schema.map((f, index) => ({
    id: `${key}:${index}`,
    name: f.label,
    slug: normalizeKey(categorySlug, f.key || f.slug || f.label),
    type: f.type,
    options: Array.isArray(f.options) ? f.options : [],
    required: !!f.required,
    order: index,
    showInOffer: true,
    showInRequest: true,
    minKey: f.minKey,
    maxKey: f.maxKey,
    min: f.min,
    max: f.max,
  }))
}

async function getMergedFields(category, subCategory) {
  const attrSchemas = await loadAttrSchemas()
  const normalizedSubSlug = normalizeSubSlug(subCategory?.slug)
  const keyCandidates = [
    normalizedSubSlug ? `${category.slug}/${normalizedSubSlug}` : '',
    subCategory?.slug ? `${category.slug}/${subCategory.slug}` : '',
    category.slug,
  ].filter(Boolean)

  let overrideFields = null
  for (const key of keyCandidates) {
    const schema = attrSchemas?.[key]
    if (Array.isArray(schema) && schema.length > 0) {
      overrideFields = mapOverrideFields(category.slug, key, schema)
      break
    }
  }

  const subCategoryId = subCategory?.id || null
  const subcategoryRequested = !!subCategory?.slug
  const dbAttrs = await prisma.categoryAttribute.findMany({
    where: {
      categoryId: category.id,
      ...(subCategoryId
        ? { OR: [{ subCategoryId: null }, { subCategoryId }] }
        : subcategoryRequested
          ? { subCategoryId: null }
          : {}),
    },
    orderBy: [{ subCategoryId: 'asc' }, { order: 'asc' }],
  })

  const dbMapped = dbAttrs.map((a) => ({
    id: a.id,
    name: a.name,
    slug: a.slug,
    type: a.type,
    options: (() => {
      try {
        const parsed = a.optionsJson ? JSON.parse(a.optionsJson) : []
        return Array.isArray(parsed) ? parsed : []
      } catch {
        return []
      }
    })(),
    required: a.required,
    order: a.order,
    showInOffer: a.showInOffer,
    showInRequest: a.showInRequest,
    subCategoryId: a.subCategoryId,
  }))

  if (overrideFields && overrideFields.length > 0) {
    if (dbMapped.length === 0) return overrideFields
    const dbBySlug = new Map(dbMapped.map((a) => [normalizeSlug(a.slug), a]))
    const merged = overrideFields.map((o) => {
      const db = dbBySlug.get(normalizeSlug(o.slug))
      if (!db) return o
      return {
        ...o,
        required: db.required,
        showInOffer: db.showInOffer,
        showInRequest: db.showInRequest,
        type: o.type || db.type,
        options: o.options?.length ? o.options : db.options,
      }
    })
    const seen = new Set(merged.map((o) => normalizeSlug(o.slug)))
    const missingRequired = dbMapped.filter((a) => a.required && !seen.has(normalizeSlug(a.slug)))
    const missingOptional = dbMapped.filter((a) => !a.required && !seen.has(normalizeSlug(a.slug)))
    return [
      ...missingRequired.sort((a, b) => (a.order || 0) - (b.order || 0)),
      ...merged,
      ...missingOptional.sort((a, b) => (a.order || 0) - (b.order || 0)),
    ]
  }

  return dbMapped
}

function buildAttributes(fields, mode) {
  const attributes = {}
  for (const field of fields) {
    if (mode === 'request' && field.showInRequest === false) continue
    if (mode === 'offer' && field.showInOffer === false) continue

    const key = field.slug || field.key || field.name
    if (!key) continue

    const type = String(field.type || '').toLowerCase()
    if (type.startsWith('range')) {
      const baseKey = String(key)
      const minKey = field.minKey || `${baseKey}Min`
      const maxKey = field.maxKey || `${baseKey}Max`
      const minValue = Number.isFinite(field.min) ? Number(field.min) : 1
      const maxValue = Number.isFinite(field.max) ? Number(field.max) : minValue + 1
      attributes[minKey] = minValue
      attributes[maxKey] = maxValue
      continue
    }

    if (type === 'number') {
      attributes[key] = Number.isFinite(field.min) ? Number(field.min) : 1
      continue
    }

    if (type === 'boolean') {
      attributes[key] = true
      continue
    }

    if (type === 'select') {
      const options = Array.isArray(field.options) ? field.options : []
      attributes[key] = options[0] ?? 'Seçenek'
      continue
    }

    if (type === 'multiselect') {
      const options = Array.isArray(field.options) ? field.options : []
      attributes[key] = options.length > 0 ? [options[0]] : ['Seçenek']
      continue
    }

    attributes[key] = `${field.name || key} Test`
  }
  return attributes
}

async function getOrCreateOwner() {
  const existing = await prisma.user.findFirst({
    where: { email: DEFAULT_OWNER_EMAIL },
    orderBy: { createdAt: 'asc' },
  })
  if (existing) return existing

  const bcrypt = await import('bcrypt')
  const passwordHash = await bcrypt.hash('123456', 10)
  return prisma.user.create({
    data: {
      email: DEFAULT_OWNER_EMAIL,
      name: DEFAULT_OWNER_NAME,
      role: 'ADMIN',
      passwordHash,
      phone: '5555555555',
    },
  })
}

async function clearAllListings() {
  const deletedOffers = await prisma.offer.deleteMany({})
  const deletedMessages = await prisma.message.deleteMany({})
  const deletedFavorites = await prisma.favorite.deleteMany({})
  const deletedQuestions = await prisma.question.deleteMany({})
  const deletedReports = await prisma.report.deleteMany({})
  const deletedListings = await prisma.listing.deleteMany({})

  return {
    deletedOffers: deletedOffers.count,
    deletedMessages: deletedMessages.count,
    deletedFavorites: deletedFavorites.count,
    deletedQuestions: deletedQuestions.count,
    deletedReports: deletedReports.count,
    deletedListings: deletedListings.count,
  }
}

async function seed() {
  console.log('Seeding başlıyor…')
  console.log(`DB: ${process.env.DATABASE_URL ? 'DATABASE_URL set' : 'DATABASE_URL missing'}`)

  const owner = await getOrCreateOwner()
  console.log(`Owner: ${owner.email || owner.id}`)

  const before = await prisma.listing.count()
  const beforeSub = await prisma.subCategory.count()
  const beforeCat = await prisma.category.count()
  console.log(`Önce: ${beforeCat} kategori, ${beforeSub} alt kategori, ${before} talep`)

  const cleared = await clearAllListings()
  console.log('Silinenler:', cleared)

  const subcategories = await prisma.subCategory.findMany({
    include: { category: true },
    orderBy: [{ category: { slug: 'asc' } }, { slug: 'asc' }],
  })

  if (subcategories.length === 0) {
    console.log('Alt kategori yok. Talep oluşturulmadı.')
    return
  }

  const startCode = 100000
  const budgetBase = 25_000n
  const budgetStep = 1_000n

  let created = 0
  for (let i = 0; i < subcategories.length; i++) {
    const sub = subcategories[i]
    const category = sub.category

    const code = pad6(startCode + i)
    const title = `Deneme Talebi - ${category.name} / ${sub.name}`
    const description = `Bu talep otomatik olarak test amaçlı oluşturulmuştur.\n\nKategori: ${category.name}\nAlt Kategori: ${sub.name}\nŞehir: ${DEFAULT_CITY}\nİlçe: ${DEFAULT_DISTRICT}`
    const fields = await getMergedFields(category, sub)
    const attributes = buildAttributes(fields, 'request')

    await prisma.listing.create({
      data: {
        code,
        title,
        description,
        status: 'OPEN',
        budget: budgetBase + budgetStep * BigInt(i),
        city: DEFAULT_CITY,
        district: DEFAULT_DISTRICT,
        imagesJson: JSON.stringify([]),
        attributesJson: JSON.stringify(attributes),
        manualAttributeKeys: [],
        categoryId: category.id,
        subCategoryId: sub.id,
        ownerId: owner.id,
      },
    })

    created++
    if (created % 50 === 0) console.log(`Oluşturuldu: ${created}/${subcategories.length}`)
  }

  const after = await prisma.listing.count()
  console.log(`Sonra: ${after} talep (oluşturulan: ${created})`)
}

seed()
  .catch((e) => {
    console.error('Seed hata:', e)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
