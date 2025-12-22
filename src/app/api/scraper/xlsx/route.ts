import { NextResponse } from 'next/server'
import fs from 'node:fs'
import path from 'node:path'
import { getAdminUserId } from '@/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const adminId = await getAdminUserId()
    if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const fp = path.join(process.cwd(), 'import', 'arabam-scraped.xlsx')
    if (!fs.existsSync(fp)) return new NextResponse(null, { status: 404 })
    const buf = fs.readFileSync(fp)
    return new NextResponse(buf, { headers: { 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Content-Disposition': 'attachment; filename="arabam-scraped.xlsx"' } })
  } catch { return new NextResponse(null, { status: 500 }) }
}
