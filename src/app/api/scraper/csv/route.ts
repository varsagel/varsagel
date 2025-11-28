import { NextResponse } from 'next/server'
import fs from 'node:fs'
import path from 'node:path'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const fp = path.join(process.cwd(), 'import', 'arabam-scraped.csv')
    if (!fs.existsSync(fp)) return new NextResponse('category,brand,model,series,trim\n', { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="arabam-scraped.csv"' } })
    const buf = fs.readFileSync(fp)
    return new NextResponse(buf, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="arabam-scraped.csv"' } })
  } catch {
    return new NextResponse('category,brand,model,series,trim\n', { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="arabam-scraped.csv"' } })
  }
}