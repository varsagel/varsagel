import { NextResponse } from 'next/server'
import path from 'node:path'
import { getAdminUserId } from '@/auth'
import { readJsonFileCached } from '@/lib/file-cache'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function readGenerated() {
  const fp = path.join(process.cwd(), 'src', 'data', 'generated-automobil.json')
  return readJsonFileCached<any>(fp, { modelSeries: { 'vasita/otomobil': {} }, seriesTrims: { 'vasita/otomobil': {} } }, 5000)
}

function sortTr(a: string, b: string) {
  return a.localeCompare(b, 'tr')
}

export async function GET(req: Request) {
  const adminId = await getAdminUserId()
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const brand = url.searchParams.get('brand') || ''
  const model = url.searchParams.get('model') || ''
  const series = url.searchParams.get('series') || ''
  const data = readGenerated()
  const ms = (data?.modelSeries?.['vasita/otomobil'] || {}) as Record<string, Record<string, string[]>>
  const st = (data?.seriesTrims?.['vasita/otomobil'] || {}) as Record<string, Record<string, Record<string, string[]>>>

  if (brand && model && series) {
    const trims = (((st[brand] || {})[model] || {})[series] || []).slice().sort(sortTr)
    return NextResponse.json({ trims })
  }
  if (brand && model) {
    const seriesArr = (((ms[brand] || {})[model] || []) as string[]).slice().sort(sortTr)
    return NextResponse.json({ series: seriesArr })
  }
  if (brand) {
    const models = Object.keys(ms[brand] || {}).slice().sort(sortTr)
    return NextResponse.json({ models })
  }
  const brands = Object.keys(ms || {}).slice().sort(sortTr)
  return NextResponse.json({ brands })
}
