import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'node:crypto'

async function ensureListingBlockTable() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "ListingBlock" (
      "id" TEXT PRIMARY KEY,
      "listingId" TEXT NOT NULL,
      "ownerId" TEXT NOT NULL,
      "blockedUserId" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE ("listingId", "blockedUserId")
    );
  `)
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ListingBlock_listingId_idx" ON "ListingBlock" ("listingId");`)
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ListingBlock_ownerId_idx" ON "ListingBlock" ("ownerId");`)
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ListingBlock_blockedUserId_idx" ON "ListingBlock" ("blockedUserId");`)
}

async function isBlocked(listingId: string, blockedUserId: string): Promise<boolean> {
  await ensureListingBlockTable()
  const rows = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
    `SELECT "id" FROM "ListingBlock" WHERE "listingId" = $1 AND "blockedUserId" = $2 LIMIT 1`,
    listingId,
    blockedUserId
  )
  return rows.length > 0
}

function startOfLocalDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function toIsoOrNull(d: Date | null) {
  return d ? d.toISOString() : null
}

export async function GET(request: NextRequest) {
  const session = await auth()
  const sellerId = session?.user?.id as string | undefined

  const { searchParams } = new URL(request.url)
  const listingId = String(searchParams.get('listingId') || '').trim()
  const priceParam = searchParams.get('price')
  const priceNum = priceParam !== null && priceParam !== undefined && String(priceParam).trim() !== ''
    ? Number(priceParam)
    : null

  if (!listingId) return NextResponse.json({ error: 'listingId gerekli' }, { status: 400 })

  if (!sellerId) {
    return NextResponse.json({
      canOffer: false,
      reason: 'UNAUTHENTICATED',
      remainingToday: 0,
      nextAllowedAt: null,
      cooldownSecondsRemaining: 0,
    })
  }

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, ownerId: true, status: true, budget: true },
  })
  if (!listing) return NextResponse.json({ canOffer: false, reason: 'NOT_FOUND', remainingToday: 0, nextAllowedAt: null, cooldownSecondsRemaining: 0 }, { status: 404 })

  if (listing.ownerId === sellerId) {
    return NextResponse.json({ canOffer: false, reason: 'OWNER', remainingToday: 0, nextAllowedAt: null, cooldownSecondsRemaining: 0 })
  }

  if (listing.status !== 'OPEN') {
    return NextResponse.json({ canOffer: false, reason: 'NOT_OPEN', remainingToday: 0, nextAllowedAt: null, cooldownSecondsRemaining: 0 })
  }

  if (await isBlocked(listingId, sellerId)) {
    return NextResponse.json({ canOffer: false, reason: 'BLOCKED', remainingToday: 0, nextAllowedAt: null, cooldownSecondsRemaining: 0 })
  }

  const pendingOffer = await prisma.offer.findFirst({
    where: { listingId, sellerId, status: 'PENDING' },
    select: { id: true },
  })
  if (pendingOffer) {
    return NextResponse.json({ canOffer: false, reason: 'PENDING_EXISTS', remainingToday: 0, nextAllowedAt: null, cooldownSecondsRemaining: 0 })
  }

  const now = new Date()
  const dayStart = startOfLocalDay(now)
  const offersToday = await prisma.offer.count({
    where: { listingId, sellerId, createdAt: { gte: dayStart } },
  })
  const remainingToday = Math.max(0, 2 - offersToday)

  if (offersToday >= 2) {
    const nextDay = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)
    return NextResponse.json({
      canOffer: false,
      reason: 'DAILY_LIMIT',
      remainingToday,
      nextAllowedAt: toIsoOrNull(nextDay),
      cooldownSecondsRemaining: 0,
    })
  }

  const last = await prisma.offer.findFirst({
    where: { listingId, sellerId },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true, price: true },
  })

  const cooldownMs = 60 * 60 * 1000
  if (last) {
    const lastAt = new Date(last.createdAt)
    const nextAllowed = new Date(lastAt.getTime() + cooldownMs)
    if (now.getTime() < nextAllowed.getTime()) {
      const remainSec = Math.max(1, Math.ceil((nextAllowed.getTime() - now.getTime()) / 1000))
      return NextResponse.json({
        canOffer: false,
        reason: 'COOLDOWN',
        remainingToday,
        nextAllowedAt: toIsoOrNull(nextAllowed),
        cooldownSecondsRemaining: remainSec,
      })
    }
  }

  const budget =
    typeof listing.budget === 'bigint'
      ? Number(listing.budget)
      : Number(listing.budget || 0)

  if (priceNum !== null && Number.isFinite(priceNum) && budget > 0 && priceNum > budget) {
    const overBudgetExisting = await prisma.offer.findFirst({
      where: { listingId, sellerId, price: { gt: BigInt(budget) } },
      select: { id: true },
    })
    if (overBudgetExisting) {
      return NextResponse.json({
        canOffer: false,
        reason: 'OVER_BUDGET_ONCE',
        remainingToday,
        nextAllowedAt: null,
        cooldownSecondsRemaining: 0,
      })
    }
  }

  return NextResponse.json({
    canOffer: true,
    reason: null,
    remainingToday,
    nextAllowedAt: null,
    cooldownSecondsRemaining: 0,
    token: crypto.randomUUID(),
  })
}
