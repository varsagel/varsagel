import { NextResponse } from 'next/server'
import fs from 'node:fs'
import path from 'node:path'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const fp = path.join(process.cwd(), 'import', 'scraper.log')
    if (!fs.existsSync(fp)) return NextResponse.json({ lines: [] })
    const raw = fs.readFileSync(fp, 'utf-8')
    const lines = raw.split(/\r?\n/).slice(-500)
    return NextResponse.json({ lines })
  } catch (e) {
    return NextResponse.json({ lines: [], error: 'read_failed' }, { status: 500 })
  }
}