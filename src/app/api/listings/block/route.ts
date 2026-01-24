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
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE ("listingId", "blockedUserId")
    );
  `)
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ListingBlock_listingId_idx" ON "ListingBlock" ("listingId");`)
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ListingBlock_ownerId_idx" ON "ListingBlock" ("ownerId");`)
  await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ListingBlock_blockedUserId_idx" ON "ListingBlock" ("blockedUserId");`)
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const listingId = String(body?.listingId || '').trim()
  const blockedUserId = String(body?.blockedUserId || '').trim()
  if (!listingId || !blockedUserId) return NextResponse.json({ error: 'listingId ve blockedUserId gerekli' }, { status: 400 })

  const listing = await prisma.listing.findUnique({ where: { id: listingId }, select: { id: true, ownerId: true } })
  if (!listing) return NextResponse.json({ error: 'Talep bulunamadı' }, { status: 404 })
  if (listing.ownerId !== session.user.id) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })

  await ensureListingBlockTable()

  const id = crypto.randomUUID()
  await prisma.$executeRawUnsafe(
    `INSERT INTO "ListingBlock" ("id","listingId","ownerId","blockedUserId") VALUES ($1,$2,$3,$4)
     ON CONFLICT ("listingId","blockedUserId") DO UPDATE SET "ownerId" = EXCLUDED."ownerId"`,
    id,
    listingId,
    session.user.id,
    blockedUserId
  )

  return NextResponse.json({ ok: true })
}

export async function DELETE(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const listingId = String(searchParams.get('listingId') || '').trim()
  const blockedUserId = String(searchParams.get('blockedUserId') || '').trim()
  if (!listingId || !blockedUserId) return NextResponse.json({ error: 'listingId ve blockedUserId gerekli' }, { status: 400 })

  const listing = await prisma.listing.findUnique({ where: { id: listingId }, select: { id: true, ownerId: true } })
  if (!listing) return NextResponse.json({ error: 'Talep bulunamadı' }, { status: 404 })
  if (listing.ownerId !== session.user.id) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })

  await ensureListingBlockTable()
  await prisma.$executeRawUnsafe(`DELETE FROM "ListingBlock" WHERE "listingId" = $1 AND "blockedUserId" = $2`, listingId, blockedUserId)

  return NextResponse.json({ ok: true })
}

