import { NextResponse } from 'next/server'
import { BRAND_MODELS, EXTRA_BRANDS_AUTOMOBIL } from '@/data/attribute-overrides'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const base = Object.keys(BRAND_MODELS['vasita/otomobil'] || {})
  const extras = EXTRA_BRANDS_AUTOMOBIL || []
  const set = new Set<string>([...base, ...extras])
  const list = Array.from(set).sort((a,b)=> a.localeCompare(b,'tr'))
  return NextResponse.json({ brands: list })
}