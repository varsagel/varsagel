import { NextResponse } from 'next/server'
import fs from 'node:fs'
import path from 'node:path'
import { getAdminUserId } from '@/auth'
import { readCsvRowsCached } from '@/lib/file-cache'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const adminId = await getAdminUserId()
    if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const url = new URL(req.url)
    const brand = (url.searchParams.get('brand') || '').toLowerCase()
    const fp = path.join(process.cwd(), 'import', 'arabam-scraped.csv')
    if (!fs.existsSync(fp)) return NextResponse.json({ rows: [], count: 0 })
    const parsed = readCsvRowsCached(fp, 2000, 200000)
    const out = brand ? parsed.rows.filter((r) => r.brand.toLowerCase() === brand) : parsed.rows
    return NextResponse.json({ rows: out, count: out.length, header: parsed.header })
  } catch {
    return NextResponse.json({ rows: [], count: 0 }, { status: 500 })
  }
}
