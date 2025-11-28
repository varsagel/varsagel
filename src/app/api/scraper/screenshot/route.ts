import { NextResponse } from 'next/server'
import fs from 'node:fs'
import path from 'node:path'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const name = url.searchParams.get('name') || ''
    const fp = path.join(process.cwd(), 'import', 'screenshots', name)
    if (!name || !fs.existsSync(fp)) return new NextResponse(null, { status: 404 })
    const buf = fs.readFileSync(fp)
    return new NextResponse(buf, { headers: { 'Content-Type': 'image/png' } })
  } catch { return new NextResponse(null, { status: 500 }) }
}