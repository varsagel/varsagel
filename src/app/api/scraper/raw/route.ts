import { NextResponse } from 'next/server'
import fs from 'node:fs'
import path from 'node:path'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const brand = (url.searchParams.get('brand') || '').toLowerCase()
    const fp = path.join(process.cwd(), 'import', 'arabam-scraped.csv')
    if (!fs.existsSync(fp)) return NextResponse.json({ rows: [], count: 0 })
    const raw = fs.readFileSync(fp, 'utf-8')
    const lines = raw.split(/\r?\n/).filter(Boolean)
    const header = lines.shift() || ''
    const out: Array<{category:string,brand:string,model:string,series:string,trim:string}> = []
    for (const line of lines) {
      const parts = line.split(',').map(s=> s.trim())
      const [cat,b,m,s,t] = [parts[0]||'',parts[1]||'',parts[2]||'',parts[3]||'',parts[4]||'']
      if (!cat || !b) continue
      if (brand && b.toLowerCase() !== brand) continue
      out.push({ category:cat, brand:b, model:m, series:s, trim:t })
    }
    return NextResponse.json({ rows: out, count: out.length, header })
  } catch (e) {
    return NextResponse.json({ rows: [], count: 0 }, { status: 500 })
  }
}