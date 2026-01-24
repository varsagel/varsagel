import { NextResponse } from 'next/server'
import { getBrands } from '@/lib/vehicle-data'
import { getAdminUserId } from '@/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const adminId = await getAdminUserId()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const brands = getBrands('vasita/otomobil')
  return NextResponse.json({ brands })
}
